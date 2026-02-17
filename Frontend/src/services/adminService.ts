import axiosClient from '../api/axiosClient';
import type { FarmerStatsResponse } from '../models/apiTypes';

/**
 * Admin Service
 * Handles admin-specific API calls
 */

/**
 * Get farmer-wise product statistics
 */
export const getFarmerStats = async (): Promise<FarmerStatsResponse[]> => {
    try {
        const response = await axiosClient.get<FarmerStatsResponse[]>('/api/Users/GetFarmerStats') as FarmerStatsResponse[];
        return response;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch farmer statistics');
    }
};
