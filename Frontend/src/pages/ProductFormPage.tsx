import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  DollarSign,
  Calendar,
  Image as ImageIcon,
  Loader2,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createProduct, updateProduct, getProductById } from '../services/productService';
import { getAllCategories } from '../services/categoryService';
import type { ProductCreateDto } from '../models/apiTypes';
import type { CategoryResponse } from '../models/apiTypes';

const ProductFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditMode = !!id;

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductCreateDto>({
    farmerId: user?.userId || 0,
    categoryId: 0,
    name: '',
    description: '',
    basePrice: 0,
    currentPrice: 0,
    stockQuantity: 0,
    unit: 'Kg',
    harvestDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    imageUrl: '',
  });

  const units = ['Kg', 'Gram', 'Liter', 'Piece', 'Bunch', 'Box', 'Dozen'];

  useEffect(() => {
    loadCategories();
    if (isEditMode && id) {
      loadProduct(parseInt(id));
    }
  }, [id, isEditMode]);

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const data = await getAllCategories();
      setCategories(data);
      // Set first category as default if available
      if (data.length > 0 && !isEditMode) {
        setFormData(prev => ({ ...prev, categoryId: data[0].categoryId }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const loadProduct = async (productId: number) => {
    try {
      setIsLoading(true);
      const product = await getProductById(productId);
      
      // Check if user owns this product (for farmers)
      if (user?.role === 'Farmer' && product.farmerId !== user.userId) {
        setError('You do not have permission to edit this product');
        navigate('/farmer');
        return;
      }

      setFormData({
        farmerId: product.farmerId,
        categoryId: product.categoryId,
        name: product.name,
        description: product.description || '',
        basePrice: product.basePrice,
        currentPrice: product.currentPrice,
        stockQuantity: product.stockQuantity,
        unit: product.unit,
        harvestDate: product.harvestDate.split('T')[0],
        expiryDate: product.expiryDate.split('T')[0],
        imageUrl: product.imageUrl || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'categoryId' || name === 'farmerId' 
        ? parseInt(value) 
        : (name === 'basePrice' || name === 'currentPrice' || name === 'stockQuantity'
          ? parseFloat(value) || 0
          : value),
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    if (formData.categoryId === 0) {
      setError('Please select a category');
      return;
    }

    if (formData.currentPrice <= 0) {
      setError('Current price must be greater than 0');
      return;
    }

    if (formData.basePrice <= 0) {
      setError('Base price must be greater than 0');
      return;
    }

    if (formData.stockQuantity < 0) {
      setError('Stock quantity cannot be negative');
      return;
    }

    if (!user?.userId) {
      setError('You must be logged in to add products');
      return;
    }

    setIsLoading(true);

    try {
      const productData = {
        ...formData,
        farmerId: user.userId,
      };

      if (isEditMode && id) {
        await updateProduct(parseInt(id), productData);
      } else {
        await createProduct(productData);
      }

      navigate('/farmer');
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} product`);
      console.error('Product form error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCategories || (isEditMode && isLoading && !formData.name)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/farmer"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? 'Update your product information' : 'Add a new product to your inventory'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                  placeholder="e.g., Organic Tomatoes"
                />
              </div>
            </div>

            {/* Category and Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                >
                  <option value={0}>Select a category</option>
                  {categories.map((category) => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors resize-none"
                placeholder="Describe your product (e.g., Fresh, organic, locally grown)"
              />
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="number"
                    id="basePrice"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="currentPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Price (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="number"
                    id="currentPrice"
                    name="currentPrice"
                    value={formData.currentPrice}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Stock Quantity */}
            <div>
              <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="stockQuantity"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available quantity in {formData.unit}
              </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Harvest Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="date"
                    id="harvestDate"
                    name="harvestDate"
                    value={formData.harvestDate}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    required
                    min={formData.harvestDate}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL (Optional)
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {formData.imageUrl && (
                <div className="mt-2">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>{isEditMode ? 'Update Product' : 'Create Product'}</span>
                  </>
                )}
              </button>
              <Link
                to="/farmer"
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <X size={20} />
                <span>Cancel</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductFormPage;

