import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Loader2, Eye } from 'lucide-react';
import { getMyOrders, getAllOrders } from '../services/orderService';
import { getUserById } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import type { OrderResponse } from '../models/apiTypes';

interface OrderWithDetails extends OrderResponse {
  consumerName?: string;
  productName?: string;
}

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      navigate('/login');
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      let ordersData: OrderResponse[] = [];

      if (user.role === 'Consumer') {
        // Consumer sees their own orders
        ordersData = await getMyOrders(user.userId, user.role);

        // Add consumer name (it's themselves)
        const ordersWithDetails: OrderWithDetails[] = ordersData.map(order => ({
          ...order,
          consumerName: user.name,
        }));
        setOrders(ordersWithDetails);
      } else if (user.role === 'Farmer') {
        // Farmer sees orders containing their products
        // For now, we'll show all orders - in production, filter by products
        const allOrders = await getAllOrders();

        // TODO: Filter orders by products belonging to this farmer
        // This would require fetching order items and checking product farmerId

        // Add consumer names
        const ordersWithDetails = await Promise.all(
          allOrders.map(async (order) => {
            try {
              const consumer = await getUserById(order.consumerId);
              return {
                ...order,
                consumerName: consumer.fullName,
              };
            } catch {
              return { ...order, consumerName: 'Unknown' };
            }
          })
        );

        setOrders(ordersWithDetails);
      } else {
        // Admin sees all orders
        ordersData = await getAllOrders();
        const ordersWithDetails = await Promise.all(
          ordersData.map(async (order) => {
            try {
              const consumer = await getUserById(order.consumerId);
              return {
                ...order,
                consumerName: consumer.fullName,
              };
            } catch {
              return { ...order, consumerName: 'Unknown' };
            }
          })
        );
        setOrders(ordersWithDetails);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    const statusLower = (status || 'Pending').toLowerCase();

    if (statusLower === 'pending') {
      return 'bg-yellow-100 text-yellow-700';
    } else if (statusLower === 'shipped' || statusLower === 'processing') {
      return 'bg-blue-100 text-blue-700';
    } else if (statusLower === 'delivered' || statusLower === 'completed') {
      return 'bg-green-100 text-green-700';
    } else if (statusLower === 'cancelled') {
      return 'bg-red-100 text-red-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={loadOrders} className="text-primary hover:underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Package className="text-primary" size={32} />
            {user?.role === 'Consumer' ? 'My Purchases' : user?.role === 'Farmer' ? 'Incoming Orders' : 'All Orders'}
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">
              {user?.role === 'Consumer'
                ? 'Start shopping to see your orders here!'
                : 'No orders have been placed yet.'}
            </p>
            {user?.role === 'Consumer' && (
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors"
              >
                Browse Products
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                    {user?.role !== 'Consumer' && (
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        {user?.role === 'Farmer' ? 'Customer' : 'Consumer'}
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-primary">#ORD-{order.orderId.toString().padStart(3, '0')}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                          : 'N/A'}
                      </td>
                      {user?.role !== 'Consumer' && (
                        <td className="px-6 py-4 text-gray-700">
                          {order.consumerName || 'Unknown'}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">
                          ₹{order.totalAmount.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/orders/${order.orderId}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;

