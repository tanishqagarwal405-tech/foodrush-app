import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const statusColor = {
  pending: 'bg-yellow-100 text-yellow-600',
  confirmed: 'bg-blue-100 text-blue-600',
  preparing: 'bg-purple-100 text-purple-600',
  picked: 'bg-indigo-100 text-indigo-600',
  delivered: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-500',
};

const statusEmoji = {
  pending: '⏳', confirmed: '✅', preparing: '👨‍🍳',
  picked: '🛵', delivered: '🎉', cancelled: '❌'
};

const StarRating = ({ rating, setRating, size = 'text-2xl' }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        onClick={() => setRating && setRating(star)}
        className={`${size} transition-transform hover:scale-110 ${setRating ? 'cursor-pointer' : 'cursor-default'}`}
      >
        {star <= rating ? '⭐' : '☆'}
      </button>
    ))}
  </div>
);

const ReviewModal = ({ order, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rating) { setError('Rating do'); return; }
    setLoading(true);
    try {
      await onSubmit({ rating, comment, orderId: order._id, restaurantId: order.restaurant._id });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error aa gaya');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Review likho ⭐</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl">×</button>
        </div>

        <div className="bg-orange-50 rounded-xl p-3 mb-4">
          <p className="font-medium text-gray-800">{order.restaurant?.name}</p>
          <p className="text-sm text-gray-500">
            {order.items.map(i => i.name).join(', ')}
          </p>
        </div>

        <div className="text-center mb-4">
          <p className="text-gray-600 mb-2">Khana kaisa tha?</p>
          <StarRating rating={rating} setRating={setRating} size="text-4xl" />
          <p className="text-sm text-gray-500 mt-2">
            {rating === 1 ? '😞 Bahut bura' : rating === 2 ? '😕 Theek nahi' : rating === 3 ? '😐 Average' : rating === 4 ? '😊 Achha tha!' : '🤩 Zabardast!'}
          </p>
        </div>

        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Apna experience share karo... (optional)"
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm resize-none mb-4"
        />

        {error && <p className="text-red-500 text-sm mb-3">⚠️ {error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? 'Submit ho raha hai...' : 'Review Submit Karo ⭐'}
        </button>
      </div>
    </div>
  );
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewedOrders, setReviewedOrders] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/my');
      setOrders(data.orders);

      // Check karo konse orders pe review diya hai
      const deliveredOrders = data.orders.filter(o => o.status === 'delivered');
      const checks = await Promise.all(
        deliveredOrders.map(o => api.get(`/reviews/check/${o._id}`))
      );
      const reviewedMap = {};
      deliveredOrders.forEach((o, i) => {
        reviewedMap[o._id] = checks[i].data.reviewed;
      });
      setReviewedOrders(reviewedMap);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async ({ rating, comment, orderId, restaurantId }) => {
    await api.post('/reviews', { rating, comment, orderId, restaurantId });
    setReviewedOrders(prev => ({ ...prev, [orderId]: true }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {reviewModal && (
        <ReviewModal
          order={reviewModal}
          onClose={() => setReviewModal(null)}
          onSubmit={submitReview}
        />
      )}

      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-orange-500 text-xl">←</button>
          <h1 className="text-xl font-bold text-gray-800">Mere Orders 📦</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-gray-500 mb-4">Abhi tak koi order nahi kiya</p>
            <button onClick={() => navigate('/')} className="bg-orange-500 text-white px-6 py-2 rounded-xl">
              Order Karo
            </button>
          </div>
        ) : orders.map(order => (
          <div key={order._id} className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-800">{order.restaurant?.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  #{order._id.slice(-6).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString('hi-IN')}
                </p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[order.status]}`}>
                {statusEmoji[order.status]} {order.status}
              </span>
            </div>

            <div className="border-t pt-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-gray-600 py-0.5">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-gray-800 mt-2 pt-2 border-t">
                <span>Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>

            {/* Review Section */}
            {order.status === 'delivered' && (
              <div className="mt-3 pt-3 border-t">
                {reviewedOrders[order._id] ? (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-xl">
                    <span>✅</span>
                    <span className="text-sm font-medium">Review de diya! Shukriya 🙏</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setReviewModal(order)}
                    className="w-full border-2 border-orange-500 text-orange-500 font-semibold py-2 rounded-xl hover:bg-orange-50 transition text-sm"
                  >
                    ⭐ Review Do — Kaisa tha khana?
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;