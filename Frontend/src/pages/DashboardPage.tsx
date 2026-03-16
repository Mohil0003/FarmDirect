import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Eye,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import Pagination from '../components/common/Pagination';
import { useAuth } from '../context/AuthContext';
import { getProductsByFarmerId, deleteProduct } from '../services/productService';
import { getOrdersForFarmer } from '../services/orderService';
import type { ProductResponse, FarmerOrderWithDetails } from '../models/apiTypes';

interface DashboardPageProps {
  userType?: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ userType }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [farmerOrders, setFarmerOrders] = useState<FarmerOrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentOrderPage, setCurrentOrderPage] = useState(1);
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(5);
  const [productsPerPage, setProductsPerPage] = useState(5);

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
        const [farmerProducts, orders] = await Promise.all([
          getProductsByFarmerId(user.userId),
          getOrdersForFarmer(user.userId)
        ]);
        setProducts(farmerProducts);
        setFarmerOrders(orders);
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

  // Calculate stats from real data
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive !== false).length;
  const totalRevenue = farmerOrders.reduce((sum, order) => {
    const orderTotal = order.items.length > 0
      ? order.items.reduce((itemSum, item) => itemSum + (item.unitPrice * item.quantity), 0)
      : order.totalAmount;
    return sum + orderTotal;
  }, 0);
  const totalOrders = farmerOrders.length;
  const pendingOrders = farmerOrders.filter(o => o.status === 'Pending' || !o.status).length;
  const completedOrders = farmerOrders.filter(o => o.status === 'Delivered' || o.status === 'Completed').length;
  
  const totalOrderPages = Math.ceil(farmerOrders.length / ordersPerPage);
  const orderStartIndex = (currentOrderPage - 1) * ordersPerPage;
  const paginatedOrders = farmerOrders.slice(orderStartIndex, orderStartIndex + ordersPerPage);

  const totalProductPages = Math.ceil(products.length / productsPerPage);
  const productStartIndex = (currentProductPage - 1) * productsPerPage;
  const paginatedProducts = products.slice(productStartIndex, productStartIndex + productsPerPage);

  const getStatusConfig = (status?: string) => {
    const statusLower = (status || 'Pending').toLowerCase();
    if (statusLower === 'pending') {
      return { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pending' };
    } else if (statusLower === 'processing' || statusLower === 'shipped') {
      return { bg: 'bg-blue-100', text: 'text-blue-700', icon: ShoppingBag, label: status };
    } else if (statusLower === 'delivered' || statusLower === 'completed') {
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, label: status };
    } else if (statusLower === 'cancelled') {
      return { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'Cancelled' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock, label: status || 'Pending' };
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <p className="text-red-800 font-medium">Error loading dashboard</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={loadFarmerData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<IndianRupee className="text-white" size={22} />}
          trend={`From ${totalOrders} orders`}
          gradient="from-green-500 to-emerald-600"
        />
        <StatCard
          title="Active Products"
          value={activeProducts.toString()}
          icon={<Package className="text-white" size={22} />}
          trend={`${totalProducts} total products`}
          gradient="from-blue-500 to-indigo-600"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders.toString()}
          icon={<ShoppingCart className="text-white" size={22} />}
          trend={`${pendingOrders} pending`}
          gradient="from-purple-500 to-violet-600"
        />
        <StatCard
          title="Completed"
          value={completedOrders.toString()}
          icon={<CheckCircle className="text-white" size={22} />}
          trend="Successfully delivered"
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* Consumer Orders Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm">
              <ShoppingBag className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Consumer Orders</h3>
              <p className="text-sm text-gray-500">Orders containing your products</p>
            </div>
          </div>
          <Link
            to="/orders"
            className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1 transition-colors"
          >
            View All
            <ChevronRight size={16} />
          </Link>
        </div>

        {farmerOrders.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="text-gray-400" size={32} />
            </div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h4>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              When customers order your products, they'll appear here. Add more products to increase visibility!
            </p>
            <Link
              to="/products/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            >
              <Plus size={16} />
              Add New Product
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {paginatedOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div key={order.orderId} className="p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-primary text-lg">
                          #ORD-{order.orderId.toString().padStart(4, '0')}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                          <StatusIcon size={12} />
                          {statusConfig.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <User size={14} className="text-gray-400" />
                        <span className="font-medium">{order.consumerName}</span>
                        {order.consumerEmail && (
                          <span className="text-gray-400">• {order.consumerEmail}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={14} className="text-gray-400" />
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : 'Date not available'}
                      </div>
                    </div>

                    {/* Order Items Summary */}
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        {order.items.length > 0 ? `Items (${order.itemCount})` : 'Order Details'}
                      </p>
                      <div className="space-y-1">
                        {order.items.length > 0 ? (
                          <>
                            {order.items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="text-sm text-gray-700">
                                <span className="font-medium">{item.productName}</span>
                                <span className="text-gray-500"> × {item.quantity} {item.unit}</span>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-xs text-gray-400">
                                +{order.items.length - 2} more items
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            View order for item details
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Amount & Action */}
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        Total
                      </p>
                      <p className="text-xl font-bold text-gray-800">
                        ₹{(order.items.length > 0
                          ? order.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
                          : order.totalAmount
                        ).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <Link
                        to={`/orders/${order.orderId}`}
                        className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <Eye size={12} />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {farmerOrders.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <Pagination
              currentPage={currentOrderPage}
              totalPages={totalOrderPages}
              onPageChange={setCurrentOrderPage}
              itemsPerPage={ordersPerPage}
              onItemsPerPageChange={setOrdersPerPage}
              totalItems={farmerOrders.length}
            />
          </div>
        )}
      </div>

      {/* My Products Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
              <Package className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">My Products</h3>
          </div>
          <button
            onClick={() => navigate('/products/new')}
            className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1"
          >
            <Plus size={16} />
            Add New
          </button>
        </div>
        {products.length === 0 ? (
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
                {paginatedProducts.map((product) => (
                  <tr key={product.productId} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-4 font-medium text-gray-800">{product.name}</td>
                    <td className="py-4">₹{product.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {product.unit}</td>
                    <td className="py-4">{product.stockQuantity} {product.unit}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${product.isActive !== false
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
            {products.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentProductPage}
                  totalPages={totalProductPages}
                  onPageChange={setCurrentProductPage}
                  itemsPerPage={productsPerPage}
                  onItemsPerPageChange={setProductsPerPage}
                  totalItems={products.length}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// --- Helper Components ---

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, gradient }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
    </div>
    <p className="text-xs text-gray-500 flex items-center gap-1">
      <TrendingUp size={12} className="text-green-500" />
      {trend}
    </p>
  </div>
);

export default DashboardPage;
