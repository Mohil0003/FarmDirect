// Mock Market Price Service
// In production, this would connect to a backend API or government price database

export interface MarketPrice {
    productName: string;
    category: string;
    averagePrice: number; // Price per kg
    unit: string;
    trend: 'up' | 'down' | 'stable';
    lastUpdated: string;
}

export interface PriceComparison {
    productName: string;
    farmerPrice: number;
    marketPrice: number;
    difference: number;
    differencePercent: number;
    recommendation: 'competitive' | 'too_low' | 'too_high';
    status: 'good' | 'warning' | 'alert';
}

// Mock market prices for common vegetables (in ₹/kg)
const mockMarketPrices: MarketPrice[] = [
    { productName: 'Tomato', category: 'Vegetables', averagePrice: 45, unit: 'kg', trend: 'up', lastUpdated: new Date().toISOString() },
    { productName: 'Potato', category: 'Vegetables', averagePrice: 30, unit: 'kg', trend: 'stable', lastUpdated: new Date().toISOString() },
    { productName: 'Onion', category: 'Vegetables', averagePrice: 40, unit: 'kg', trend: 'down', lastUpdated: new Date().toISOString() },
    { productName: 'Carrot', category: 'Vegetables', averagePrice: 50, unit: 'kg', trend: 'stable', lastUpdated: new Date().toISOString() },
    { productName: 'Cabbage', category: 'Vegetables', averagePrice: 25, unit: 'kg', trend: 'up', lastUpdated: new Date().toISOString() },
    { productName: 'Cauliflower', category: 'Vegetables', averagePrice: 35, unit: 'kg', trend: 'stable', lastUpdated: new Date().toISOString() },
    { productName: 'Spinach', category: 'Leafy Greens', averagePrice: 40, unit: 'kg', trend: 'up', lastUpdated: new Date().toISOString() },
    { productName: 'Brinjal', category: 'Vegetables', averagePrice: 38, unit: 'kg', trend: 'stable', lastUpdated: new Date().toISOString() },
    { productName: 'Cucumber', category: 'Vegetables', averagePrice: 32, unit: 'kg', trend: 'down', lastUpdated: new Date().toISOString() },
    { productName: 'Beans', category: 'Vegetables', averagePrice: 60, unit: 'kg', trend: 'up', lastUpdated: new Date().toISOString() },
];

/**
 * Get all current market prices
 */
export const getMarketPrices = (): MarketPrice[] => {
    return mockMarketPrices;
};

/**
 * Find market price for a specific product
 */
export const findMarketPrice = (productName: string): MarketPrice | null => {
    // Fuzzy match - case insensitive and partial match
    const normalized = productName.toLowerCase().trim();
    return mockMarketPrices.find(price =>
        price.productName.toLowerCase().includes(normalized) ||
        normalized.includes(price.productName.toLowerCase())
    ) || null;
};

/**
 * Compare farmer's price with market average
 */
export const comparePrice = (productName: string, farmerPrice: number): PriceComparison | null => {
    const marketPrice = findMarketPrice(productName);

    if (!marketPrice) {
        return null;
    }

    const difference = farmerPrice - marketPrice.averagePrice;
    const differencePercent = (difference / marketPrice.averagePrice) * 100;

    let recommendation: 'competitive' | 'too_low' | 'too_high';
    let status: 'good' | 'warning' | 'alert';

    if (differencePercent < -15) {
        recommendation = 'too_low';
        status = 'alert';
    } else if (differencePercent > 20) {
        recommendation = 'too_high';
        status = 'warning';
    } else {
        recommendation = 'competitive';
        status = 'good';
    }

    return {
        productName,
        farmerPrice,
        marketPrice: marketPrice.averagePrice,
        difference,
        differencePercent,
        recommendation,
        status,
    };
};

/**
 * Get price recommendation message
 */
export const getPriceRecommendation = (comparison: PriceComparison): string => {
    if (comparison.recommendation === 'too_low') {
        return `Consider raising price by ₹${Math.abs(comparison.difference).toFixed(0)}/kg`;
    } else if (comparison.recommendation === 'too_high') {
        return `Price is ${comparison.differencePercent.toFixed(0)}% above market average`;
    } else {
        return 'Competitive pricing';
    }
};
