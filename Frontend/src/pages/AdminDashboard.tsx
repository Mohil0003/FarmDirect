import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  TrendingUp, 
  Search, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Package,
  LogOut,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, getFarmers } from '../services/userService';
import { getAllProducts, getActiveProducts } from '../services/productService';
import { getAllOrders } from '../services/orderService';
import type { UserResponse } from '../models/apiTypes';
import type { ProductResponse } from '../models/apiTypes';
import type { OrderResponse } from '../models/apiTypes';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [farmers, setFarmers] = useState<UserResponse[]>([]);
  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load all data in parallel
      const [usersData, farmersData, productsData, ordersData] = await Promise.all([
        getAllUsers(),
        getFarmers(),
        getAllProducts(),
        getAllOrders()
      ]);
      
      setAllUsers(usersData);
      setFarmers(farmersData);
      setProducts(productsData);
      setOrders(ordersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate stats
  const totalUsers = allUsers.length;
  const totalFarmers = farmers.length;
  const totalConsumers = allUsers.filter(u => u.role === 'Consumer').length;
  const activeProducts = products.filter(p => p.isActive !== false).length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  // Filter farmers based on search
  const filteredFarmers = farmers.filter(farmer =>
    farmer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farmer.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    farmer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="h-16 flex items-center justify-center border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-primary" size={28} />
              <h1 className="text-xl font-bold text-gray-800">Admin<span className="text-primary">Panel</span></h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <NavItem icon={<ShieldCheck size={20} />} label="Dashboard" active />
            <NavItem icon={<Users size={20} />} label="Users" />
            <NavItem icon={<Package size={20} />} label="Products" />
            <NavItem icon={<TrendingUp size={20} />} label="Analytics" />
          </nav>

          {/* User Profile (Bottom) */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <button onClick={toggleSidebar} className="md:hidden text-gray-500">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden md:block">Welcome, {user?.name || 'Admin'}</span>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold md:hidden">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Stats Grid */}
          {!isLoading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard 
                  title="Total Users" 
                  value={totalUsers.toString()} 
                  icon={<Users className="text-blue-500" />} 
                  change={`${totalConsumers} Consumers, ${totalFarmers} Farmers`}
                  trend="up"
                />
                <StatCard 
                  title="Total Revenue" 
                  value={`₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                  icon={<TrendingUp className="text-green-500" />} 
                  change={`${orders.length} Orders`}
                  trend="up"
                />
                <StatCard 
                  title="Active Products" 
                  value={activeProducts.toString()} 
                  icon={<Package className="text-purple-500" />} 
                  change={`${products.length} Total Products`}
                  trend="up"
                />
                <StatCard 
                  title="Farmers" 
                  value={totalFarmers.toString()} 
                  icon={<CheckCircle className="text-orange-500" />} 
                  change="Registered Farmers"
                  trend="up"
                />
              </div>

              {/* Farmers Management Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Table Header */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Farmers Management</h2>
                    <p className="text-sm text-gray-500">Manage all registered farmers on the platform.</p>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search farmers..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                    />
                  </div>
                </div>

                {/* Table Body */}
                {filteredFarmers.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <Users className="mx-auto mb-4 text-gray-300" size={48} />
                    <p>No farmers found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                          <th className="px-6 py-4">Farmer Name</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Location</th>
                          <th className="px-6 py-4">Phone</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredFarmers.map((farmer) => (
                          <tr key={farmer.userId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-gray-800">{farmer.fullName}</td>
                            <td className="px-6 py-4 text-gray-600">{farmer.email}</td>
                            <td className="px-6 py-4 text-gray-600">{farmer.address || 'N/A'}</td>
                            <td className="px-6 py-4 text-gray-600">{farmer.phoneNumber || 'N/A'}</td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                <MoreVertical size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Table Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-500">
                  Showing {filteredFarmers.length} of {farmers.length} farmers
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// --- Helper Components ---

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  to?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active = false, to }) => {
  const content = (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
      ${active 
        ? 'bg-primary/10 text-primary font-medium' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-primary'}
    `}>
      {icon}
      <span>{label}</span>
    </div>
  );

  if (to) {
    return <a href={to}>{content}</a>;
  }

  return content;
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change: string;
  trend?: 'up' | 'down';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, trend = 'up' }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
    </div>
    <div className="flex items-center gap-1">
      <span className={`text-xs font-medium ${
        trend === 'up' ? 'text-green-600' : 'text-red-600'
      }`}>
        {change}
      </span>
    </div>
  </div>
);

export default AdminDashboard;
