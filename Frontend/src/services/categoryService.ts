import axiosClient from '../api/axiosClient';
import type { CategoryResponse } from '../models/apiTypes';

/**
 * Category Service
 * Handles all category-related API calls
 */

/**
 * Get all categories
 */
export const getAllCategories = async (): Promise<CategoryResponse[]> => {
  try {
    const response = await axiosClient.get<CategoryResponse[]>('/api/Category/GetAllCategories');
    return response as CategoryResponse[];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch categories');
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (id: number): Promise<CategoryResponse> => {
  try {
    const response = await axiosClient.get<CategoryResponse>(`/api/Category/${id}`);
    return response as CategoryResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Category not found');
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch category');
  }
};

