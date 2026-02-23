import React, { useState, useEffect } from 'react';
import {
  Users,
  IndianRupee,
  Package,
  Sprout,
  Loader2,
  Search,
  TrendingUp,
  ShoppingBag,
} from 'lucide-react';
import { getAllUsers } from '../services/userService';
import { getAllOrders } from '../services/orderService';
import { getAllProducts } from '../services/productService';
import { getFarmerStats } from '../services/adminService';
import type {
  UserResponse,
  OrderResponse,
  ProductResponse,
  FarmerStatsResponse,
} from '../models/apiTypes';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [farmerStats, setFarmerStats] = useState<FarmerStatsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [usersData, ordersData, productsData, statsData] = await Promise.all([
        getAllUsers(),
        getAllOrders(),
        getAllProducts(),
        getFarmerStats(),
      ]);
      setUsers(usersData);
      setOrders(ordersData);
      setProducts(productsData);
      setFarmerStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalFarmers = users.filter((u) => u.role === 'Farmer').length;
  const totalConsumers = users.filter((u) => u.role === 'Consumer').length;
  const activeProducts = products.filter((p) => p.isActive !== false).length;

  const filteredFarmerStats = farmerStats.filter((f) =>
    f.farmerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="animate-spin text-green-600 mx-auto mb-4" size={48} />
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          System-wide statistics and farmer performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Users"
          value={users.length.toString()}
          subtitle={`${totalFarmers} farmers · ${totalConsumers} consumers`}
          icon={<Users className="text-white" size={22} />}
          gradient="from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle={`${orders.length} total orders`}
          icon={<IndianRupee className="text-white" size={22} />}
          gradient="from-green-500 to-emerald-600"
        />
        <StatCard
          title="Active Products"
          value={activeProducts.toString()}
          subtitle={`${products.length} total products`}
          icon={<Package className="text-white" size={22} />}
          gradient="from-purple-500 to-violet-600"
        />
        <StatCard
          title="Total Orders"
          value={orders.length.toString()}
          subtitle={`${orders.filter((o) => o.status === 'Pending').length} pending`}
          icon={<ShoppingBag className="text-white" size={22} />}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* Farmer Statistics Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3 md:mb-0">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm">
              <Sprout className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Farmer Statistics</h3>
              <p className="text-sm text-gray-500">{farmerStats.length} registered farmers</p>
            </div>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search farmers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
          </div>
        </div>

        {filteredFarmerStats.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Sprout className="mx-auto mb-3 text-gray-300" size={48} />
            <p className="text-lg font-medium">No farmers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Farmer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Stock Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFarmerStats.map((farmer) => {
                  const totalStock = farmer.products?.reduce(
                    (sum, p) => sum + (p.stockQuantity || 0),
                    0
                  ) || 0;
                  return (
                    <tr key={farmer.farmerId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                            {farmer.farmerName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{farmer.farmerName}</p>
                            <p className="text-xs text-gray-400">ID: #{farmer.farmerId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <Package size={12} />
                          {farmer.productCount} products
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${totalStock > 50
                              ? 'bg-green-100 text-green-700'
                              : totalStock > 10
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {totalStock} units total
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Helper Component ---

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, gradient }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
      <div
        className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-200`}
      >
        {icon}
      </div>
    </div>
    <p className="text-xs text-gray-500 flex items-center gap-1">
      <TrendingUp size={12} className="text-green-500" />
      {subtitle}
    </p>
  </div>
);

export default AdminDashboard;
