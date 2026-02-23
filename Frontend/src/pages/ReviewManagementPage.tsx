import { useState, useEffect } from 'react';
import { Loader2, Star, Trash2, MessageSquare, RefreshCw } from 'lucide-react';
import { getAllReviews, deleteReview } from '../services/reviewService';
import { getAllProducts } from '../services/productService';
import { getAllUsers } from '../services/userService';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';
import type { ReviewResponse, ProductResponse, UserResponse } from '../models/apiTypes';

interface ReviewWithDetails extends ReviewResponse {
    productName?: string;
    consumerName?: string;
}

const ReviewManagementPage = () => {


    const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterRating, setFilterRating] = useState<number | null>(null);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            setIsLoading(true);
            const [allReviews, allProducts, allUsers] = await Promise.all([
                getAllReviews(),
                getAllProducts(),
                getAllUsers(),
            ]);

            const productMap = new Map<number, ProductResponse>(allProducts.map(p => [p.productId, p]));
            const userMap = new Map<number, UserResponse>(allUsers.map(u => [u.userId, u]));

            const enriched: ReviewWithDetails[] = allReviews.map(r => ({
                ...r,
                productName: productMap.get(r.productId)?.name || `Product #${r.productId}`,
                consumerName: userMap.get(r.consumerId)?.fullName || `User #${r.consumerId}`,
            }));

            // Sort newest first
            enriched.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            });

            setReviews(enriched);
        } catch (err: any) {
            showErrorToast(err.message || 'Failed to load reviews');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this review? This cannot be undone.')) return;
        try {
            await deleteReview(id);
            showSuccessToast('Review deleted');
            await loadReviews();
        } catch (err: any) {
            showErrorToast(err.message || 'Failed to delete review');
        }
    };

    const filteredReviews = filterRating
        ? reviews.filter(r => r.rating === filterRating)
        : reviews;

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : '0.0';

    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: reviews.filter(r => r.rating === rating).length,
        percentage: reviews.length > 0
            ? Math.round((reviews.filter(r => r.rating === rating).length / reviews.length) * 100)
            : 0,
    }));

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
                                <MessageSquare className="text-green-600" size={32} />
                                Review Management
                            </h1>
                            <p className="text-gray-500 mt-1">{reviews.length} reviews · Average: {averageRating} ★</p>
                        </div>
                    </div>
                    <button
                        onClick={loadReviews}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                </div>

                {/* Rating Distribution */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="font-semibold text-gray-800 mb-4">Rating Distribution</h2>
                    <div className="space-y-2">
                        {ratingDistribution.map(({ rating, count, percentage }) => (
                            <button
                                key={rating}
                                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${filterRating === rating ? 'bg-green-50 ring-2 ring-green-500' : 'hover:bg-gray-50'}`}
                            >
                                <span className="text-sm font-medium text-gray-600 w-8">{rating} ★</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-yellow-400 h-full rounded-full transition-all"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-500 w-16 text-right">{count} ({percentage}%)</span>
                            </button>
                        ))}
                    </div>
                    {filterRating && (
                        <button
                            onClick={() => setFilterRating(null)}
                            className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                            Clear filter
                        </button>
                    )}
                </div>

                {/* Reviews List */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {filteredReviews.length === 0 ? (
                        <div className="text-center py-16">
                            <MessageSquare className="mx-auto text-gray-300 mb-4" size={64} />
                            <h3 className="text-xl font-semibold text-gray-600">No reviews found</h3>
                            <p className="text-gray-400 mt-1">
                                {filterRating ? `No ${filterRating}-star reviews` : 'No reviews yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredReviews.map((review) => (
                                <div key={review.reviewId} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            size={16}
                                                            className={review.rating && star <= review.rating
                                                                ? 'text-yellow-400 fill-yellow-400'
                                                                : 'text-gray-300'
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-800">{review.consumerName}</span>
                                                <span className="text-sm text-gray-400">·</span>
                                                <span className="text-sm text-gray-500">
                                                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-green-600 font-medium mb-1">
                                                Product: {review.productName}
                                            </p>
                                            {review.comment ? (
                                                <p className="text-gray-700">{review.comment}</p>
                                            ) : (
                                                <p className="text-gray-400 italic">No comment</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(review.reviewId)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4 flex-shrink-0"
                                            title="Delete review"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewManagementPage;
