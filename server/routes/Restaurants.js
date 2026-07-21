const express = require('express');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { authenticate, roleGuard } = require('../middleware/auth');

const router = express.Router();

// Saare restaurants dhundo (customer ke liye)
router.get('/', async (req, res) => {
  try {
    const { q, cuisine, lat, lng } = req.query;
    let query = { isActive: true };

    if (q) query.$text = { $search: q };
    if (cuisine) query.cuisine = { $in: [cuisine] };

    let restaurants;

    if (lat && lng) {
      restaurants = await Restaurant.find({
        ...query,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: 10000
          }
        }
      }).populate('owner', 'name');
    } else {
      restaurants = await Restaurant.find(query).populate('owner', 'name').limit(20);
    }

    res.json({ success: true, restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Single restaurant + menu
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'name');
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant nahi mila' });

    const menuItems = await MenuItem.find({ restaurant: req.params.id, isAvailable: true });
    res.json({ success: true, restaurant, menuItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Restaurant create karo (sirf restaurant owner)
router.post('/', authenticate, roleGuard('restaurant', 'admin'), async (req, res) => {
  try {
    const { name, description, cuisine, address, phone, deliveryTime, minOrder } = req.body;
    const restaurant = await Restaurant.create({
      owner: req.user.id,
      name, description, cuisine, address, phone, deliveryTime, minOrder
    });
    res.status(201).json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Menu item add karo
router.post('/:id/menu', authenticate, roleGuard('restaurant', 'admin'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant nahi mila' });
    if (restaurant.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Tumhara restaurant nahi hai' });
    }

    const { name, description, price, category, isVeg } = req.body;
    const menuItem = await MenuItem.create({
      restaurant: req.params.id,
      name, description, price, category, isVeg
    });

    res.status(201).json({ success: true, menuItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Menu item update karo
router.patch('/menu/:itemId', authenticate, roleGuard('restaurant', 'admin'), async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(req.params.itemId, req.body, { new: true });
    res.json({ success: true, menuItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// Restaurant owner ka dashboard data
router.get('/owner/dashboard', authenticate, roleGuard('restaurant', 'admin'), async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant nahi mila' });

    const Order = require('../models/Order');

    // Aaj ke orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalOrders, todayOrders, pendingOrders, allOrders] = await Promise.all([
      Order.countDocuments({ restaurant: restaurant._id }),
      Order.countDocuments({ restaurant: restaurant._id, createdAt: { $gte: today } }),
      Order.countDocuments({ restaurant: restaurant._id, status: { $in: ['pending', 'confirmed', 'preparing'] } }),
      Order.find({ restaurant: restaurant._id }).populate('customer', 'name phone').sort({ createdAt: -1 }).limit(20),
    ]);

    // Total revenue
    const revenueData = await Order.aggregate([
      { $match: { restaurant: restaurant._id, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Last 7 days revenue chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyRevenue = await Order.aggregate([
      { $match: { restaurant: restaurant._id, paymentStatus: 'paid', createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      restaurant,
      stats: {
        totalOrders,
        todayOrders,
        pendingOrders,
        totalRevenue: revenueData[0]?.total || 0,
      },
      dailyRevenue,
      recentOrders: allOrders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Order status update (restaurant owner)
router.patch('/owner/orders/:orderId/status', authenticate, roleGuard('restaurant', 'admin'), async (req, res) => {
  try {
    const Order = require('../models/Order');
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    ).populate('customer', 'name phone');
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;