import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Menu, 
  X, 
  DollarSign, 
  TrendingUp,
  Loader2,
  LogOut,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProductsByFarmerId, deleteProduct } from '../services/productService';
import { getAllOrders } from '../services/orderService';
import type { ProductResponse } from '../models/apiTypes';
import type { OrderResponse } from '../models/apiTypes';

interface DashboardPageProps {
  userType?: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ userType }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toggle Sidebar for Mobile
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    if (user && userType === 'Farmer') {
      loadFarmerData();
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

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      await deleteProduct(productId);
      setProducts(products.filter(p => p.productId !== productId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive !== false).length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const recentOrders = orders.slice(0, 5); // Show last 5 orders
  const recentProducts = products.slice(0, 5); // Show last 5 products

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
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
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
            <NavItem icon={<Package size={20} />} label="My Products" />
            <NavItem icon={<ShoppingCart size={20} />} label="Orders" to="/orders" />
            <NavItem icon={<DollarSign size={20} />} label="Sales" />
          </nav>

          {/* User Profile (Bottom) */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'F'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-main">{user?.name || 'Farmer'}</p>
                <p className="text-xs text-text-muted">Farmer</p>
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

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <button onClick={toggleSidebar} className="md:hidden text-gray-500">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Farmer Dashboard</h2>
          <Link
            to="/products/new"
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </Link>
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
                  icon={<DollarSign className="text-green-500" />} 
                  trend={`${totalOrders} Orders`}
                />
                <StatCard 
                  title="Total Products" 
                  value={totalProducts.toString()} 
                  icon={<Package className="text-blue-500" />} 
                  trend={`${activeProducts} Active`}
                />
                <StatCard 
                  title="Total Orders" 
                  value={totalOrders.toString()} 
                  icon={<ShoppingCart className="text-purple-500" />} 
                  trend="Recent Orders"
                />
              </div>

              {/* Recent Products Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">My Products</h3>
                  <button 
                    onClick={() => navigate('/products/new')}
                    className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add New
                  </button>
                </div>
                {recentProducts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="mx-auto mb-4 text-gray-300" size={48} />
                    <p>No products yet</p>
                    <button 
                      onClick={() => navigate('/products/new')}
                      className="mt-4 text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      Add your first product
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-500 text-sm font-medium">
                          <th className="pb-3">Product Name</th>
                          <th className="pb-3">Price</th>
                          <th className="pb-3">Stock</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {recentProducts.map((product) => (
                          <tr key={product.productId} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-4 font-medium text-gray-800">{product.name}</td>
                            <td className="py-4">₹{product.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {product.unit}</td>
                            <td className="py-4">{product.stockQuantity} {product.unit}</td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                product.isActive !== false
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {product.isActive !== false ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  to={`/products/${product.productId}/edit`}
                                  className="text-blue-600 hover:text-blue-800 p-1" 
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </Link>
                                <button 
                                  onClick={() => handleDeleteProduct(product.productId)}
                                  className="text-red-600 hover:text-red-800 p-1" 
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Orders Table Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
                  <Link to="/orders" className="text-primary hover:text-primary-dark text-sm font-medium">
                    View All
                  </Link>
                </div>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="mx-auto mb-4 text-gray-300" size={48} />
                    <p>No orders found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-500 text-sm font-medium">
                          <th className="pb-3">Order ID</th>
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Amount</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {recentOrders.map((order) => (
                          <tr key={order.orderId} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-4 font-medium text-primary">#ORD-{order.orderId.toString().padStart(4, '0')}</td>
                            <td className="py-4 text-gray-600">
                              {order.orderDate 
                                ? new Date(order.orderDate).toLocaleDateString('en-IN', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    year: 'numeric' 
                                  })
                                : 'N/A'}
                            </td>
                            <td className="py-4 font-semibold">₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'Completed' || order.status === 'Delivered'
                                  ? 'bg-green-100 text-green-700'
                                  : order.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : order.status === 'Cancelled'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {order.status || 'Pending'}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <Link 
                                to={`/orders/${order.orderId}`}
                                className="text-primary hover:text-primary-dark text-sm font-medium"
                              >
                                View
                              </Link>
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
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1">
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className="p-3 bg-gray-50 rounded-full">
        {icon}
      </div>
    </div>
    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
      <TrendingUp size={12} /> {trend}
    </p>
  </div>
);

export default DashboardPage;
