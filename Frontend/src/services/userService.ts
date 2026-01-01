import axiosClient from '../api/axiosClient';
import type { UserCreateDto, UserResponse } from '../models/apiTypes';

/**
 * User Service
 * Handles all user-related API calls
 */

/**
 * Get all users (typically for Admin)
 */
export const getAllUsers = async (): Promise<UserResponse[]> => {
  try {
    const response = await axiosClient.get<UserResponse[]>('/api/Users/GetAllUsers') as UserResponse[];
    // Remove passwordHash from all users
    return response.map(({ passwordHash, ...user }: UserResponse) => user as UserResponse);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch users');
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (id: number): Promise<UserResponse> => {
  try {
    const response = await axiosClient.get<UserResponse>(`/api/Users/${id}`) as UserResponse;
    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = response;
    return userWithoutPassword as UserResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('User not found');
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user');
  }
};

/**
 * Get current user profile (from localStorage or by ID)
 */
export const getCurrentUserProfile = async (): Promise<UserResponse | null> => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    if (user?.userId) {
      return await getUserById(user.userId);
    }
    
    return null;
  } catch (error: any) {
    console.error('Failed to get current user profile:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (id: number, userData: UserCreateDto): Promise<UserResponse> => {
  try {
    const response = await axiosClient.put<UserResponse>(`/api/Users/UpdateUser/${id}`, userData) as UserResponse;
    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = response;
    return userWithoutPassword as UserResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('User not found');
    }
    const errors = error.response?.data?.errors || [];
    throw new Error(errors.length > 0 ? errors.join(', ') : 'Failed to update user');
  }
};

/**
 * Delete user (typically for Admin)
 */
export const deleteUser = async (id: number): Promise<void> => {
  try {
    await axiosClient.delete(`/api/Users/DeleteUser/${id}`);
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('User not found');
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete user');
  }
};

/**
 * Get farmers only
 */
export const getFarmers = async (): Promise<UserResponse[]> => {
  try {
    const allUsers = await getAllUsers();
    return allUsers.filter(user => user.role === 'Farmer');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch farmers');
  }
};

/**
 * Get consumers only
 */
export const getConsumers = async (): Promise<UserResponse[]> => {
  try {
    const allUsers = await getAllUsers();
    return allUsers.filter(user => user.role === 'Consumer');
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch consumers');
  }
};

