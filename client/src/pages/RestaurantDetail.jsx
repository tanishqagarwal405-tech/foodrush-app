import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);

  useEffect(() => {
    fetchRestaurant();
    fetchReviews();
    const savedCart = localStorage.getItem(`cart_${id}`);
    if (savedCart) setCart(JSON.parse(savedCart));
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      const { data } = await api.get(`/restaurants/${id}`);
      setRestaurant(data.restaurant);
      setMenuItems(data.menuItems);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/restaurant/${id}`);
      setReviews(data.reviews);
      setReviewStats({ breakdown: data.breakdown, avgRating: data.avgRating, total: data.total });
    } catch (err) {
      console.error(err);
    }
  };

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem(`cart_${id}`, JSON.stringify(newCart));
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c._id === item._id);
    if (existing) {
      saveCart(cart.map(c => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      saveCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (item) => {
    const existing = cart.find(c => c._id === item._id);
    if (existing?.quantity === 1) {
      saveCart(cart.filter(c => c._id !== item._id));
    } else {
      saveCart(cart.map(c => c._id === item._id ? { ...c, quantity: c.quantity - 1 } : c));
    }
  };

  const getQty = (itemId) => cart.find(c => c._id === itemId)?.quantity || 0;
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const categories = ['All', ...new Set(menuItems.map(i => i.category))];
  const filteredItems = activeCategory === 'All' ? menuItems : menuItems.filter(i => i.category === activeCategory);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={() => navigate('/')} className="text-orange-500 mb-3 flex items-center gap-1">
            ← Wapas jao
          </button>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-orange-100 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
              🍽️
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{restaurant?.name}</h1>
              <p className="text-gray-500 text-sm">{restaurant?.cuisine?.join(', ')}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                <span>⭐ {restaurant?.rating || 'New'}</span>
                <span>🕐 {restaurant?.deliveryTime}</span>
                <span className={restaurant?.isOpen ? 'text-green-500' : 'text-red-500'}>
                  {restaurant?.isOpen ? '● Open' : '● Closed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 flex gap-2 overflow-x-auto py-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Is category mein koi item nahi hai</div>
        ) : filteredItems.map(item => (
          <div key={item._id} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className="w-24 h-24 bg-orange-50 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
              {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" /> : '🍱'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-sm border-2 ${item.isVeg ? 'border-green-500' : 'border-red-500'} flex items-center justify-center`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </span>
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
              </div>
              <p className="text-gray-500 text-sm mt-1">{item.description}</p>
              <p className="text-orange-500 font-bold mt-1">₹{item.price}</p>
            </div>
            <div>
              {getQty(item._id) === 0 ? (
                <button
                  onClick={() => addToCart(item)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
                >
                  ADD
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-orange-500 text-white rounded-lg overflow-hidden">
                  <button onClick={() => removeFromCart(item)} className="px-3 py-2 hover:bg-orange-600 font-bold">−</button>
                  <span className="font-bold">{getQty(item._id)}</span>
                  <button onClick={() => addToCart(item)} className="px-3 py-2 hover:bg-orange-600 font-bold">+</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reviews Section */}
      <div className="max-w-4xl mx-auto px-4 pb-6">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-800 text-lg mb-4">⭐ Customer Reviews</h2>

          {reviewStats && reviewStats.total > 0 ? (
            <>
              <div className="flex gap-6 mb-4 pb-4 border-b">
                <div className="text-center">
                  <p className="text-5xl font-bold text-orange-500">{reviewStats.avgRating}</p>
                  <div className="flex justify-center mt-1">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-lg ${s <= Math.round(reviewStats.avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{reviewStats.total} reviews</p>
                </div>
                <div className="flex-1">
                  {[5,4,3,2,1].map(star => (
                    <div key={star} className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 w-4">{star}★</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-orange-400 h-2 rounded-full"
                          style={{ width: `${reviewStats.total ? (reviewStats.breakdown[star] / reviewStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-400 w-4">{reviewStats.breakdown[star]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {reviews.map(review => (
                  <div key={review._id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-500">
                          {review.customer?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{review.customer?.name}</p>
                          <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('hi-IN')}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} className={`text-sm ${s <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 ml-10">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">💬</p>
              <p className="text-gray-500">Abhi tak koi review nahi</p>
              <p className="text-sm text-gray-400">Order karo aur pehle review do!</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Footer */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800">{cartCount} items · ₹{cartTotal}</p>
              <p className="text-sm text-gray-500">{restaurant?.name}</p>
            </div>
            <button
              onClick={() => navigate(`/checkout/${id}`, { state: { cart, restaurant, cartTotal } })}
              className="bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-600 transition"
            >
              Checkout करें →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;