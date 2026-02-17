import axiosClient from '../api/axiosClient';
import type { LoginRequest, LoginResponse, UserCreateDto, UserResponse } from '../models/apiTypes';

/**
 * Authentication Service
 * 
 * NOTE: Your backend currently doesn't have a dedicated login endpoint.
 * This service provides structure for when you add JWT authentication.
 * For now, login() uses a workaround by fetching users and comparing passwords.
 * 
 * When you add proper authentication, update the login endpoint to:
 * POST /api/Auth/Login
 */

/**
 * Login user
 * TODO: Replace with proper JWT authentication endpoint when available
 * For now, this is a temporary solution that fetches users and validates credentials
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    // TODO: Replace this with proper authentication endpoint
    // Example: const response = await axiosClient.post('/api/Auth/Login', credentials);

    // Temporary workaround: Get all users and find matching email
    // WARNING: This is NOT secure and should be replaced with proper authentication
    const users = await axiosClient.get<UserResponse[]>('/api/Users/GetAllUsers') as UserResponse[];
    const user = users.find((u: UserResponse) => u.email === credentials.email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // TODO: Replace with proper password hashing comparison (bcrypt, etc.)
    // For now, this is just a placeholder - you should implement proper password verification
    // This compares plain text which is NOT secure
    if (user.passwordHash !== credentials.password) {
      throw new Error('Invalid email or password');
    }

    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = user;

    // TODO: When you add JWT, the token should come from the backend
    const token = 'temp-token-' + Date.now(); // Temporary token

    // Store token and user in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));

    return {
      token,
      user: userWithoutPassword as UserResponse,
      role: user.role,
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Login failed');
  }
};

/**
 * Register a new user
 */
export const register = async (userData: UserCreateDto): Promise<UserResponse> => {
  try {
    const response = await axiosClient.post<UserResponse>('/api/Users/AddUser', userData);

    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = response;

    return userWithoutPassword as UserResponse;
  } catch (error: any) {
    const errors = error.response?.data?.errors || [];
    throw new Error(errors.length > 0 ? errors.join(', ') : 'Registration failed');
  }
};

/**
 * Register as Farmer (same as register, but explicitly sets role)
 */
export const registerFarmer = async (farmerData: Omit<UserCreateDto, 'role'>): Promise<UserResponse> => {
  return register({ ...farmerData, role: 'Farmer' });
};

/**
 * Register as Consumer (same as register, but explicitly sets role)
 */
export const registerConsumer = async (consumerData: Omit<UserCreateDto, 'role'>): Promise<UserResponse> => {
  return register({ ...consumerData, role: 'Consumer' });
};

/**
 * Logout user (clear local storage)
 */
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): UserResponse | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Get current token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

