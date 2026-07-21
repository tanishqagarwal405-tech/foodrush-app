import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const statusColors = {
  preparing: 'bg-purple-100 text-purple-700',
  picked: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
};

const DeliveryDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('available');
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const [availRes, myRes] = await Promise.all([
        api.get('/orders/delivery/available'),
        api.get('/orders/delivery/my'),
      ]);
      setAvailableOrders(availRes.data.orders);
      setMyOrders(myRes.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pickOrder = async (orderId) => {
    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/pick`);
      fetchOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const deliverOrder = async (orderId) => {
    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/deliver`);
      fetchOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  // Stats
  const totalDelivered = myOrders.filter(o => o.status === 'delivered').length;
  const activeDelivery = myOrders.filter(o => o.status === 'picked').length;
  const totalEarnings = myOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + Math.round(o.totalAmount * 0.1), 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛵</span>
            <div>
              <h1 className="font-bold text-gray-800">{user?.name}</h1>
              <p className="text-xs text-gray-500">Delivery Partner</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full font-medium">● Online</span>
            <button onClick={logout} className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-orange-500">{totalDelivered}</p>
            <p className="text-xs text-gray-500 mt-1">✅ Delivered</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-indigo-500">{activeDelivery}</p>
            <p className="text-xs text-gray-500 mt-1">🛵 Active</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-500">₹{totalEarnings}</p>
            <p className="text-xs text-gray-500 mt-1">💰 Earnings</p>
          </div>
        </div>

        {/* Active Delivery Banner */}
        {myOrders.filter(o => o.status === 'picked').map(order => (
          <div key={order._id} className="bg-indigo-500 text-white rounded-2xl p-4 mb-4 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛵</span>
                <div>
                  <p className="font-bold">Active Delivery!</p>
                  <p className="text-xs text-indigo-200">Order #{order._id.slice(-6).toUpperCase()}</p>
                </div>
              </div>
              <span className="bg-white text-indigo-500 text-xs font-bold px-2 py-1 rounded-full">LIVE</span>
            </div>

            <div className="bg-indigo-600 rounded-xl p-3 mb-3 space-y-2">
              <div className="flex items-start gap-2">
                <span>🍽️</span>
                <div>
                  <p className="text-xs text-indigo-300">Pickup from</p>
                  <p className="font-medium text-sm">{order.restaurant?.name}</p>
                  <p className="text-xs text-indigo-200">{order.restaurant?.address?.street}, {order.restaurant?.address?.city}</p>
                </div>
              </div>
              <div className="border-t border-indigo-500 pt-2 flex items-start gap-2">
                <span>📍</span>
                <div>
                  <p className="text-xs text-indigo-300">Deliver to</p>
                  <p className="font-medium text-sm">{order.customer?.name}</p>
                  <p className="text-xs text-indigo-200">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
                  <p className="text-xs text-indigo-200">📱 {order.customer?.phone}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-200">Order Amount</p>
                <p className="font-bold text-lg">₹{order.totalAmount}</p>
              </div>
              <button
                onClick={() => deliverOrder(order._id)}
                disabled={updating === order._id}
                className="bg-white text-indigo-600 font-bold px-6 py-2 rounded-xl hover:bg-indigo-50 transition disabled:opacity-50"
              >
                {updating === order._id ? 'Updating...' : '✅ Mark Delivered'}
              </button>
            </div>
          </div>
        ))}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'available' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 shadow-sm'}`}
          >
            📦 Available ({availableOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'history' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 shadow-sm'}`}
          >
            📋 My History ({myOrders.length})
          </button>
        </div>

        {/* Available Orders */}
        {activeTab === 'available' && (
          <div className="space-y-3">
            {availableOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <p className="text-5xl mb-3">😴</p>
                <p className="text-gray-500 font-medium">Koi order available nahi</p>
                <p className="text-gray-400 text-sm mt-1">Auto-refresh har 15 sec mein</p>
              </div>
            ) : availableOrders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-800">#{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString('hi-IN')}</p>
                  </div>
                  <span className="font-bold text-orange-500 text-lg">₹{order.totalAmount}</span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span>🍽️</span>
                    <div>
                      <p className="font-medium text-gray-800">{order.restaurant?.name}</p>
                      <p className="text-xs text-gray-500">{order.restaurant?.address?.street}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>📍</span>
                    <div>
                      <p className="font-medium text-gray-800">{order.customer?.name}</p>
                      <p className="text-xs text-gray-500">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-2 mb-3">
                  {order.items.slice(0, 2).map((item, i) => (
                    <p key={i} className="text-xs text-gray-600">{item.name} × {item.quantity}</p>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-gray-400">+{order.items.length - 2} aur items</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-green-600 font-medium">
                    💰 Earning: ₹{Math.round(order.totalAmount * 0.1)}
                  </div>
                  <button
                    onClick={() => pickOrder(order._id)}
                    disabled={updating === order._id}
                    className="bg-orange-500 text-white font-semibold px-5 py-2 rounded-xl hover:bg-orange-600 transition disabled:opacity-50 text-sm"
                  >
                    {updating === order._id ? 'Picking...' : '🛵 Pick Order'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {myOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <p className="text-5xl mb-3">📭</p>
                <p className="text-gray-500">Abhi tak koi delivery nahi ki</p>
              </div>
            ) : myOrders.map(order => (
              <div key={order._id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">#{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{order.restaurant?.name}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('hi-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">₹{order.totalAmount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                    {order.status === 'delivered' && (
                      <p className="text-xs text-green-500 mt-1">+₹{Math.round(order.totalAmount * 0.1)} earned</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;