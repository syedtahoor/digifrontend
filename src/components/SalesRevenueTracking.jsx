import React from 'react';

const SalesRevenueTracking = ({ userRole }) => {
  // Admin sales data
  const adminStats = [
    { title: 'Total Revenue', value: '$45,678', color: 'green', description: 'All stores' },
    { title: 'Commission', value: '$4,568', color: 'blue', description: 'Platform earnings' },
    { title: 'Active Stores', value: '24', color: 'purple', description: 'Selling stores' },
    { title: 'Avg. Order Value', value: '$89', color: 'orange', description: 'Across platform' },
  ];

  // User sales data
  const userStats = [
    { title: 'Total Revenue', value: '$12,458', color: 'green', description: '↑ 18% this month' },
    { title: 'Orders', value: '156', color: 'blue', description: '↑ 12% this month' },
    { title: 'Avg. Order Value', value: '$79.86', color: 'purple', description: '↑ 5% this month' },
    { title: 'Conversion Rate', value: '3.2%', color: 'orange', description: '↑ 0.8% this month' },
  ];

  const stats = userRole === 'Admin' ? adminStats : userStats;

  const getColorClasses = (color) => {
    const colors = {
      green: 'text-green-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600'
    };
    return colors[color] || 'text-gray-600';
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        {userRole === 'Admin' ? 'Platform Sales & Revenue' : 'My Sales & Revenue'}
      </h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">{stat.title}</h3>
            <p className={`text-2xl sm:text-3xl font-bold mt-2 ${getColorClasses(stat.color)}`}>
              {stat.value}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            {userRole === 'Admin' ? 'Platform Revenue' : 'Sales Overview'}
          </h2>
          <div className="h-48 sm:h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 text-sm sm:text-base">
              {userRole === 'Admin' ? 'Platform revenue chart' : 'Sales performance chart'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            {userRole === 'Admin' ? 'Top Performing Stores' : 'Top Products'}
          </h2>
          <div className="space-y-4">
            {(userRole === 'Admin' ? [
              { name: 'Electronics Hub', revenue: '$8,456' },
              { name: 'Fashion Store', revenue: '$6,789' },
              { name: 'Home Decor', revenue: '$5,234' }
            ] : [
              { name: 'Wireless Headphones', revenue: '$2,456' },
              { name: 'Smart Watch Series 5', revenue: '$1,890' },
              { name: 'Bluetooth Speaker', revenue: '$1,234' }
            ]).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm sm:text-base text-gray-700">{item.name}</span>
                <span className="font-bold text-green-600 text-sm sm:text-base">{item.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
          {userRole === 'Admin' ? 'Platform Metrics' : 'Store Performance'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {userRole === 'Admin' ? (
            <>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-blue-600">98%</p>
                <p className="text-sm text-gray-600 mt-1">Store Satisfaction</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-green-600">4.7</p>
                <p className="text-sm text-gray-600 mt-1">Avg. Store Rating</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-purple-600">2.3%</p>
                <p className="text-sm text-gray-600 mt-1">Dispute Rate</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-orange-600">89%</p>
                <p className="text-sm text-gray-600 mt-1">Active Rate</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-blue-600">98%</p>
                <p className="text-sm text-gray-600 mt-1">Order Accuracy</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-green-600">4.8</p>
                <p className="text-sm text-gray-600 mt-1">Avg. Rating</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-purple-600">2.1%</p>
                <p className="text-sm text-gray-600 mt-1">Return Rate</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold text-orange-600">45min</p>
                <p className="text-sm text-gray-600 mt-1">Avg. Response Time</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesRevenueTracking;