import axiosClient from '../api/axiosClient';
import type { CategoryCreateDto, CategoryResponse } from '../models/apiTypes';

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

/**
 * Create a new category
 */
export const createCategory = async (categoryData: CategoryCreateDto): Promise<CategoryResponse> => {
  try {
    const response = await axiosClient.post<CategoryResponse>('/api/Category/AddCategory', categoryData);
    return response as CategoryResponse;
  } catch (error: any) {
    const errors = error.response?.data?.errors || [];
    throw new Error(errors.length > 0 ? errors.join(', ') : 'Failed to create category');
  }
};

/**
 * Update a category
 */
export const updateCategory = async (id: number, categoryData: CategoryCreateDto): Promise<CategoryResponse> => {
  try {
    const response = await axiosClient.put<CategoryResponse>(`/api/Category/UpdateCategory/${id}`, categoryData);
    return response as CategoryResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Category not found');
    }
    const errors = error.response?.data?.errors || [];
    throw new Error(errors.length > 0 ? errors.join(', ') : 'Failed to update category');
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await axiosClient.delete(`/api/Category/DeleteCategory/${id}`);
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Category not found');
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete category');
  }
};
