import { useState, useEffect } from 'react';
import { Loader2, CreditCard, CheckCircle, XCircle, Clock, RefreshCw, Trash2 } from 'lucide-react';
import { getAllPayments, updatePayment, deletePayment } from '../services/paymentService';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import Pagination from '../components/common/Pagination';
import type { PaymentResponse } from '../models/apiTypes';

const PaymentManagementPage = () => {


    const [payments, setPayments] = useState<PaymentResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            setIsLoading(true);
            const data = await getAllPayments();
            setPayments(data.sort((a, b) => {
                const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
                const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
                return dateB - dateA;
            }));
        } catch (err: any) {
            showErrorToast(err.message || 'Failed to load payments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (payment: PaymentResponse, newStatus: string) => {
        try {
            setUpdatingId(payment.paymentId);
            await updatePayment(payment.paymentId, {
                orderId: payment.orderId,
                amount: payment.amount,
                paymentMethod: payment.paymentMethod,
                status: newStatus,
                paymentDate: payment.paymentDate,
            });
            showSuccessToast(`Payment #${payment.paymentId} marked as ${newStatus}`);
            await loadPayments();
        } catch (err: any) {
            showErrorToast(err.message || 'Failed to update payment');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this payment record? This cannot be undone.')) return;
        try {
            await deletePayment(id);
            showSuccessToast('Payment deleted');
            await loadPayments();
        } catch (err: any) {
            showErrorToast(err.message || 'Failed to delete payment');
        }
    };

    const getStatusConfig = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return { icon: <CheckCircle size={16} />, color: 'bg-green-100 text-green-700', label: 'Completed' };
            case 'failed':
                return { icon: <XCircle size={16} />, color: 'bg-red-100 text-red-700', label: 'Failed' };
            default:
                return { icon: <Clock size={16} />, color: 'bg-yellow-100 text-yellow-700', label: 'Pending' };
        }
    };

    const filteredPayments = filterStatus === 'all'
        ? payments
        : payments.filter(p => (p.status || 'Pending').toLowerCase() === filterStatus.toLowerCase());

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus]);

    // Pagination logic
    const totalItems = filteredPayments.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const completedAmount = payments.filter(p => p.status?.toLowerCase() === 'completed').reduce((sum, p) => sum + p.amount, 0);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-green-600" size={48} />
            </div>
        );
    }

    return (
        <div className="py-2">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                                <CreditCard className="text-green-600" size={32} />
                                Payment Management
                            </h1>
                            <p className="text-gray-500 mt-1">{payments.length} payments · ₹{totalAmount.toFixed(2)} total · ₹{completedAmount.toFixed(2)} collected</p>
                        </div>
                    </div>
                    <button
                        onClick={loadPayments}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {['Pending', 'Completed', 'Failed'].map(status => {
                        const count = payments.filter(p => (p.status || 'Pending').toLowerCase() === status.toLowerCase()).length;
                        const config = getStatusConfig(status);
                        return (
                            <div
                                key={status}
                                onClick={() => setFilterStatus(filterStatus === status.toLowerCase() ? 'all' : status.toLowerCase())}
                                className={`bg-white rounded-xl shadow p-5 cursor-pointer transition-all border-2 ${filterStatus === status.toLowerCase() ? 'border-green-500' : 'border-transparent hover:border-gray-200'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">{status}</p>
                                        <p className="text-3xl font-bold text-gray-800">{count}</p>
                                    </div>
                                    <div className={`p-3 rounded-xl ${config.color}`}>
                                        {config.icon}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {filteredPayments.length === 0 ? (
                        <div className="text-center py-16">
                            <CreditCard className="mx-auto text-gray-300 mb-4" size={64} />
                            <h3 className="text-xl font-semibold text-gray-600">No payments found</h3>
                            <p className="text-gray-400 mt-1">
                                {filterStatus !== 'all' ? `No ${filterStatus} payments` : 'No payment records yet'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Payment ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Order ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Method</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedPayments.map((payment) => {
                                    const statusConfig = getStatusConfig(payment.status);
                                    return (
                                        <tr key={payment.paymentId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">#{payment.paymentId}</td>
                                            <td className="px-6 py-4">
                                                <a href={`/admin/orders/${payment.orderId}`} className="text-green-600 hover:text-green-700 font-semibold">
                                                    Order #{payment.orderId}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-800">₹{payment.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-gray-600">{payment.paymentMethod || 'N/A'}</td>
                                            <td className="px-6 py-4 text-gray-600 text-sm">
                                                {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                                                    {statusConfig.icon}
                                                    {statusConfig.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {updatingId === payment.paymentId ? (
                                                        <Loader2 className="animate-spin text-gray-400" size={18} />
                                                    ) : (
                                                        <>
                                                            {payment.status?.toLowerCase() !== 'completed' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(payment, 'Completed')}
                                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-xs font-medium"
                                                                    title="Mark as Completed"
                                                                >
                                                                    <CheckCircle size={18} />
                                                                </button>
                                                            )}
                                                            {payment.status?.toLowerCase() !== 'failed' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(payment, 'Failed')}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs font-medium"
                                                                    title="Mark as Failed"
                                                                >
                                                                    <XCircle size={18} />
                                                                </button>
                                                            )}
                                                            {payment.status?.toLowerCase() !== 'pending' && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(payment, 'Pending')}
                                                                    className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors text-xs font-medium"
                                                                    title="Reset to Pending"
                                                                >
                                                                    <Clock size={18} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(payment.paymentId)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete Payment"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <Pagination 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={setItemsPerPage}
                            totalItems={totalItems}
                        />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentManagementPage;
