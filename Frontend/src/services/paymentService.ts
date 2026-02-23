import axiosClient from '../api/axiosClient';
import type { PaymentCreateDto, PaymentResponse } from '../models/apiTypes';

/**
 * Payment Service
 * Handles all payment-related API calls
 */

/**
 * Get all payments
 */
export const getAllPayments = async (): Promise<PaymentResponse[]> => {
    try {
        const response = await axiosClient.get<PaymentResponse[]>('/api/Payment/GetAllPayments');
        return response as PaymentResponse[];
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch payments');
    }
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (id: number): Promise<PaymentResponse> => {
    try {
        const response = await axiosClient.get<PaymentResponse>(`/api/Payment/${id}`);
        return response as PaymentResponse;
    } catch (error: any) {
        if (error.response?.status === 404) {
            throw new Error('Payment not found');
        }
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch payment');
    }
};

/**
 * Get payments by Order ID
 */
export const getPaymentsByOrderId = async (orderId: number): Promise<PaymentResponse[]> => {
    try {
        const allPayments = await getAllPayments();
        return allPayments.filter(payment => payment.orderId === orderId);
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch order payments');
    }
};

/**
 * Create a payment
 */
export const createPayment = async (paymentData: PaymentCreateDto): Promise<PaymentResponse> => {
    try {
        const response = await axiosClient.post<PaymentResponse>('/api/Payment/AddPayment', paymentData);
        return response as PaymentResponse;
    } catch (error: any) {
        const errors = error.response?.data?.errors || [];
        throw new Error(errors.length > 0 ? errors.join(', ') : 'Failed to create payment');
    }
};

/**
 * Update a payment
 */
export const updatePayment = async (id: number, paymentData: PaymentCreateDto): Promise<PaymentResponse> => {
    try {
        const response = await axiosClient.put<PaymentResponse>(`/api/Payment/UpdatePayment/${id}`, paymentData);
        return response as PaymentResponse;
    } catch (error: any) {
        if (error.response?.status === 404) {
            throw new Error('Payment not found');
        }
        const errors = error.response?.data?.errors || [];
        throw new Error(errors.length > 0 ? errors.join(', ') : 'Failed to update payment');
    }
};

/**
 * Delete a payment
 */
export const deletePayment = async (id: number): Promise<void> => {
    try {
        await axiosClient.delete(`/api/Payment/DeletePayment/${id}`);
    } catch (error: any) {
        if (error.response?.status === 404) {
            throw new Error('Payment not found');
        }
        throw new Error(error.response?.data?.message || error.message || 'Failed to delete payment');
    }
};
