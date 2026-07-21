import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  preparing: 'bg-purple-100 text-purple-700 border-purple-200',
  picked: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const statusEmoji = {
  pending: '⏳', confirmed: '✅', preparing: '👨‍🍳',
  picked: '🛵', delivered: '🎉', cancelled: '❌'
};

const nextStatus = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'picked',
  picked: 'delivered',
};

const RestaurantDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchDashboard();
    // Har 30 sec mein refresh karo
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data: res } = await api.get('/restaurants/owner/dashboard');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await api.patch(`/restaurants/owner/orders/${orderId}/status`, { status });
      fetchDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );

  const { restaurant, stats, dailyRevenue, recentOrders } = data || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <div>
              <h1 className="font-bold text-gray-800">{restaurant?.name}</h1>
              <p className="text-xs text-gray-500">Restaurant Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${restaurant?.isOpen ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
              {restaurant?.isOpen ? '● Open' : '● Closed'}
            </span>
            <button onClick={logout} className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Aaj ke Orders", value: stats?.todayOrders, emoji: "📦", color: "bg-blue-50 border-blue-100" },
            { label: "Pending Orders", value: stats?.pendingOrders, emoji: "⏳", color: "bg-yellow-50 border-yellow-100" },
            { label: "Total Orders", value: stats?.totalOrders, emoji: "🛒", color: "bg-purple-50 border-purple-100" },
            { label: "Total Revenue", value: `₹${stats?.totalRevenue?.toLocaleString()}`, emoji: "💰", color: "bg-green-50 border-green-100" },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} border rounded-2xl p-4`}>
              <p className="text-2xl mb-1">{stat.emoji}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        {dailyRevenue?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">📈 Last 7 Days Revenue</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => `₹${val}`} />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {['orders', 'pending', 'delivered'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === tab ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 shadow-sm'}`}
            >
              {tab === 'orders' ? '📋 Saare Orders' : tab === 'pending' ? '⏳ Pending' : '✅ Delivered'}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {recentOrders
            ?.filter(order => {
              if (activeTab === 'pending') return ['pending', 'confirmed', 'preparing', 'picked'].includes(order.status);
              if (activeTab === 'delivered') return order.status === 'delivered';
              return true;
            })
            .map(order => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800">#{order._id.slice(-6).toUpperCase()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[order.status]}`}>
                        {statusEmoji[order.status]} {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      👤 {order.customer?.name} · 📱 {order.customer?.phone}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleString('hi-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-500 text-lg">₹{order.totalAmount}</p>
                    <p className={`text-xs font-medium ${order.paymentStatus === 'paid' ? 'text-green-500' : 'text-red-500'}`}>
                      {order.paymentStatus === 'paid' ? '💳 Paid' : '⏳ Unpaid'}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-0.5">
                      <span className="text-gray-700">{item.name} × {item.quantity}</span>
                      <span className="text-gray-500">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <p className="text-xs text-gray-500 mb-3">
                  📍 {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                </p>

                {/* Action Buttons */}
                {nextStatus[order.status] && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(order._id, nextStatus[order.status])}
                      disabled={updating === order._id}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-xl transition disabled:opacity-50"
                    >
                      {updating === order._id ? 'Updating...' : (
                        order.status === 'pending' ? '✅ Accept Order' :
                        order.status === 'confirmed' ? '👨‍🍳 Start Preparing' :
                        order.status === 'preparing' ? '🛵 Mark as Picked' :
                        '🎉 Mark Delivered'
                      )}
                    </button>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(order._id, 'cancelled')}
                        className="px-4 bg-red-50 text-red-500 text-sm font-medium py-2 rounded-xl border border-red-200 hover:bg-red-100 transition"
                      >
                        ❌ Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

          {recentOrders?.filter(order => {
            if (activeTab === 'pending') return ['pending', 'confirmed', 'preparing', 'picked'].includes(order.status);
            if (activeTab === 'delivered') return order.status === 'delivered';
            return true;
          }).length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500">Koi order nahi abhi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;