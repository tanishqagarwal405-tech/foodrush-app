const express = require('express');
const Coupon = require('../models/Coupon');
const { authenticate, roleGuard } = require('../middleware/auth');

const router = express.Router();

// Coupon apply karo
router.post('/apply', authenticate, async (req, res) => {
  try {
    const { code, orderAmount, restaurantId } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon nahi mila!' });

    // Validity check
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTill) {
      return res.status(400).json({ success: false, message: 'Coupon expire ho gaya!' });
    }

    // Min order check
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum ₹${coupon.minOrderAmount} ka order chahiye!`
      });
    }

    // Usage limit check
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon ki limit khatam ho gayi!' });
    }

    // Already used check
    if (coupon.usedBy.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Ye coupon already use kar chuke ho!' });
    }

    // Restaurant check
    if (coupon.applicableRestaurants.length > 0 &&
        !coupon.applicableRestaurants.includes(restaurantId)) {
      return res.status(400).json({ success: false, message: 'Ye coupon is restaurant pe apply nahi hoga!' });
    }

    // Discount calculate karo
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((orderAmount * coupon.discountValue) / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, orderAmount);

    res.json({
      success: true,
      message: `🎉 Coupon applied! ₹${discount} ki bachat!`,
      discount,
      finalAmount: orderAmount - discount,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Coupon use mark karo (order place hone pe)
router.post('/use', authenticate, async (req, res) => {
  try {
    const { code } = req.body;
    await Coupon.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 }, $push: { usedBy: req.user.id } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Saare active coupons dekho (customer ke liye)
router.get('/', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validTill: { $gte: now },
      validFrom: { $lte: now },
    }).select('-usedBy');
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Coupon banao
router.post('/', authenticate, roleGuard('admin'), async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Ye coupon code already exist karta hai!' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;