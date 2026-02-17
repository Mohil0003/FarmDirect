import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, TrendingDown, Package } from 'lucide-react';
import type { ProductResponse } from '../../models/apiTypes';

interface LowStockAlertProps {
    products: ProductResponse[];
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ products }) => {
    // Identify low stock products
    // Low stock = less than 10 units OR less than 20% of average stock
    const averageStock = products.length > 0
        ? products.reduce((sum, p) => sum + p.stockQuantity, 0) / products.length
        : 0;

    const lowStockProducts = products.filter(product => {
        const threshold = Math.max(10, averageStock * 0.2);
        return product.stockQuantity < threshold && product.isActive !== false;
    });

    if (lowStockProducts.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <Package className="text-green-600" size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Inventory Health</h3>
                </div>
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package className="text-green-600" size={32} />
                    </div>
                    <p className="text-green-600 font-medium">All products well-stocked!</p>
                    <p className="text-sm text-gray-500 mt-1">No items requiring attention</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="text-red-600" size={20} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">Low Stock Alerts</h3>
                    <p className="text-sm text-gray-500">{lowStockProducts.length} item{lowStockProducts.length !== 1 ? 's' : ''} requiring attention</p>
                </div>
            </div>

            <div className="space-y-3">
                {lowStockProducts.map((product) => {
                    const isCritical = product.stockQuantity < 5;

                    return (
                        <div
                            key={product.productId}
                            className={`p-4 rounded-lg border-l-4 ${isCritical
                                    ? 'bg-red-50 border-red-500'
                                    : 'bg-yellow-50 border-yellow-500'
                                }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-gray-800">{product.name}</h4>
                                        {isCritical && (
                                            <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full font-medium">
                                                CRITICAL
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <TrendingDown className={isCritical ? 'text-red-600' : 'text-yellow-600'} size={16} />
                                        <span className={isCritical ? 'text-red-700 font-medium' : 'text-yellow-700'}>
                                            Only {product.stockQuantity} {product.unit} left
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Current price: ₹{product.currentPrice.toFixed(2)}/{product.unit}
                                    </p>
                                </div>
                                <Link
                                    to={`/products/${product.productId}/edit`}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isCritical
                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                            : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                        }`}
                                >
                                    Restock
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Tip: Keep stock above 10 units to avoid running out
                </p>
            </div>
        </div>
    );
};

export default LowStockAlert;
