import axiosClient from '../api/axiosClient';
import type { ProductCreateDto, ProductResponse } from '../models/apiTypes';

/**
 * Product Service
 * Handles all product-related API calls
 */

/**
 * Get all products
 */
export const getAllProducts = async (): Promise<ProductResponse[]> => {
  try {
    const response = await axiosClient.get<ProductResponse[]>('/api/Products/GetAllProducts');
    return response as ProductResponse[];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch products');
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (id: number): Promise<ProductResponse> => {
  try {
    const response = await axiosClient.get<ProductResponse>(`/api/Products/${id}`);
    return response as ProductResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Product not found');
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch product');
  }
};

/**
 * Get products by Farmer ID
 */
export const getProductsByFarmerId = async (farmerId: number): Promise<ProductResponse[]> => {
  try {
    const allProducts = await getAllProducts();
    return allProducts.filter(product => product.farmerId === farmerId);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch farmer products');
  }
};

/**
 * Create a new product (for Farmers)
 */
export const createProduct = async (productData: ProductCreateDto): Promise<ProductResponse> => {
  try {
    const response = await axiosClient.post<ProductResponse>('/api/Products/AddProduct', productData);
    return response as ProductResponse;
  } catch (error: any) {
    const errors = error.response?.data?.errors || [];
    throw new Error(errors.length > 0 ? errors.join(', ') : 'Failed to create product');
  }
};

/**
 * Update an existing product
 */
export const updateProduct = async (id: number, productData: ProductCreateDto): Promise<ProductResponse> => {
  try {
    const response = await axiosClient.put<ProductResponse>(`/api/Products/UpdateProduct/${id}`, productData);
    return response as ProductResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Product not found');
    }
    const errors = error.response?.data?.errors || [];
    throw new Error(errors.length > 0 ? errors.join(', ') : 'Failed to update product');
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (id: number): Promise<void> => {
  try {
    await axiosClient.delete(`/api/Products/DeleteProduct/${id}`);
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Product not found');
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete product');
  }
};

/**
 * Get active products only
 */
export const getActiveProducts = async (): Promise<ProductResponse[]> => {
  try {
    const allProducts = await getAllProducts();
    return allProducts.filter(product => product.isActive !== false);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch active products');
  }
};

/**
 * Get reviews for a specific product
 */
export const getProductReviews = async (productId: number): Promise<any[]> => {
  try {
    const response = await axiosClient.get<any[]>('/api/Review/GetAllReviews');
    return (response as any[]).filter((review: any) => review.productId === productId);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch product reviews');
  }
};

