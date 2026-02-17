import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ProductResponse } from '../../models/apiTypes';
import { getMarketPrices, comparePrice, type MarketPrice, type PriceComparison } from '../../services/marketPriceService';

interface MarketPriceTickerProps {
    products: ProductResponse[];
}

interface TickerItem {
    marketPrice: MarketPrice;
    comparison?: PriceComparison;
    isFarmerProduct: boolean;
}

const MarketPriceTicker: React.FC<MarketPriceTickerProps> = ({ products }) => {
    const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);

    useEffect(() => {
        const marketPrices = getMarketPrices();

        // Create ticker items with comparisons for farmer's products
        const items: TickerItem[] = marketPrices.map(marketPrice => {
            const farmerProduct = products.find(p =>
                p.name.toLowerCase().includes(marketPrice.productName.toLowerCase()) ||
                marketPrice.productName.toLowerCase().includes(p.name.toLowerCase())
            );

            if (farmerProduct) {
                const comparison = comparePrice(farmerProduct.name, farmerProduct.currentPrice);
                return {
                    marketPrice,
                    comparison: comparison || undefined,
                    isFarmerProduct: true,
                };
            }

            return {
                marketPrice,
                isFarmerProduct: false,
            };
        });

        setTickerItems(items);
    }, [products]);

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        if (trend === 'up') return <TrendingUp size={14} className="text-green-600" />;
        if (trend === 'down') return <TrendingDown size={14} className="text-red-600" />;
        return <Minus size={14} className="text-gray-400" />;
    };

    const getComparisonColor = (comparison?: PriceComparison) => {
        if (!comparison) return 'text-gray-700';
        if (comparison.status === 'good') return 'text-green-700';
        if (comparison.status === 'warning') return 'text-orange-700';
        return 'text-red-700';
    };

    const getComparisonBg = (comparison?: PriceComparison) => {
        if (!comparison) return 'bg-gray-50';
        if (comparison.status === 'good') return 'bg-green-50';
        if (comparison.status === 'warning') return 'bg-orange-50';
        return 'bg-red-50';
    };

    return (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-3 border-b border-blue-500/30">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <TrendingUp size={16} />
                    Market Price Trends
                    <span className="text-blue-200 text-xs font-normal ml-2">
                        Updated today • Your products highlighted
                    </span>
                </h3>
            </div>

            <div className="relative overflow-hidden bg-white">
                <div className="ticker-wrapper py-3">
                    <div className="ticker-content flex gap-6 animate-ticker">
                        {/* Duplicate items for seamless loop */}
                        {[...tickerItems, ...tickerItems].map((item, index) => (
                            <div
                                key={`${item.marketPrice.productName}-${index}`}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg whitespace-nowrap ${item.isFarmerProduct
                                        ? `${getComparisonBg(item.comparison)} border-2 border-blue-300`
                                        : 'bg-gray-50'
                                    }`}
                            >
                                {/* Product Name */}
                                <div className="flex items-center gap-2">
                                    {item.isFarmerProduct && (
                                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded font-medium">
                                            YOUR PRODUCT
                                        </span>
                                    )}
                                    <span className="font-semibold text-gray-800">
                                        {item.marketPrice.productName}
                                    </span>
                                </div>

                                {/* Market Price */}
                                <div className="flex items-center gap-1">
                                    {getTrendIcon(item.marketPrice.trend)}
                                    <span className="text-sm text-gray-600">
                                        Market: <span className="font-bold text-gray-800">₹{item.marketPrice.averagePrice}</span>/{item.marketPrice.unit}
                                    </span>
                                </div>

                                {/* Comparison (if farmer's product) */}
                                {item.comparison && (
                                    <div className={`flex items-center gap-1 text-sm font-medium ${getComparisonColor(item.comparison)}`}>
                                        <span>Your Price: ₹{item.comparison.farmerPrice.toFixed(0)}</span>
                                        <span className="text-xs">
                                            ({item.comparison.differencePercent > 0 ? '+' : ''}
                                            {item.comparison.differencePercent.toFixed(0)}%)
                                        </span>
                                        {item.comparison.status === 'alert' && (
                                            <span className="ml-1 text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                                                TOO LOW
                                            </span>
                                        )}
                                        {item.comparison.status === 'good' && (
                                            <span className="ml-1 text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                                                COMPETITIVE
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        .ticker-wrapper {
          overflow: hidden;
        }
        
        .ticker-content {
          display: flex;
          animation: ticker 40s linear infinite;
        }
        
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .ticker-content:hover {
          animation-play-state: paused;
        }
      `}</style>
        </div>
    );
};

export default MarketPriceTicker;
