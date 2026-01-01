import axiosClient from '../api/axiosClient';
import type { ReviewCreateDto, ReviewResponse } from '../models/apiTypes';

/**
 * Review Service
 * Handles all review-related API calls
 */

/**
 * Get all reviews
 */
export const getAllReviews = async (): Promise<ReviewResponse[]> => {
  try {
    const response = await axiosClient.get<ReviewResponse[]>('/api/Review/GetAllReviews');
    return response as ReviewResponse[];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch reviews');
  }
};

/**
 * Get review by ID
 */
export const getReviewById = async (id: number): Promise<ReviewResponse> => {
  try {
    const response = await axiosClient.get<ReviewResponse>(`/api/Review/${id}`);
    return response as ReviewResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Review not found');
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch review');
  }
};

/**
 * Get reviews for a specific product
 */
export const getProductReviews = async (productId: number): Promise<ReviewResponse[]> => {
  try {
    const allReviews = await getAllReviews();
    return allReviews.filter(review => review.productId === productId);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch product reviews');
  }
};

/**
 * Add a new review
 */
export const addReview = async (productId: number, rating: number, comment: string, consumerId: number): Promise<ReviewResponse> => {
  try {
    const reviewData: ReviewCreateDto = {
      productId,
      consumerId,
      rating,
      comment: comment || undefined,
    };
    const response = await axiosClient.post<ReviewResponse>('/api/Review/AddReview', reviewData);
    return response as ReviewResponse;
  } catch (error: any) {
    const errors = error.response?.data?.errors || [];
    throw new Error(errors.length > 0 ? errors.join(', ') : 'Failed to add review');
  }
};

/**
 * Update a review
 */
export const updateReview = async (id: number, reviewData: ReviewCreateDto): Promise<ReviewResponse> => {
  try {
    const response = await axiosClient.put<ReviewResponse>(`/api/Review/UpdateReview/${id}`, reviewData);
    return response as ReviewResponse;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Review not found');
    }
    const errors = error.response?.data?.errors || [];
    throw new Error(errors.length > 0 ? errors.join(', ') : 'Failed to update review');
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (id: number): Promise<void> => {
  try {
    await axiosClient.delete(`/api/Review/DeleteReview/${id}`);
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Review not found');
    }
    throw new Error(error.response?.data?.message || error.message || 'Failed to delete review');
  }
};

