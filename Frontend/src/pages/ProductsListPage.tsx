import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, Search, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProductsByFarmerId, deleteProduct } from '../services/productService';
import Pagination from '../components/common/Pagination';
import type { ProductResponse } from '../models/apiTypes';

const ProductsListPage: React.FC = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ProductResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6); // 6 products per page (2 rows of 3)

    useEffect(() => {
        loadProducts();
    }, [user]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredProducts(products);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = products.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query)
            );
            setFilteredProducts(filtered);
        }
        setCurrentPage(1); // Reset to first page on search
    }, [searchQuery, products]);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            setError(null);

            if (user?.userId) {
                const farmerProducts = await getProductsByFarmerId(user.userId);
                setProducts(farmerProducts);
                setFilteredProducts(farmerProducts);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load products');
            console.error('Error loading products:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProduct = async (productId: number, productName: string) => {
        if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
            return;
        }

        try {
            await deleteProduct(productId);
            setProducts(products.filter(p => p.productId !== productId));
        } catch (err: any) {
            alert(err.message || 'Failed to delete product');
        }
    };

    const calculateDiscount = (basePrice: number, currentPrice: number) => {
        if (basePrice <= currentPrice) return null;
        const discount = ((basePrice - currentPrice) / basePrice) * 100;
        return {
            amount: basePrice - currentPrice,
            percentage: discount
        };
    };

    // Pagination logic
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
                            <p className="mt-1 text-sm text-gray-500">Manage your product inventory and pricing</p>
                        </div>
                        <Link to="/products/new" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
                            <Plus size={20} />
                            Add New Product
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Search products by name or description..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                    </div>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-green-600" size={48} />
                    </div>
                )}

                {error && !isLoading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="text-red-600" size={24} />
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {!isLoading && !error && (
                    <>
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-20">
                                <Package className="mx-auto mb-4 text-gray-300" size={64} />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">{searchQuery ? 'No products found' : 'No products yet'}</h3>
                                <p className="text-gray-500 mb-6">{searchQuery ? 'Try adjusting your search query' : 'Start by adding your first product'}</p>
                                {!searchQuery && (
                                    <Link to="/products/new" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                                        <Plus size={20} />
                                        Add Your First Product
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="mb-4 text-sm text-gray-600">Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} product{totalItems !== 1 ? 's' : ''}</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {paginatedProducts.map((product) => {
                                        const discount = calculateDiscount(product.basePrice, product.currentPrice);

                                        return (
                                            <div key={product.productId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                                <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="text-green-600" size={64} />
                                                    )}
                                                </div>

                                                <div className="p-5">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                                                            <p className="text-sm text-gray-500 line-clamp-2">{product.description || 'No description'}</p>
                                                        </div>
                                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${product.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                            {product.isActive !== false ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>

                                                    <div className="mb-4">
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-2xl font-bold text-green-600">₹{product.currentPrice.toFixed(2)}</span>
                                                            <span className="text-sm text-gray-500">/ {product.unit}</span>
                                                        </div>
                                                        {discount && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-sm text-gray-400 line-through">₹{product.basePrice.toFixed(2)}</span>
                                                                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">{discount.percentage.toFixed(0)}% OFF</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mb-4 pb-4 border-b border-gray-100">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">Stock:</span>
                                                            <span className={`font-semibold ${product.stockQuantity < 10 ? 'text-red-600' : 'text-gray-900'}`}>{product.stockQuantity} {product.unit}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Link to={`/products/${product.productId}/edit`} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                                            <Edit size={16} />
                                                            Edit
                                                        </Link>
                                                        <button onClick={() => handleDeleteProduct(product.productId, product.name)} className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                                                            <Trash2 size={16} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {totalItems > 0 && (
                                    <div className="mt-8">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            itemsPerPage={itemsPerPage}
                                            onItemsPerPageChange={setItemsPerPage}
                                            totalItems={totalItems}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductsListPage;
