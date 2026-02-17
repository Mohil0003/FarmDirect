import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Clock, MapPin, CheckCircle2, Package } from 'lucide-react';
import type { OrderResponse } from '../../models/apiTypes';

interface DeliveryScheduleProps {
    orders: OrderResponse[];
}

const DeliverySchedule: React.FC<DeliveryScheduleProps> = ({ orders }) => {
    // Filter orders for today and pending/processing status
    const todayDeliveries = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return orders.filter(order => {
            if (!order.orderDate) return false;

            const orderDate = new Date(order.orderDate);
            const isPending = order.status === 'Pending' || order.status === 'Processing';
            const isToday = orderDate >= today && orderDate < tomorrow;

            return isToday && isPending;
        }).sort((a, b) => {
            // Sort by order date (earliest first)
            const dateA = new Date(a.orderDate || 0);
            const dateB = new Date(b.orderDate || 0);
            return dateA.getTime() - dateB.getTime();
        });
    }, [orders]);

    // Calculate deadline (5 PM today)
    const getDeadlineTime = () => {
        const now = new Date();
        const deadline = new Date();
        deadline.setHours(17, 0, 0, 0); // 5 PM

        const diffMs = deadline.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffMs < 0) return 'Deadline passed';
        if (diffHours === 0) return `${diffMins} mins left`;
        return `${diffHours}h ${diffMins}m left`;
    };

    if (todayDeliveries.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Truck className="text-blue-600" size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Today's Deliveries</h3>
                </div>
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="text-gray-400" size={32} />
                    </div>
                    <p className="text-gray-600 font-medium">No deliveries scheduled</p>
                    <p className="text-sm text-gray-500 mt-1">All caught up for today!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Truck className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Today's Deliveries</h3>
                        <p className="text-sm text-gray-500">{todayDeliveries.length} order{todayDeliveries.length !== 1 ? 's' : ''} to pack</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 rounded-lg">
                    <Clock className="text-orange-600" size={16} />
                    <span className="text-sm font-medium text-orange-700">{getDeadlineTime()}</span>
                </div>
            </div>

            <div className="space-y-3">
                {todayDeliveries.map((order) => (
                    <div
                        key={order.orderId}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-800">
                                        Order #ORD-{order.orderId.toString().padStart(4, '0')}
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'Pending'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Package size={14} />
                                    <span className="font-bold text-gray-800">₹{order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                            <Link
                                to={`/orders/${order.orderId}`}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                View Details
                            </Link>
                        </div>

                        {/* Delivery Address */}
                        <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{order.deliveryAddress}</span>
                        </div>

                        {/* Order Time */}
                        {order.orderDate && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                <Clock size={12} />
                                <span>
                                    Ordered at {new Date(order.orderDate).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                    to="/orders"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                    View all orders →
                </Link>
            </div>
        </div>
    );
};

export default DeliverySchedule;
