import axiosClient from '../api/axiosClient';
import type { OrderItemCreateDto, OrderItemResponse } from '../models/apiTypes';

/**
 * Order Item Service
 * Handles all order item-related API calls
 */

/**
 * Get all order items
 */
export const getAllOrderItems = async (): Promise<OrderItemResponse[]> => {
  try {
    const response = await axiosClient.get<OrderItemResponse[]>('/api/OrderItem/GetAllOrderItems');
    return response as OrderItemResponse[];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch order items');
  }
};

/**
 * Get order item by ID
 */
export const getOrderItemById = async (id: number): Promise<OrderItemResponse> => {
  try {
    const response = await axiosClient.get<OrderItemResponse>(`/api/OrderItem/${id}`);
    return response as OrderItemResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Order item not found');
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch order item');
  }
};

/**
 * Get order items by Order ID
 */
export const getOrderItemsByOrderId = async (orderId: number): Promise<OrderItemResponse[]> => {
  try {
    const allOrderItems = await getAllOrderItems();
    return allOrderItems.filter(item => item.orderId === orderId);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch order items');
  }
};

/**
 * Create an order item
 */
export const createOrderItem = async (orderItemData: OrderItemCreateDto): Promise<OrderItemResponse> => {
  try {
    const response = await axiosClient.post<OrderItemResponse>('/api/OrderItem/AddOrderItem', orderItemData);
    return response as OrderItemResponse;
  } catch (error: any) {
    const errors = error.response?.data?.errors || [];
    throw new Error(errors.length > 0 ? errors.join(', ') : 'Failed to create order item');
  }
};

/**
 * Update an order item
 */
export const updateOrderItem = async (id: number, orderItemData: OrderItemCreateDto): Promise<OrderItemResponse> => {
  try {
    const response = await axiosClient.put<OrderItemResponse>(`/api/OrderItem/UpdateOrderItem/${id}`, orderItemData);
    return response as OrderItemResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Order item not found');
    }
    const errors = error.response?.data?.errors || [];
    throw new Error(errors.length > 0 ? errors.join(', ') : 'Failed to update order item');
  }
};

/**
 * Delete an order item
 */
export const deleteOrderItem = async (id: number): Promise<void> => {
  try {
    await axiosClient.delete(`/api/OrderItem/DeleteOrderItem/${id}`);
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Order item not found');
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete order item');
  }
};

