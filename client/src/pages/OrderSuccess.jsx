import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const steps = [
  { key: 'pending', label: 'Order\nPlaced', emoji: '📋' },
  { key: 'confirmed', label: 'Confirmed', emoji: '✅' },
  { key: 'preparing', label: 'Preparing', emoji: '👨‍🍳' },
  { key: 'picked', label: 'On the\nWay', emoji: '🛵' },
  { key: 'delivered', label: 'Delivered', emoji: '🎉' },
];

const OrderSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState('pending');
  const [count, setCount] = useState(10);

  useEffect(() => {
    // Auto redirect
    const timer = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          clearInterval(timer);
          navigate('/my-orders');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStepIndex = steps.findIndex(s => s.key === currentStatus);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center">

        <div className="text-7xl mb-4 animate-bounce">🎉</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Order Place Ho Gaya!</h1>
        <p className="text-gray-500 mb-6">{state?.restaurant?.name} se tera khana aa raha hai!</p>

        {/* Order Info */}
        <div className="bg-orange-50 rounded-2xl p-4 mb-6 text-left">
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-500">Order ID</span>
            <span className="font-mono text-xs text-gray-700">#{state?.order?._id?.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-500">Restaurant</span>
            <span className="font-medium text-gray-800">{state?.restaurant?.name}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-500">Delivery Time</span>
            <span className="font-medium text-orange-500">{state?.restaurant?.deliveryTime}</span>
          </div>
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-500">Payment</span>
            <span className="font-medium text-green-500">✅ Paid</span>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-700 mb-4 text-left">Order Status</h3>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 mx-8 z-0">
              <div
                className="h-full bg-orange-500 transition-all duration-500"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>

            {/* Steps */}
            <div className="flex justify-between relative z-10">
              {steps.map((step, i) => {
                const isCompleted = i <= currentStepIndex;
                const isActive = i === currentStepIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-1 w-16">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                        : 'bg-white border-gray-300 text-gray-400'
                    } ${isActive ? 'scale-110 shadow-lg' : ''}`}>
                      {isCompleted ? step.emoji : i + 1}
                    </div>
                    <span className={`text-xs text-center whitespace-pre-line leading-tight ${isCompleted ? 'text-orange-500 font-medium' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Simulate Status (Demo ke liye) */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-500 mb-2">🎮 Demo: Status manually change karo</p>
          <div className="flex gap-1 flex-wrap justify-center">
            {steps.map(step => (
              <button
                key={step.key}
                onClick={() => setCurrentStatus(step.key)}
                className={`text-xs px-2 py-1 rounded-lg transition ${
                  currentStatus === step.key
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {step.emoji} {step.label.replace('\n', ' ')}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          {count} seconds mein orders page pe redirect ho rahe ho...
        </p>

        <button
          onClick={() => navigate('/my-orders')}
          className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl hover:bg-orange-600 transition mb-3"
        >
          Mere Orders Dekho 📦
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition"
        >
          Aur Order Karo 🍕
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;