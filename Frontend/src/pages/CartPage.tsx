import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Loader2, ArrowRight, CreditCard, Smartphone, Building2, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import { createMultipleOrderItems } from '../services/orderItemService';
import { createPayment } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import { calculateDiscountedPrice, getUrgencyLevel, getUrgencyColorClasses } from '../utils/priceUtils';
import { orderToasts } from '../utils/toastUtils';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, isLoading, error, updateCart, removeFromCart, refreshCart, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState('UPI');

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      navigate('/login');
    }
  }, [user]);

  const handleUpdateQuantity = async (cartId: number, newQuantity: number, productId: number, productName?: string) => {
    await updateCart(cartId, newQuantity, productId, productName);
  };

  const handleRemoveItem = async (cartId: number, productName?: string) => {
    if (!confirm('Remove this item from cart?')) return;
    await removeFromCart(cartId, productName);
  };

  const handleCheckout = async () => {
    if (!user) return;

    try {
      setIsCheckingOut(true);

      // Calculate total with dynamic pricing
      const subtotal = cartItems.reduce((sum, item) => {
        if (!item.product) return sum;
        const pricing = calculateDiscountedPrice(item.product.basePrice, item.product.expiryDate);
        return sum + (pricing.currentPrice * item.quantity);
      }, 0);

      const taxAmount = subtotal * 0.05;
      const totalAmount = subtotal + taxAmount;

      // For now, we'll use the user's address as delivery address
      const deliveryAddress = user.email; // Placeholder

      // 1. Create order
      const order = await createOrder({
        consumerId: user.userId,
        totalAmount,
        deliveryAddress,
        status: 'Pending',
      });

      // 2. Create order items for each cart item
      const orderItemsData = cartItems
        .filter(item => item.product)
        .map(item => ({
          orderId: order.orderId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: calculateDiscountedPrice(item.product!.basePrice, item.product!.expiryDate).currentPrice,
        }));

      if (orderItemsData.length > 0) {
        await createMultipleOrderItems(orderItemsData);
      }

      // 3. Create a pending payment record
      await createPayment({
        orderId: order.orderId,
        amount: totalAmount,
        paymentMethod: paymentMethod,
        status: 'Pending',
      });

      // 4. Clear the cart
      clearCart();
      // Also remove cart items from the API
      for (const item of cartItems) {
        try {
          await removeFromCart(item.cartId);
        } catch {
          // Ignore individual removal errors
        }
      }

      orderToasts.created(order.orderId);
      navigate(`/consumer/orders/${order.orderId}`);
    } catch (err: any) {
      orderToasts.failed(err.message || 'Unknown error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Calculate totals with dynamic pricing
  const subtotal = cartItems.reduce((sum, item) => {
    if (!item.product) return sum;
    const pricing = calculateDiscountedPrice(item.product.basePrice, item.product.expiryDate);
    return sum + (pricing.currentPrice * item.quantity);
  }, 0);

  const originalTotal = cartItems.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + (item.product.basePrice * item.quantity);
  }, 0);

  const totalSavings = originalTotal - subtotal;
  const tax = subtotal * 0.05; // 5% tax (example)
  const total = subtotal + tax;

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
          <button onClick={refreshCart} className="text-primary hover:underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your basket is empty</h2>
          <p className="text-gray-600 mb-6">Add some fresh produce to get started!</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors"
          >
            Browse Products
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Table */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cartItems.map((item) => {
                    if (!item.product) return null;

                    // Calculate dynamic pricing
                    const pricing = calculateDiscountedPrice(item.product.basePrice, item.product.expiryDate);
                    const itemTotal = pricing.currentPrice * item.quantity;
                    const originalTotal = item.product.basePrice * item.quantity;
                    const itemSavings = originalTotal - itemTotal;
                    const urgency = getUrgencyLevel(pricing.daysUntilExpiry);
                    const urgencyColors = getUrgencyColorClasses(urgency);

                    return (
                      <tr key={item.cartId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
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
                            <div>
                              <Link
                                to={`/products/${item.productId}`}
                                className="font-semibold text-gray-800 hover:text-primary transition-colors"
                              >
                                {item.product?.name || 'Product'}
                              </Link>
                              {item.product && (
                                <>
                                  <p className="text-sm text-gray-500">{item.product.unit}</p>
                                  {pricing.daysUntilExpiry <= 7 && (
                                    <div className={`text-xs ${urgencyColors.text} font-medium mt-1`}>
                                      {pricing.daysUntilExpiry === 0 ? 'Expires today!' : `${pricing.daysUntilExpiry} days left`}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-semibold text-gray-800">₹{pricing.currentPrice.toFixed(2)}</span>
                            {pricing.discountPercentage > 0 && (
                              <>
                                <div className="text-xs text-gray-400 line-through">₹{item.product.basePrice.toFixed(2)}</div>
                                <div className="text-xs text-green-600 font-semibold">{pricing.discountPercentage}% OFF</div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.cartId, item.quantity - 1, item.productId, item.product?.name)}
                              disabled={isLoading}
                              className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.cartId, item.quantity + 1, item.productId, item.product?.name)}
                              disabled={isLoading || (item.product && item.quantity >= item.product.stockQuantity)}
                              className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-bold text-gray-800">₹{itemTotal.toFixed(2)}</span>
                            {itemSavings > 0 && (
                              <div className="text-xs text-green-600 font-semibold">
                                Saved ₹{itemSavings.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRemoveItem(item.cartId, item.product?.name)}
                            disabled={isLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Remove"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-medium">You Save</span>
                    <span className="font-bold">-₹{totalSavings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Tax (5%)</span>
                  <span className="font-semibold">₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Method</h3>
                <div className="space-y-2">
                  {[
                    { value: 'UPI', label: 'UPI (GPay / PhonePe)', icon: Smartphone, color: 'text-purple-600' },
                    { value: 'Credit/Debit Card', label: 'Credit / Debit Card', icon: CreditCard, color: 'text-blue-600' },
                    { value: 'Net Banking', label: 'Net Banking', icon: Building2, color: 'text-indigo-600' },
                    { value: 'Cash on Delivery', label: 'Cash on Delivery', icon: Truck, color: 'text-green-600' },
                  ].map((method) => {
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === method.value
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="accent-green-600"
                        />
                        <Icon size={18} className={method.color} />
                        <span className="text-sm font-medium text-gray-700">{method.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || cartItems.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <Link
                to="/shop"
                className="block mt-4 text-center text-primary hover:text-primary-dark transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

