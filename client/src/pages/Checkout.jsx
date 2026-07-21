import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Checkout = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { cart, restaurant, cartTotal } = state || {};

  const [address, setAddress] = useState({ street: '', city: 'Meerut', pincode: '250001' });
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!cart || cart.length === 0) { navigate('/'); return null; }

  const deliveryFee = cartTotal >= 299 ? 0 : 40;
  const discount = couponData?.discount || 0;
  const totalWithDelivery = cartTotal + deliveryFee - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) { setCouponError('Coupon code daalo'); return; }
    setCouponLoading(true);
    setCouponError('');
    try {
      const { data } = await api.post('/coupons/apply', {
        code: couponCode,
        orderAmount: cartTotal,
        restaurantId: id,
      });
      setCouponData(data);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Coupon invalid hai');
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get('/coupons');
      setAvailableCoupons(data.coupons);
      setShowCoupons(true);
    } catch (err) {
      console.error(err);
    }
  };

  const removeCoupon = () => {
    setCouponData(null);
    setCouponCode('');
    setCouponError('');
  };

  // COD Order
  const handleCOD = async () => {
    if (!address.street) { setError('Delivery address daalo'); return; }
    setLoading(true);
    setError('');
    try {
      const orderRes = await api.post('/orders/cod', {
        restaurantId: id,
        items: cart.map(item => ({ menuItemId: item._id, quantity: item.quantity })),
        deliveryAddress: address,
        couponCode: couponData ? couponCode : null,
      });

      if (couponData) {
        await api.post('/coupons/use', { code: couponCode });
      }

      localStorage.removeItem(`cart_${id}`);
      navigate('/order-success', {
        state: { order: orderRes.data.order, restaurant, discount, isCOD: true }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Kuch galat hua');
    } finally {
      setLoading(false);
    }
  };

  // Razorpay Payment
  const handleRazorpay = async () => {
    if (!address.street) { setError('Delivery address daalo'); return; }
    setLoading(true);
    setError('');
    try {
      const orderRes = await api.post('/orders', {
        restaurantId: id,
        items: cart.map(item => ({ menuItemId: item._id, quantity: item.quantity })),
        deliveryAddress: address,
      });
      const dbOrder = orderRes.data.order;

      if (couponData) {
        await api.post('/coupons/use', { code: couponCode });
      }

      const payRes = await api.post('/payment/create-order', {
        amount: totalWithDelivery,
        orderId: dbOrder._id,
      });
      const razorpayOrder = payRes.data.razorpayOrder;

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: razorpayOrder.amount,
          currency: 'INR',
          name: 'FoodRush 🍕',
          description: `Order from ${restaurant?.name}`,
          order_id: razorpayOrder.id,
          handler: async (response) => {
            try {
              await api.post('/payment/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: dbOrder._id,
              });
              localStorage.removeItem(`cart_${id}`);
              navigate('/order-success', {
                state: { order: dbOrder, restaurant, discount, isCOD: false }
              });
            } catch {
              setError('Payment verify nahi hua!');
              setLoading(false);
            }
          },
          prefill: { name: user?.name, email: user?.email, contact: user?.phone || '9999999999' },
          theme: { color: '#f97316' },
          modal: { ondismiss: () => setLoading(false) }
        };
        new window.Razorpay(options).open();
        setLoading(false);
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Kuch galat hua');
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (paymentMethod === 'cod') handleCOD();
    else handleRazorpay();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-orange-500 text-xl">←</button>
          <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Restaurant */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <span className="text-3xl">🍽️</span>
          <div>
            <h3 className="font-bold text-gray-800">{restaurant?.name}</h3>
            <p className="text-sm text-gray-500">{restaurant?.deliveryTime} delivery</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">🛒 Tera Order</h3>
          {cart.map(item => (
            <div key={item._id} className="flex justify-between items-center py-2 border-b last:border-0">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-sm border-2 flex items-center justify-center ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </span>
                <span className="text-gray-700 text-sm">{item.name} × {item.quantity}</span>
              </div>
              <span className="font-medium text-gray-800">₹{item.price * item.quantity}</span>
            </div>
          ))}

          <div className="mt-3 pt-3 border-t space-y-2">
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Item total</span><span>₹{cartTotal}</span>
            </div>
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Delivery fee</span>
              <span className={deliveryFee === 0 ? 'text-green-500 font-medium' : ''}>
                {deliveryFee === 0 ? 'FREE 🎉' : `₹${deliveryFee}`}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600 text-sm font-medium">
                <span>🎟️ Coupon discount</span>
                <span>- ₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-800 text-lg pt-2 border-t">
              <span>Total</span><span>₹{totalWithDelivery}</span>
            </div>
            {discount > 0 && (
              <p className="text-green-500 text-xs text-center bg-green-50 py-1 rounded-lg">
                🎉 Tumne ₹{discount} bachaye!
              </p>
            )}
          </div>
        </div>

        {/* Coupon */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">🎟️ Coupon Code</h3>
            <button onClick={fetchCoupons} className="text-orange-500 text-sm font-medium">
              Available dekho
            </button>
          </div>

          {showCoupons && availableCoupons.length > 0 && (
            <div className="mb-3 space-y-2 max-h-48 overflow-y-auto">
              {availableCoupons.map(c => (
                <div
                  key={c._id}
                  onClick={() => { setCouponCode(c.code); setShowCoupons(false); }}
                  className="flex items-center justify-between bg-orange-50 border border-orange-200 border-dashed rounded-xl p-3 cursor-pointer hover:bg-orange-100 transition"
                >
                  <div>
                    <p className="font-bold text-orange-600 font-mono text-sm">{c.code}</p>
                    <p className="text-xs text-gray-500">{c.description}</p>
                  </div>
                  <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-lg">Apply</span>
                </div>
              ))}
            </div>
          )}

          {couponData ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
              <div>
                <p className="font-bold text-green-600 font-mono text-sm">{couponCode.toUpperCase()} ✅</p>
                <p className="text-sm text-green-600">{couponData.message}</p>
              </div>
              <button onClick={removeCoupon} className="text-red-400 text-sm hover:text-red-600">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="WELCOME50"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono text-sm uppercase"
              />
              <button
                onClick={applyCoupon}
                disabled={couponLoading}
                className="bg-orange-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-orange-600 transition disabled:opacity-50 text-sm"
              >
                {couponLoading ? '...' : 'Apply'}
              </button>
            </div>
          )}
          {couponError && <p className="text-red-500 text-sm mt-2">⚠️ {couponError}</p>}
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">📍 Delivery Address</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={address.street}
              onChange={e => setAddress({ ...address, street: e.target.value })}
              placeholder="House no, Street, Mohalla... *"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={address.city}
                onChange={e => setAddress({ ...address, city: e.target.value })}
                placeholder="City"
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
              />
              <input
                type="text"
                value={address.pincode}
                onChange={e => setAddress({ ...address, pincode: e.target.value })}
                placeholder="Pincode"
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">💳 Payment Method</h3>
          <div className="space-y-3">

            {/* Razorpay Option */}
            <div
              onClick={() => setPaymentMethod('razorpay')}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                paymentMethod === 'razorpay'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">📱</span>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Online Payment</p>
                <p className="text-xs text-gray-500">UPI, Cards, Netbanking, Wallets</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === 'razorpay' ? 'border-orange-500' : 'border-gray-300'
              }`}>
                {paymentMethod === 'razorpay' && <div className="w-3 h-3 rounded-full bg-orange-500"></div>}
              </div>
            </div>

            {/* COD Option */}
            <div
              onClick={() => setPaymentMethod('cod')}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                paymentMethod === 'cod'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">💵</span>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Cash on Delivery</p>
                <p className="text-xs text-gray-500">Delivery pe cash dena hoga</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === 'cod' ? 'border-green-500' : 'border-gray-300'
              }`}>
                {paymentMethod === 'cod' && <div className="w-3 h-3 rounded-full bg-green-500"></div>}
              </div>
            </div>
          </div>

          {/* COD Info */}
          {paymentMethod === 'cod' && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p className="text-sm text-yellow-700 font-medium">⚠️ COD ke baare mein:</p>
              <ul className="text-xs text-yellow-600 mt-1 space-y-1">
                <li>• Delivery partner ko exact change dena hoga</li>
                <li>• Order cancel nahi hoga delivery ke baad</li>
                <li>• ₹{totalWithDelivery} cash ready rakhna</li>
              </ul>
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">⚠️ {error}</div>}

        {/* Pay Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full font-bold py-4 rounded-2xl text-lg transition disabled:opacity-50 shadow-lg text-white ${
            paymentMethod === 'cod'
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </span>
          ) : paymentMethod === 'cod'
            ? `💵 ₹${totalWithDelivery} Cash on Delivery`
            : `📱 ₹${totalWithDelivery} Pay Karo`
          }
        </button>

        <p className="text-center text-xs text-gray-400">
          {paymentMethod === 'cod' ? '💵 Cash on delivery available' : '🔒 100% Secure payment via Razorpay'}
        </p>
      </div>
    </div>
  );
};

export default Checkout;