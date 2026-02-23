import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, Loader2, MapPin, Tag } from 'lucide-react';
import LocationMap from '../components/common/LocationMap';
import { getProductById } from '../services/productService';
import { getProductReviews, addReview } from '../services/reviewService';
import { getUserById } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { calculateDiscountedPrice, getUrgencyLevel, getUrgencyLabel, getUrgencyColorClasses } from '../utils/priceUtils';
import type { ProductResponse, ReviewResponse, UserResponse } from '../models/apiTypes';

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { addToCart: addToCartContext } = useCart();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [farmer, setFarmer] = useState<UserResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      loadProductDetails();
    }
  }, [id]);

  const loadProductDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const productId = parseInt(id || '0');
      const productData = await getProductById(productId);
      setProduct(productData);

      // Fetch farmer data for location
      const farmerData = await getUserById(productData.farmerId);
      setFarmer(farmerData);

      // Fetch reviews
      const reviewsData = await getProductReviews(productId);
      setReviews(reviewsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load product details');
      console.error('Error loading product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user || !product) return;

    try {
      setIsAddingToCart(true);
      await addToCartContext(product.productId, quantity, product.name);
    } catch (err: any) {
      // Error is handled by CartContext with toast
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;

    try {
      setIsSubmittingReview(true);
      const newReview = await addReview(product.productId, reviewRating, reviewComment, user.userId);
      setReviews([...reviews, newReview]);
      setReviewComment('');
      setReviewRating(5);
      setShowReviewForm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <Link to="/shop" className="text-primary hover:underline">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

  // Calculate dynamic pricing
  const pricing = product ? calculateDiscountedPrice(product.basePrice, product.expiryDate) : null;
  const urgency = pricing ? getUrgencyLevel(pricing.daysUntilExpiry) : 'fresh';
  const urgencyColors = getUrgencyColorClasses(urgency);
  const urgencyLabel = pricing ? getUrgencyLabel(pricing.daysUntilExpiry) : '';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column: Product Image */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-8xl">🌾</div>
              )}
            </div>

            {/* Discount Badge on Image */}
            {pricing && pricing.discountPercentage > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 text-lg font-bold rounded-full shadow-lg flex items-center gap-2">
                <Tag size={20} />
                {pricing.discountPercentage}% OFF
              </div>
            )}

            {/* Urgency Badge */}
            {pricing && (
              <div className={`absolute bottom-4 right-4 ${urgencyColors.bg} ${urgencyColors.text} px-3 py-2 text-sm font-semibold rounded-lg`}>
                {urgencyLabel}
              </div>
            )}
          </div>

          {/* Right Column: Product Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

            {/* Price */}
            <div className="mb-4">
              {pricing && (
                <>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-primary">₹{pricing.currentPrice.toFixed(2)}</span>
                    <span className="text-gray-500 text-lg">/{product.unit}</span>
                  </div>
                  {pricing.discountPercentage > 0 && (
                    <div className="mt-2">
                      <span className="text-xl text-gray-400 line-through">₹{product.basePrice.toFixed(2)}</span>
                      <span className="ml-3 text-green-600 font-bold text-lg">
                        Save ₹{pricing.savings.toFixed(2)} ({pricing.discountPercentage}% OFF)
                      </span>
                    </div>
                  )}
                  {pricing.daysUntilExpiry <= 7 && (
                    <div className={`mt-2 ${urgencyColors.text} font-medium`}>
                      {pricing.daysUntilExpiry === 0 ? '⚠️ Expires today!' : `📅 ${pricing.daysUntilExpiry} days until expiry`}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Farmer Info */}
            {farmer && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Sold by</p>
                <p className="font-semibold text-gray-800">{farmer.fullName}</p>
                {farmer.address && (
                  <p className="text-sm text-gray-600">{farmer.address}</p>
                )}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
            )}

            {/* Stock & Details */}
            <div className="mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Stock:</span>
                <span className={product.stockQuantity > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {product.stockQuantity} {product.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Harvest Date:</span>
                <span className="text-gray-800">
                  {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expiry Date:</span>
                <span className="text-gray-800">
                  {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  disabled={quantity >= product.stockQuantity}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
                <span className="text-sm text-gray-500">({product.unit})</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity <= 0 || isAddingToCart || !user}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  Add {quantity} to Cart
                </>
              )}
            </button>
            {!user && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Please <Link to="/login" className="text-primary hover:underline">login</Link> to add items to cart
              </p>
            )}
          </div>
        </div>

        {/* Farm Location Map */}
        {farmer && (farmer.latitude != null && farmer.longitude != null) && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="text-primary" size={24} />
              Farm Location
            </h2>
            <LocationMap
              lat={farmer.latitude}
              lng={farmer.longitude}
              popupText={`${farmer.fullName}'s Farm`}
            />
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Reviews</h2>
              <div className="flex items-center gap-2">
                <Star className="text-yellow-400 fill-yellow-400" size={20} />
                <span className="font-semibold text-gray-800">
                  {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
            {user && user.role === 'Consumer' && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                Write a Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && user && (
            <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewRating(rating)}
                      className={`${reviewRating >= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star size={24} className={reviewRating >= rating ? 'fill-current' : ''} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  rows={4}
                  placeholder="Share your experience..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingReview && <Loader2 className="animate-spin" size={16} />}
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewComment('');
                    setReviewRating(5);
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.reviewId} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Star
                          key={rating}
                          size={16}
                          className={review.rating && rating <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    {review.createdAt && (
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {review.comment && <p className="text-gray-700">{review.comment}</p>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;

