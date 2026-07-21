const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: String,
    price: Number,
    quantity: { type: Number, min: 1 },
    image: String,
  }],
  totalAmount: { type: Number, required: true },
  deliveryAddress: {
    street: String,
    city: String,
    pincode: String,
    coordinates: { lat: Number, lng: Number }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'picked', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: { type: String, default: '' },
  deliveryLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  paymentMethod: {
  type: String,
  enum: ['razorpay', 'cod'],
  default: 'razorpay'
},
  estimatedDelivery: { type: String, default: '30-45 mins' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);