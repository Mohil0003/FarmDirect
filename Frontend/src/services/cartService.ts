import axiosClient from '../api/axiosClient';
import type { CartCreateDto, CartResponse } from '../models/apiTypes';

/**
 * Cart Service
 * Handles all cart-related API calls
 */

/**
 * Get all carts (typically filtered by consumer ID on frontend)
 */
export const getAllCarts = async (): Promise<CartResponse[]> => {
  try {
    const response = await axiosClient.get<CartResponse[]>('/api/Cart/GetAllCarts');
    return response as CartResponse[];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch carts');
  }
};

/**
 * Get cart by ID
 */
export const getCartById = async (id: number): Promise<CartResponse> => {
  try {
    const response = await axiosClient.get<CartResponse>(`/api/Cart/${id}`);
    return response as CartResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Cart item not found');
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch cart item');
  }
};

/**
 * Get current user's cart items
 */
export const getCart = async (consumerId: number): Promise<CartResponse[]> => {
  try {
    const allCarts = await getAllCarts();
    return allCarts.filter(cart => cart.consumerId === consumerId);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch cart');
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (productId: number, quantity: number, consumerId: number): Promise<CartResponse> => {
  try {
    const cartData: CartCreateDto = {
      consumerId,
      productId,
      quantity,
    };
    const response = await axiosClient.post<CartResponse>('/api/Cart/AddCart', cartData);
    return response as CartResponse;
  } catch (error: any) {
    const errors = error.response?.data?.errors || [];
    throw new Error(errors.length > 0 ? errors.join(', ') : 'Failed to add item to cart');
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (cartId: number, quantity: number, consumerId: number, productId: number): Promise<CartResponse> => {
  try {
    const cartData: CartCreateDto = {
      consumerId,
      productId,
      quantity,
    };
    const response = await axiosClient.put<CartResponse>(`/api/Cart/UpdateCart/${cartId}`, cartData);
    return response as CartResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Cart item not found');
    }
    const errors = error.response?.data?.errors || [];
    throw new Error(errors.length > 0 ? errors.join(', ') : 'Failed to update cart item');
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (cartId: number): Promise<void> => {
  try {
    await axiosClient.delete(`/api/Cart/DeleteCart/${cartId}`);
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Cart item not found');
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to remove item from cart');
  }
};

/**
 * Checkout - Create order from cart items
 * This is a frontend helper that creates an order and order items from cart
 */
export const checkout = async (
  consumerId: number,
  deliveryAddress: string,
  cartItems: CartResponse[]
): Promise<any> => {
  try {
    // Calculate total amount
    const totalAmount = cartItems.reduce((sum, item) => {
      // Note: We need product price - for now using a placeholder
      // In a real scenario, you'd fetch product prices
      return sum + (item.quantity * 0); // Placeholder - needs product price
    }, 0);

    // Create order
    const orderData = {
      consumerId,
      totalAmount,
      deliveryAddress,
      status: 'Pending',
    };

    const orderResponse = await axiosClient.post('/api/Order/AddOrder', orderData);

    // TODO: Create order items for each cart item
    // Then clear the cart

    return orderResponse;
  } catch (error: any) {
    const errors = error.response?.data?.errors || [];
    throw new Error(errors.length > 0 ? errors.join(', ') : 'Failed to checkout');
  }
};

