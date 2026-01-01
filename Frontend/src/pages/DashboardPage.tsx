import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Menu, 
  X, 
  DollarSign, 
  TrendingUp,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProductsByFarmerId } from '../services/productService';
import { getAllOrders } from '../services/orderService';
import type { ProductResponse } from '../models/apiTypes';
import type { OrderResponse } from '../models/apiTypes';

interface DashboardPageProps {
  userType?: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ userType }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toggle Sidebar for Mobile
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    if (user && userType === 'Farmer') {
      loadFarmerData();
    } else if (user && userType === 'Admin') {
      loadAdminData();
    }
  }, [user, userType]);

  const loadFarmerData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (user?.userId) {
        // Load farmer's products
        const farmerProducts = await getProductsByFarmerId(user.userId);
        setProducts(farmerProducts);
        
        // Load all orders (in a real app, you'd filter by farmer's products)
        const allOrders = await getAllOrders();
        setOrders(allOrders);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Error loading farmer data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Load admin data if needed
      const allOrders = await getAllOrders();
      setOrders(allOrders);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive !== false).length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const recentOrders = orders.slice(0, 5); // Show last 5 orders

  return (
    <div className="flex h-screen bg-primary-bg font-sans">
      
      {/* 1. SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="h-16 flex items-center justify-center border-b border-gray-100">
            <h1 className="text-2xl font-bold text-primary-dark tracking-tight">
              Farm<span className="text-secondary">Direct</span>
            </h1>
          </div>

          {/* Navigation Links */}
         <nav className="flex-1 px-4 py-6 space-y-2">
      
      {/* SHARED LINKS (Everyone sees these) */}
      <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active />

      {/* FARMER SPECIFIC LINKS */}
      {userType === 'Farmer' && (
        <>
          <NavItem icon={<Package size={20} />} label="My Crops" />
          <NavItem icon={<DollarSign size={20} />} label="My Sales" />
          <NavItem icon={<ShoppingCart size={20} />} label="Orders" to="/orders" />
        </>
      )}

      {/* ADMIN SPECIFIC LINKS */}
      {userType === 'Admin' && (
        <>
          <NavItem icon={<Users size={20} />} label="Manage Users" />
          <NavItem icon={<TrendingUp size={20} />} label="Platform Stats" />
        </>
      )}

    </nav>

          {/* User Profile (Bottom) */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-main">{user?.name || 'User'}</p>
                <p className="text-xs text-text-muted">{user?.role || userType || 'User'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <button onClick={toggleSidebar} className="md:hidden text-gray-500">
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
          <h2 className="text-xl font-semibold text-primary-dark">Dashboard Overview</h2>
          <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm transition-colors shadow-sm">
            + Add Product
          </button>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard 
                  title="Total Revenue" 
                  value={`₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  icon={<DollarSign className="text-primary" />} 
                  trend={`${totalOrders} Orders`}
                />
                <StatCard 
                  title="Active Orders" 
                  value={totalOrders.toString()} 
                  icon={<ShoppingCart className="text-secondary" />} 
                  trend={`${recentOrders.length} Recent`}
                />
                <StatCard 
                  title="Total Products" 
                  value={totalProducts.toString()} 
                  icon={<Package className="text-blue-500" />} 
                  trend={`${activeProducts} Active`}
                />
              </div>

              {/* Recent Orders Table Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Orders</h3>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No orders found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 text-text-muted text-sm">
                          <th className="pb-3">Order ID</th>
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Amount</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {recentOrders.map((order) => (
                          <tr key={order.orderId} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-4 font-medium text-primary">#ORD-{order.orderId.toString().padStart(3, '0')}</td>
                            <td className="py-4">
                              {order.orderDate 
                                ? new Date(order.orderDate).toLocaleDateString('en-IN')
                                : 'N/A'}
                            </td>
                            <td className="py-4">₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                order.status === 'Completed' || order.status === 'Delivered'
                                  ? 'bg-green-100 text-green-700'
                                  : order.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {order.status || 'Pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

        </main>
      </div>
    </div>
    
  );
};

// --- Helper Components (Keep file clean) ---

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
        ? 'bg-primary-light/20 text-primary-dark font-medium' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-primary'}
    `}>
      {icon}
      <span>{label}</span>
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return <a href="#">{content}</a>;
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm text-text-muted mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
        <TrendingUp size={12} /> {trend}
      </p>
    </div>
    <div className="p-3 bg-gray-50 rounded-full">
      {icon}
    </div>
  </div>
);

export default DashboardPage;