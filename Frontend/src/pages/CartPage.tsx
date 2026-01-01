import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Loader2, ArrowRight } from 'lucide-react';
import { getCart, updateCartItem, removeFromCart } from '../services/cartService';
import { getProductById } from '../services/productService';
import { createOrder } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import type { CartResponse, ProductResponse } from '../models/apiTypes';

interface CartItemWithProduct extends CartResponse {
  product?: ProductResponse;
}

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      navigate('/login');
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const carts = await getCart(user.userId);
      
      // Fetch product details for each cart item
      const itemsWithProducts = await Promise.all(
        carts.map(async (cart) => {
          try {
            const product = await getProductById(cart.productId);
            return { ...cart, product };
          } catch {
            return { ...cart, product: undefined };
          }
        })
      );
      
      setCartItems(itemsWithProducts);
    } catch (err: any) {
      setError(err.message || 'Failed to load cart');
      console.error('Error loading cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartId: number, newQuantity: number, productId: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartId);
      return;
    }
    
    if (!user) return;
    
    try {
      setUpdatingItems(prev => new Set(prev).add(cartId));
      await updateCartItem(cartId, newQuantity, user.userId, productId);
      await loadCart(); // Reload cart to reflect changes
    } catch (err: any) {
      alert(err.message || 'Failed to update quantity');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartId: number) => {
    if (!confirm('Remove this item from cart?')) return;
    
    try {
      setUpdatingItems(prev => new Set(prev).add(cartId));
      await removeFromCart(cartId);
      await loadCart();
    } catch (err: any) {
      alert(err.message || 'Failed to remove item');
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartId);
        return newSet;
      });
    }
  };

  const handleCheckout = async () => {
    if (!user) return;
    
    try {
      setIsCheckingOut(true);
      
      // Calculate total
      const subtotal = cartItems.reduce((sum, item) => {
        const price = item.product?.currentPrice || 0;
        return sum + (price * item.quantity);
      }, 0);
      
      // For now, we'll use the user's address as delivery address
      // In a real app, you'd have a delivery address form
      const deliveryAddress = user.email; // Placeholder
      
      // Create order
      const order = await createOrder({
        consumerId: user.userId,
        totalAmount: subtotal,
        deliveryAddress,
        status: 'Pending',
      });
      
      // TODO: Create order items for each cart item
      // TODO: Clear cart after successful order
      
      navigate(`/orders/${order.orderId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to checkout');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.currentPrice || 0;
    return sum + (price * item.quantity);
  }, 0);

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
          <button onClick={loadCart} className="text-primary hover:underline">
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
                    const productPrice = item.product?.currentPrice || 0;
                    const itemTotal = productPrice * item.quantity;
                    const isUpdating = updatingItems.has(item.cartId);
                    
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
                                <p className="text-sm text-gray-500">{item.product.unit}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-800">₹{productPrice.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.cartId, item.quantity - 1, item.productId)}
                              disabled={isUpdating}
                              className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.cartId, item.quantity + 1, item.productId)}
                              disabled={isUpdating || (item.product && item.quantity >= item.product.stockQuantity)}
                              className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                            >
                              <Plus size={16} />
                            </button>
                            {isUpdating && <Loader2 className="animate-spin text-primary ml-2" size={16} />}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-800">₹{itemTotal.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRemoveItem(item.cartId)}
                            disabled={isUpdating}
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
                <div className="flex justify-between text-gray-600">
                  <span>Tax (5%)</span>
                  <span className="font-semibold">₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
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
                    Proceed to Checkout
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

