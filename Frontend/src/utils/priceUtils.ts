import { differenceInDays, parseISO, isValid } from 'date-fns';

/**
 * Calculate the number of days until a product expires
 */
export const calculateDaysUntilExpiry = (expiryDate: string): number => {
    try {
        const expiry = parseISO(expiryDate);
        if (!isValid(expiry)) {
            return 999; // Return high number for invalid dates (no discount)
        }
        const today = new Date();
        const days = differenceInDays(expiry, today);
        return Math.max(0, days); // Don't return negative days
    } catch (error) {
        console.error('Error calculating days until expiry:', error);
        return 999; // Return high number on error (no discount)
    }
};

/**
 * Calculate discount percentage based on days until expiry
 * Discount tiers:
 * - 7+ days: 0% (no discount)
 * - 5-6 days: 10%
 * - 3-4 days: 25%
 * - 1-2 days: 50%
 * - Same day (0 days): 70%
 */
export const calculateDiscountPercentage = (daysUntilExpiry: number): number => {
    if (daysUntilExpiry >= 7) return 0;
    if (daysUntilExpiry >= 5) return 10;
    if (daysUntilExpiry >= 3) return 25;
    if (daysUntilExpiry >= 1) return 50;
    return 70; // Same day or expired
};

/**
 * Calculate discounted price based on base price and expiry date
 */
export const calculateDiscountedPrice = (
    basePrice: number,
    expiryDate: string
): {
    currentPrice: number;
    discountPercentage: number;
    daysUntilExpiry: number;
    savings: number;
} => {
    const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);
    const discountPercentage = calculateDiscountPercentage(daysUntilExpiry);
    const currentPrice = basePrice * (1 - discountPercentage / 100);
    const savings = basePrice - currentPrice;

    return {
        currentPrice: Math.round(currentPrice * 100) / 100, // Round to 2 decimals
        discountPercentage,
        daysUntilExpiry,
        savings: Math.round(savings * 100) / 100,
    };
};

/**
 * Format price in Indian Rupees
 */
export const formatPrice = (price: number): string => {
    return `₹${price.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

/**
 * Get urgency level based on days until expiry
 */
export const getUrgencyLevel = (
    daysUntilExpiry: number
): 'fresh' | 'moderate' | 'urgent' | 'critical' => {
    if (daysUntilExpiry >= 7) return 'fresh';
    if (daysUntilExpiry >= 3) return 'moderate';
    if (daysUntilExpiry >= 1) return 'urgent';
    return 'critical';
};

/**
 * Get urgency color classes for Tailwind
 */
export const getUrgencyColorClasses = (urgency: 'fresh' | 'moderate' | 'urgent' | 'critical') => {
    switch (urgency) {
        case 'fresh':
            return {
                bg: 'bg-green-100',
                text: 'text-green-700',
                border: 'border-green-300',
            };
        case 'moderate':
            return {
                bg: 'bg-yellow-100',
                text: 'text-yellow-700',
                border: 'border-yellow-300',
            };
        case 'urgent':
            return {
                bg: 'bg-orange-100',
                text: 'text-orange-700',
                border: 'border-orange-300',
            };
        case 'critical':
            return {
                bg: 'bg-red-100',
                text: 'text-red-700',
                border: 'border-red-300',
            };
    }
};

/**
 * Get urgency label
 */
export const getUrgencyLabel = (daysUntilExpiry: number): string => {
    if (daysUntilExpiry >= 7) return 'Fresh';
    if (daysUntilExpiry >= 3) return 'Best Before';
    if (daysUntilExpiry >= 1) return 'Expiring Soon';
    return 'Last Day!';
};
