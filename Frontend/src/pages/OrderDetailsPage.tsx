import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Package, Loader2, User, Calendar, IndianRupee, CreditCard, CheckCircle, Clock, XCircle, Trash2, RefreshCw } from 'lucide-react';
import LocationMap from '../components/common/LocationMap';
import { getOrderDetails, updateOrder, deleteOrder } from '../services/orderService';
import { getOrderItemsByOrderId } from '../services/orderItemService';
import { getProductById } from '../services/productService';
import { getUserById } from '../services/userService';
import { getPaymentsByOrderId, createPayment } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import type { OrderResponse, OrderItemResponse, ProductResponse, UserResponse, PaymentResponse } from '../models/apiTypes';

interface OrderItemWithProduct extends OrderItemResponse {
  product?: ProductResponse;
}

const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemWithProduct[]>([]);
  const [consumer, setConsumer] = useState<UserResponse | null>(null);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const orderId = parseInt(id || '0');
      const orderData = await getOrderDetails(orderId);
      setOrder(orderData);

      // Fetch order items with product details
      const items = await getOrderItemsByOrderId(orderId);
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await getProductById(item.productId);
            return { ...item, product };
          } catch {
            return { ...item, product: undefined };
          }
        })
      );
      setOrderItems(itemsWithProducts);

      // If user is Farmer or Admin, fetch consumer data
      if (user?.role === 'Farmer' || user?.role === 'Admin') {
        try {
          const consumerData = await getUserById(orderData.consumerId);
          setConsumer(consumerData);
        } catch (err) {
          console.error('Failed to load consumer data:', err);
        }
      }

      // Fetch payment info for this order
      try {
        const paymentData = await getPaymentsByOrderId(orderId);
        setPayments(paymentData);
      } catch (err) {
        console.error('Failed to load payment data:', err);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load order details');
      console.error('Error loading order details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    const statusLower = (status || 'Pending').toLowerCase();

    if (statusLower === 'pending') {
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    } else if (statusLower === 'shipped' || statusLower === 'processing') {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    } else if (statusLower === 'delivered' || statusLower === 'completed') {
      return 'bg-green-100 text-green-700 border-green-200';
    } else if (statusLower === 'cancelled') {
      return 'bg-red-100 text-red-700 border-red-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    try {
      setIsUpdatingStatus(true);
      await updateOrder(order.orderId, {
        consumerId: order.consumerId,
        totalAmount: order.totalAmount,
        status: newStatus,
        deliveryAddress: order.deliveryAddress,
      });
      setOrder({ ...order, status: newStatus });
      showSuccessToast(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!order || !confirm('Are you sure you want to delete this order? This cannot be undone.')) return;
    try {
      await deleteOrder(order.orderId);
      showSuccessToast('Order deleted successfully');
      navigate(user?.role === 'Admin' ? '/admin/orders' : '/orders');
    } catch (err: any) {
      showErrorToast(err.message || 'Failed to delete order');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  const ordersPath = user?.role === 'Admin' ? '/admin/orders' : user?.role === 'Consumer' ? '/consumer/orders' : '/orders';

  if (error || !order) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <Link to={ordersPath} className="text-green-600 hover:underline">
            Go to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="max-w-7xl mx-auto">

        {/* Order Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Order #ORD-{order.orderId.toString().padStart(3, '0')}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {order.orderDate && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{new Date(order.orderDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <IndianRupee size={16} />
                  <span className="font-semibold text-gray-800">
                    ₹{order.totalAmount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadgeClass(order.status)}`}>
                {order.status || 'Pending'}
              </span>
            </div>
          </div>

          {/* Admin Order Management Controls */}
          {user?.role === 'Admin' && (
            <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Management</h3>
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={order.status || 'Pending'}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={isUpdatingStatus}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 bg-white"
                >
                  {orderStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {isUpdatingStatus && <RefreshCw className="animate-spin text-green-600" size={18} />}
                <button
                  onClick={handleDeleteOrder}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors border border-red-200"
                >
                  <Trash2 size={16} />
                  Delete Order
                </button>
              </div>
            </div>
          )}

          {/* Consumer Info (for Farmers and Admins) */}
          {(user?.role === 'Farmer' || user?.role === 'Admin') && consumer && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User size={20} className="text-gray-600" />
                <h3 className="font-semibold text-gray-800">Customer Information</h3>
              </div>
              <p className="text-gray-700">{consumer.fullName}</p>
              {consumer.email && <p className="text-sm text-gray-600">{consumer.email}</p>}
              {consumer.phoneNumber && <p className="text-sm text-gray-600">{consumer.phoneNumber}</p>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="text-primary" size={24} />
              Order Items
            </h2>

            {orderItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No items in this order</p>
            ) : (
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.orderItemId} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.product?.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-2xl">🌾</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <Link
                        to={`/products/${item.productId}`}
                        className="font-semibold text-gray-800 hover:text-primary transition-colors"
                      >
                        {item.product?.name || 'Product'}
                      </Link>
                      {item.product && (
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity} {item.product.unit}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Unit Price: ₹{item.unitPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        ₹{(item.unitPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center text-lg font-bold text-gray-800">
                <span>Total:</span>
                <span className="text-primary">₹{order.totalAmount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address & Map (Right Side) */}
          <div className="space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="text-primary" size={20} />
                Delivery Address
              </h3>
              <p className="text-gray-700 whitespace-pre-line">{order.deliveryAddress}</p>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="text-primary" size={20} />
                Payment Information
              </h3>
              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.paymentId} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Status</span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${payment.status?.toLowerCase() === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : payment.status?.toLowerCase() === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {payment.status?.toLowerCase() === 'completed' && <CheckCircle size={12} />}
                          {payment.status?.toLowerCase() === 'failed' && <XCircle size={12} />}
                          {(!payment.status || payment.status?.toLowerCase() === 'pending') && <Clock size={12} />}
                          {payment.status || 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-500">Method</span>
                        <span className="text-sm font-medium text-gray-700">{payment.paymentMethod || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Amount</span>
                        <span className="text-sm font-bold text-gray-800">₹{payment.amount.toFixed(2)}</span>
                      </div>
                      {payment.paymentDate && (
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-gray-500">Date</span>
                          <span className="text-sm text-gray-600">
                            {new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 mb-3">No payment records found</p>
                  {user?.role === 'Consumer' && (
                    <button
                      onClick={async () => {
                        try {
                          await createPayment({
                            orderId: order.orderId,
                            amount: order.totalAmount,
                            paymentMethod: 'Cash on Delivery',
                            status: 'Pending',
                          });
                          showSuccessToast('Payment created');
                          const updated = await getPaymentsByOrderId(order.orderId);
                          setPayments(updated);
                        } catch (err: any) {
                          showErrorToast(err.message || 'Failed to create payment');
                        }
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Delivery Location Map (for Farmers) */}
            {user?.role === 'Farmer' && consumer && consumer.latitude != null && consumer.longitude != null && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="text-primary" size={20} />
                  Delivery Location
                </h3>
                <LocationMap
                  lat={consumer.latitude}
                  lng={consumer.longitude}
                  popupText={`Delivery Location - ${consumer.fullName}`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;

