import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, Loader2, User, Calendar, DollarSign } from 'lucide-react';
import LocationMap from '../components/common/LocationMap';
import { getOrderDetails } from '../services/orderService';
import { getOrderItemsByOrderId } from '../services/orderItemService';
import { getProductById } from '../services/productService';
import { getUserById } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import type { OrderResponse, OrderItemResponse, ProductResponse, UserResponse } from '../models/apiTypes';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      
      // If user is Farmer, fetch consumer data for delivery location
      if (user?.role === 'Farmer') {
        try {
          const consumerData = await getUserById(orderData.consumerId);
          setConsumer(consumerData);
        } catch (err) {
          console.error('Failed to load consumer data:', err);
        }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <Link to="/orders" className="text-primary hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Orders</span>
        </button>

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
                  <DollarSign size={16} />
                  <span className="font-semibold text-gray-800">
                    ₹{order.totalAmount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusBadgeClass(order.status)}`}>
              {order.status || 'Pending'}
            </span>
          </div>

          {/* Consumer Info (for Farmers) */}
          {user?.role === 'Farmer' && consumer && (
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

