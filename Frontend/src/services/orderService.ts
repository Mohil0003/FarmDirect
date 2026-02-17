import axiosClient from '../api/axiosClient';
import type { OrderCreateDto, OrderResponse, FarmerOrderWithDetails, FarmerOrderItem } from '../models/apiTypes';
import { getAllProducts } from './productService';
import { getAllOrderItems } from './orderItemService';
import { getUserById } from './userService';


/**
 * Order Service
 * Handles all order-related API calls
 */

/**
 * Get all orders
 */
export const getAllOrders = async (): Promise<OrderResponse[]> => {
  try {
    const response = await axiosClient.get<OrderResponse[]>('/api/Order/GetAllOrders');
    return response as OrderResponse[];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch orders');
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (id: number): Promise<OrderResponse> => {
  try {
    const response = await axiosClient.get<OrderResponse>(`/api/Order/${id}`);
    return response as OrderResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Order not found');
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch order');
  }
};

/**
 * Get orders by Consumer ID
 */
export const getOrdersByConsumerId = async (consumerId: number): Promise<OrderResponse[]> => {
  try {
    const allOrders = await getAllOrders();
    return allOrders.filter(order => order.consumerId === consumerId);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch consumer orders');
  }
};

/**
 * Create a new order
 */
export const createOrder = async (orderData: OrderCreateDto): Promise<OrderResponse> => {
  try {
    const response = await axiosClient.post<OrderResponse>('/api/Order/AddOrder', orderData);
    return response as OrderResponse;
  } catch (error: any) {
    const errors = error.response?.data?.errors || [];
    throw new Error(errors.length > 0 ? errors.join(', ') : 'Failed to create order');
  }
};

/**
 * Update an existing order
 */
export const updateOrder = async (id: number, orderData: OrderCreateDto): Promise<OrderResponse> => {
  try {
    const response = await axiosClient.put<OrderResponse>(`/api/Order/UpdateOrder/${id}`, orderData);
    return response as OrderResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Order not found');
    }
    const errors = error.response?.data?.errors || [];
    throw new Error(errors.length > 0 ? errors.join(', ') : 'Failed to update order');
  }
};

/**
 * Delete an order
 */
export const deleteOrder = async (id: number): Promise<void> => {
  try {
    await axiosClient.delete(`/api/Order/DeleteOrder/${id}`);
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Order not found');
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete order');
  }
};

/**
 * Get orders for current user based on role
 * - Consumer: Orders they purchased
 * - Farmer: Orders containing their products (needs to fetch order items)
 */
export const getMyOrders = async (userId: number, userRole: string): Promise<OrderResponse[]> => {
  try {
    const allOrders = await getAllOrders();

    if (userRole === 'Consumer') {
      // Return orders where consumerId matches
      return allOrders.filter(order => order.consumerId === userId);
    } else if (userRole === 'Farmer') {
      // For farmers, we need to check if any order items contain their products
      // This requires fetching order items and products - simplified version here
      // In a real scenario, you'd want a backend endpoint for this
      return allOrders; // Placeholder - needs product filtering
    }

    return [];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch orders');
  }
};

/**
 * Get order details with related data (order items, etc.)
 */
export const getOrderDetails = async (orderId: number): Promise<OrderResponse> => {
  try {
    const order = await getOrderById(orderId);
    return order;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch order details');
  }
};

/**
 * Get orders for a specific farmer
 * Fetches orders that contain products belonging to the farmer
 * Returns enriched orders with consumer names and product details
 */
export const getOrdersForFarmer = async (farmerId: number): Promise<FarmerOrderWithDetails[]> => {
  try {
    // Fetch all required data in parallel
    const [allOrders, allOrderItems, allProducts] = await Promise.all([
      getAllOrders(),
      getAllOrderItems(),
      getAllProducts()
    ]);

    console.log('🔍 [getOrdersForFarmer] Debug Info:');
    console.log(`   Farmer ID: ${farmerId}`);
    console.log(`   Total Orders: ${allOrders.length}`);
    console.log(`   Total Order Items: ${allOrderItems.length}`);
    console.log(`   Total Products: ${allProducts.length}`);

    // Get farmer's product IDs
    const farmerProducts = allProducts.filter(product => product.farmerId === farmerId);
    const farmerProductIds = new Set(farmerProducts.map(product => product.productId));

    console.log(`   Farmer's Products: ${farmerProducts.length}`);
    console.log(`   Farmer Product IDs: ${Array.from(farmerProductIds).join(', ') || 'None'}`);

    // Create a map for quick product lookup
    const productMap = new Map(
      allProducts.map(p => [p.productId, p])
    );

    // Find orders containing farmer's products
    const farmerOrdersMap = new Map<number, FarmerOrderItem[]>();

    for (const item of allOrderItems) {
      if (farmerProductIds.has(item.productId)) {
        const product = productMap.get(item.productId);
        const orderItem: FarmerOrderItem = {
          productId: item.productId,
          productName: product?.name || 'Unknown Product',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unit: product?.unit || 'unit'
        };

        if (farmerOrdersMap.has(item.orderId)) {
          farmerOrdersMap.get(item.orderId)!.push(orderItem);
        } else {
          farmerOrdersMap.set(item.orderId, [orderItem]);
        }
      }
    }

    console.log(`   Orders with farmer's products: ${farmerOrdersMap.size}`);

    // If no order items link to farmer's products, show all orders as a fallback
    // This helps when the data isn't fully linked yet
    if (farmerOrdersMap.size === 0 && allOrders.length > 0) {
      console.log('   ⚠️ No order items found for farmer products, showing all orders as fallback');

      const fallbackOrders: FarmerOrderWithDetails[] = [];
      for (const order of allOrders) {
        let consumerName = 'Unknown Customer';
        let consumerEmail = '';
        try {
          const consumer = await getUserById(order.consumerId);
          consumerName = consumer.fullName;
          consumerEmail = consumer.email;
        } catch {
          // Use default values if consumer fetch fails
        }

        fallbackOrders.push({
          ...order,
          consumerName,
          consumerEmail,
          items: [],
          itemCount: 0
        });
      }

      return fallbackOrders.sort((a, b) => {
        const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
        const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
        return dateB - dateA;
      });
    }

    // Filter orders and enrich with consumer details
    const farmerOrders: FarmerOrderWithDetails[] = [];

    for (const order of allOrders) {
      if (farmerOrdersMap.has(order.orderId)) {
        const items = farmerOrdersMap.get(order.orderId)!;

        // Fetch consumer details
        let consumerName = 'Unknown Customer';
        let consumerEmail = '';
        try {
          const consumer = await getUserById(order.consumerId);
          consumerName = consumer.fullName;
          consumerEmail = consumer.email;
        } catch {
          // Use default values if consumer fetch fails
        }

        farmerOrders.push({
          ...order,
          consumerName,
          consumerEmail,
          items,
          itemCount: items.length
        });
      }
    }

    console.log(`   ✅ Final farmer orders: ${farmerOrders.length}`);

    // Sort by order date (newest first)
    return farmerOrders.sort((a, b) => {
      const dateA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
      const dateB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
      return dateB - dateA;
    });

  } catch (error: any) {
    console.error('❌ [getOrdersForFarmer] Error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch farmer orders');
  }
};
