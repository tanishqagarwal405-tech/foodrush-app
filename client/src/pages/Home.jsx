import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const cuisineFilters = [
  { label: 'All', emoji: '🍽️' },
  { label: 'Indian', emoji: '🍛' },
  { label: 'Chinese', emoji: '🍜' },
  { label: 'Biryani', emoji: '🍚' },
  { label: 'Fast Food', emoji: '🍔' },
  { label: 'Pizza', emoji: '🍕' },
  { label: 'Sweets', emoji: '🍮' },
  { label: 'South Indian', emoji: '🥞' },
  { label: 'Healthy', emoji: '🥗' },
  { label: 'Seafood', emoji: '🦐' },
  { label: 'Mughlai', emoji: '🍖' },
  { label: 'Street Food', emoji: '🌮' },
  { label: 'Drinks', emoji: '🥤' },
];

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCuisine, setActiveCuisine] = useState('All');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { fetchRestaurants(); }, []);

  const fetchRestaurants = async (q = '') => {
    try {
      setLoading(true);
      const { data } = await api.get(`/restaurants${q ? `?q=${q}` : ''}`);
      setRestaurants(data.restaurants);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRestaurants(search);
  };

  const filtered = activeCuisine === 'All'
    ? restaurants
    : restaurants.filter(r => r.cuisine?.some(c => c.toLowerCase().includes(activeCuisine.toLowerCase())));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍕</span>
            <span className="text-xl font-extrabold text-orange-500 tracking-tight">FoodRush</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2 w-80">
            <span className="text-gray-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Restaurant ya dish dhundo..."
              className="bg-transparent flex-1 text-sm outline-none text-gray-700"
            />
          </form>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1">
              <span className="text-sm text-gray-600">Namaste,</span>
              <span className="text-sm font-semibold text-gray-800">{user?.name?.split(' ')[0]}!</span>
            </div>
            <Link to="/my-orders" className="hidden md:flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600 transition">
              📦 Orders
            </Link>
            <button
              onClick={logout}
              className="hidden md:block text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition text-gray-700"
            >
              Logout
            </button>
            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-2xl">☰</button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t px-4 py-3 space-y-2">
            <form onSubmit={handleSearch} className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2">
              <span>🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="bg-transparent flex-1 text-sm outline-none"
              />
            </form>
            <Link to="/my-orders" className="block text-sm font-medium text-orange-500 py-1">📦 My Orders</Link>
            <button onClick={logout} className="block text-sm text-gray-600 py-1">Logout</button>
          </div>
        )}
      </nav>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-400 to-yellow-400 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3 leading-tight">
              Bhookh lagi hai? 🍔<br />
              <span className="text-yellow-200">Hum laa rahe hain!</span>
            </h1>
            <p className="text-orange-100 text-lg mb-6">Ghar baithe order karo, garam khana paao!</p>
            <div className="flex gap-4 text-sm">
              <div className="bg-white bg-opacity-20 rounded-xl px-4 py-2 text-center">
                <p className="font-bold text-lg">19+</p>
                <p className="text-orange-100">Restaurants</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl px-4 py-2 text-center">
                <p className="font-bold text-lg">120+</p>
                <p className="text-orange-100">Dishes</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl px-4 py-2 text-center">
                <p className="font-bold text-lg">30min</p>
                <p className="text-orange-100">Avg Delivery</p>
              </div>
            </div>
          </div>
          <div className="hidden md:block text-9xl mt-6 md:mt-0 animate-bounce">🛵</div>
        </div>
      </div>

      {/* Cuisine Filter Pills */}
      <div className="bg-white border-b sticky top-14 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {cuisineFilters.map(c => (
            <button
              key={c.label}
              onClick={() => setActiveCuisine(c.label)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCuisine === c.label
                  ? 'bg-orange-500 text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {loading ? 'Dhundh rahe hain...' : `${filtered.length} Restaurants`}
            {activeCuisine !== 'All' && <span className="text-orange-500"> · {activeCuisine}</span>}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🍽️</p>
            <p className="text-gray-500 text-lg font-medium">Koi restaurant nahi mila</p>
            <button onClick={() => { setActiveCuisine('All'); setSearch(''); fetchRestaurants(); }}
              className="mt-4 text-orange-500 underline text-sm">
              Sab dikhao
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(r => (
              <Link to={`/restaurant/${r._id}`} key={r._id} className="group">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-200 overflow-hidden">
                    {r.image ? (
                      <img src={r.image} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-7xl">
                        {r.cuisine?.[0] === 'Chinese' ? '🍜' :
                         r.cuisine?.[0] === 'Pizza' ? '🍕' :
                         r.cuisine?.[0] === 'Biryani' ? '🍚' :
                         r.cuisine?.[0] === 'Sweets' ? '🍮' :
                         r.cuisine?.[0] === 'South Indian' ? '🥞' :
                         r.cuisine?.[0] === 'Seafood' ? '🦐' :
                         r.cuisine?.[0] === 'Healthy' ? '🥗' :
                         r.cuisine?.[0] === 'BBQ' ? '🍖' :
                         r.cuisine?.[0] === 'Street Food' ? '🌮' :
                         r.cuisine?.[0] === 'Juices' ? '🥤' :
                         r.cuisine?.[0] === 'Ice Cream' ? '🍦' : '🍛'}
                      </div>
                    )}
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${r.isOpen ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                        {r.isOpen ? '● Open' : '● Closed'}
                      </span>
                    </div>
                    {r.rating >= 4.5 && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">⭐ Top Rated</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-orange-500 transition">{r.name}</h3>
                    <p className="text-gray-500 text-sm mt-0.5 truncate">{r.cuisine?.join(' · ')}</p>

                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm font-semibold text-gray-700">{r.rating || 'New'}</span>
                        <span className="text-xs text-gray-400">({r.totalRatings})</span>
                      </div>
                      <span className="text-gray-300">·</span>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span>🕐</span>
                        <span>{r.deliveryTime}</span>
                      </div>
                      <span className="text-gray-300">·</span>
                      <div className="text-sm text-gray-600">
                        ₹{r.minOrder} min
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-2xl font-extrabold text-orange-500 mb-2">🍕 FoodRush</p>
          <p className="text-gray-400 text-sm">Meerut ka sabse fast food delivery app</p>
          <p className="text-gray-300 text-xs mt-4">© 2026 FoodRush. Made with ❤️ by Tanishq</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;