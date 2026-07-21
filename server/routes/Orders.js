const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { authenticate, roleGuard } = require('../middleware/auth');

const router = express.Router();

// Order place karo (customer)
router.post('/', authenticate, roleGuard('customer'), async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress } = req.body;

    // Server side price calculate karo — client pe trust mat karo!
    const menuItemIds = items.map(i => i.menuItemId);
    const dbItems = await MenuItem.find({ _id: { $in: menuItemIds } });

    let totalAmount = 0;
    const orderItems = items.map(item => {
      const dbItem = dbItems.find(d => d._id.toString() === item.menuItemId);
      if (!dbItem) throw new Error(`Item nahi mila: ${item.menuItemId}`);
      totalAmount += dbItem.price * item.quantity;
      return {
        menuItem: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        quantity: item.quantity,
        image: dbItem.image,
      };
    });

    const order = await Order.create({
      customer: req.user.id,
      restaurant: restaurantId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      status: 'pending',
      paymentStatus: 'pending',
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Apne orders dekho (customer)
router.get('/my', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('restaurant', 'name image')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Restaurant ke orders (restaurant owner)
router.get('/restaurant/:restaurantId', authenticate, roleGuard('restaurant', 'admin'), async (req, res) => {
  try {
    const orders = await Order.find({ restaurant: req.params.restaurantId })
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Order status update karo (restaurant/delivery)
router.patch('/:id/status', authenticate, roleGuard('restaurant', 'delivery', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('customer', 'name email');
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delivery partner ke liye available orders
router.get('/delivery/available', authenticate, roleGuard('delivery', 'admin'), async (req, res) => {
  try {
    const orders = await Order.find({ status: 'preparing' })
      .populate('restaurant', 'name address phone')
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delivery partner ke assigned orders
router.get('/delivery/my', authenticate, roleGuard('delivery', 'admin'), async (req, res) => {
  try {
    const orders = await Order.find({ deliveryPartner: req.user.id })
      .populate('restaurant', 'name address phone')
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Order pick karo (delivery partner)
router.patch('/:id/pick', authenticate, roleGuard('delivery', 'admin'), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryPartner: req.user.id, status: 'picked' },
      { new: true }
    ).populate('restaurant', 'name address').populate('customer', 'name phone address');
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Order deliver karo
router.patch('/:id/deliver', authenticate, roleGuard('delivery', 'admin'), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'delivered' },
      { new: true }
    );
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// COD order place karo
router.post('/cod', authenticate, roleGuard('customer'), async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, couponCode } = req.body;

    const menuItemIds = items.map(i => i.menuItemId);
    const dbItems = await MenuItem.find({ _id: { $in: menuItemIds } });

    let totalAmount = 0;
    const orderItems = items.map(item => {
      const dbItem = dbItems.find(d => d._id.toString() === item.menuItemId);
      if (!dbItem) throw new Error(`Item nahi mila: ${item.menuItemId}`);
      totalAmount += dbItem.price * item.quantity;
      return {
        menuItem: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        quantity: item.quantity,
        image: dbItem.image,
      };
    });

    const order = await Order.create({
      customer: req.user.id,
      restaurant: restaurantId,
      items: orderItems,
      totalAmount,
      deliveryAddress,
      status: 'confirmed',
      paymentStatus: 'pending',
      paymentMethod: 'cod',
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;