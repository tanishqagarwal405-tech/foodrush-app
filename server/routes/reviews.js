const express = require('express');
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const { authenticate, roleGuard } = require('../middleware/auth');

const router = express.Router();

// Review submit karo
router.post('/', authenticate, roleGuard('customer'), async (req, res) => {
  try {
    const { restaurantId, orderId, rating, comment } = req.body;

    // Order check karo — sirf delivered order pe review ho sakta hai
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order nahi mila' });
    if (order.status !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Sirf delivered order pe review de sakte ho' });
    }
    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Ye tumhara order nahi hai' });
    }

    // Review banao
    const review = await Review.create({
      customer: req.user.id,
      restaurant: restaurantId,
      order: orderId,
      rating,
      comment,
    });

    // Restaurant ka average rating update karo
    const allReviews = await Review.find({ restaurant: restaurantId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: Math.round(avgRating * 10) / 10,
      totalRatings: allReviews.length,
    });

    await review.populate('customer', 'name profileImage');
    res.status(201).json({ success: true, review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Is order pe already review de chuke ho' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Restaurant ke saare reviews
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate('customer', 'name profileImage')
      .sort({ createdAt: -1 });

    // Rating breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => breakdown[r.rating]++);

    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({ success: true, reviews, breakdown, avgRating: Math.round(avgRating * 10) / 10, total: reviews.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Review like karo
router.patch('/:id/like', authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    const alreadyLiked = review.likes.includes(req.user.id);
    if (alreadyLiked) {
      review.likes = review.likes.filter(id => id.toString() !== req.user.id);
    } else {
      review.likes.push(req.user.id);
    }
    await review.save();
    res.json({ success: true, likes: review.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check karo — is order pe review diya hai ya nahi
router.get('/check/:orderId', authenticate, async (req, res) => {
  try {
    const review = await Review.findOne({
      order: req.params.orderId,
      customer: req.user.id
    });
    res.json({ success: true, reviewed: !!review, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;