import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    IndianRupee,
    TrendingUp,
    Package,
    ShoppingCart,
    Loader2,
    AlertCircle,
    ArrowLeft,
    Calendar,
    BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getOrdersForFarmer } from '../services/orderService';
import { getProductsByFarmerId } from '../services/productService';
import type { ProductResponse, FarmerOrderWithDetails } from '../models/apiTypes';

const RevenuePage = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<FarmerOrderWithDetails[]>([]);
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.userId) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [ordersData, productsData] = await Promise.all([
                getOrdersForFarmer(user!.userId),
                getProductsByFarmerId(user!.userId),
            ]);
            setOrders(ordersData);
            setProducts(productsData);
        } catch (err: any) {
            setError(err.message || 'Failed to load revenue data');
        } finally {
            setIsLoading(false);
        }
    };

    // Compute stats
    const totalRevenue = orders.reduce((sum, order) => {
        const orderTotal = order.items.length > 0
            ? order.items.reduce((s, item) => s + item.unitPrice * item.quantity, 0)
            : order.totalAmount;
        return sum + orderTotal;
    }, 0);

    const completedOrders = orders.filter(
        (o) => o.status === 'Delivered' || o.status === 'Completed'
    );
    const completedRevenue = completedOrders.reduce((sum, order) => {
        const orderTotal = order.items.length > 0
            ? order.items.reduce((s, item) => s + item.unitPrice * item.quantity, 0)
            : order.totalAmount;
        return sum + orderTotal;
    }, 0);

    const pendingRevenue = totalRevenue - completedRevenue;
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Revenue per product
    const productRevenueMap: Record<number, { name: string; revenue: number; unitsSold: number }> = {};
    orders.forEach((order) => {
        order.items.forEach((item) => {
            if (!productRevenueMap[item.productId]) {
                productRevenueMap[item.productId] = {
                    name: item.productName || `Product #${item.productId}`,
                    revenue: 0,
                    unitsSold: 0,
                };
            }
            productRevenueMap[item.productId].revenue += item.unitPrice * item.quantity;
            productRevenueMap[item.productId].unitsSold += item.quantity;
        });
    });

    const productRevenue = Object.values(productRevenueMap).sort(
        (a, b) => b.revenue - a.revenue
    );

    // Monthly revenue breakdown
    const monthlyMap: Record<string, number> = {};
    orders.forEach((order) => {
        if (order.orderDate) {
            const date = new Date(order.orderDate);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const orderTotal = order.items.length > 0
                ? order.items.reduce((s, item) => s + item.unitPrice * item.quantity, 0)
                : order.totalAmount;
            monthlyMap[key] = (monthlyMap[key] || 0) + orderTotal;
        }
    });

    const monthlyRevenue = Object.entries(monthlyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, revenue]) => {
            const [year, m] = month.split('-');
            const monthName = new Date(parseInt(year), parseInt(m) - 1).toLocaleDateString('en-IN', {
                month: 'short',
                year: 'numeric',
            });
            return { month: monthName, revenue };
        });

    const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="animate-spin text-green-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-600">Loading revenue data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="text-red-600" size={24} />
                        <div>
                            <p className="text-red-800 font-medium">Error loading revenue</p>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    </div>
                    <button
                        onClick={loadData}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Revenue Overview</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Track your earnings from {products.length} products across {orders.length} orders
                    </p>
                </div>
                <Link
                    to="/farmer"
                    className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors text-sm"
                >
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                            <IndianRupee className="text-white" size={22} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <TrendingUp size={12} className="text-green-500" />
                        From {orders.length} orders
                    </p>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Completed Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                ₹{completedRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                            <Package className="text-white" size={22} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <TrendingUp size={12} className="text-blue-500" />
                        {completedOrders.length} delivered orders
                    </p>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Pending Revenue</p>
                            <h3 className="text-2xl font-bold text-amber-600">
                                ₹{pendingRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                            <ShoppingCart className="text-white" size={22} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} className="text-amber-500" />
                        Awaiting delivery
                    </p>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Avg. Order Value</p>
                            <h3 className="text-2xl font-bold text-gray-800">
                                ₹{avgOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg">
                            <BarChart3 className="text-white" size={22} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <TrendingUp size={12} className="text-purple-500" />
                        Per order average
                    </p>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Monthly Revenue Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <BarChart3 size={20} className="text-green-600" />
                            Monthly Revenue
                        </h2>
                    </div>
                    <div className="p-5">
                        {monthlyRevenue.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No revenue data yet</p>
                        ) : (
                            <div className="space-y-3">
                                {monthlyRevenue.map((item) => (
                                    <div key={item.month} className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600 w-24 flex-shrink-0">{item.month}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                                style={{ width: `${Math.max((item.revenue / maxMonthlyRevenue) * 100, 8)}%` }}
                                            >
                                                <span className="text-[10px] font-bold text-white whitespace-nowrap">
                                                    ₹{item.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Revenue by Product */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Package size={20} className="text-blue-600" />
                            Revenue by Product
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {productRevenue.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No product revenue data yet</p>
                        ) : (
                            productRevenue.slice(0, 10).map((item, index) => (
                                <div key={item.name} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                                                index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                                                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                                                        'bg-gray-300'
                                            }`}>
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.unitsSold} units sold</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-green-700">
                                        ₹{item.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenuePage;
