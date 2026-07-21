require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');

const seedCoupons = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Coupon.deleteMany({});

  await Coupon.insertMany([
    {
      code: 'WELCOME50',
      description: 'Naye user ke liye 50% off (max ₹100)',
      discountType: 'percentage',
      discountValue: 50,
      minOrderAmount: 99,
      maxDiscount: 100,
      usageLimit: 100,
      validTill: new Date('2027-12-31'),
    },
    {
      code: 'FLAT100',
      description: '₹200+ order pe flat ₹100 off',
      discountType: 'flat',
      discountValue: 100,
      minOrderAmount: 200,
      usageLimit: 50,
      validTill: new Date('2027-12-31'),
    },
    {
      code: 'FOODRUSH20',
      description: 'Har order pe 20% off (max ₹80)',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 149,
      maxDiscount: 80,
      usageLimit: 200,
      validTill: new Date('2027-12-31'),
    },
    {
      code: 'SAVE60',
      description: '₹300+ order pe flat ₹60 off',
      discountType: 'flat',
      discountValue: 60,
      minOrderAmount: 300,
      usageLimit: 75,
      validTill: new Date('2027-12-31'),
    },
    {
      code: 'BIRYANI30',
      description: 'Biryani lovers ke liye 30% off (max ₹120)',
      discountType: 'percentage',
      discountValue: 30,
      minOrderAmount: 199,
      maxDiscount: 120,
      usageLimit: 100,
      validTill: new Date('2027-12-31'),
    },
  ]);

  console.log('✅ 5 Coupons add ho gaye!');
  console.log('Codes: WELCOME50, FLAT100, FOODRUSH20, SAVE60, BIRYANI30');
  process.exit(0);
};

seedCoupons().catch(err => { console.error(err); process.exit(1); });