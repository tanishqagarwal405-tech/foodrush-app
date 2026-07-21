const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Razorpay order create karo
router.post('/create-order', authenticate, async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${orderId}`,
    };
    const razorpayOrder = await razorpay.orders.create(options);
    res.json({ success: true, razorpayOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Payment verify karo
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment invalid hai' });
    }

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      paymentId: razorpay_payment_id,
      status: 'confirmed',
    });

    res.json({ success: true, message: 'Payment successful!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;