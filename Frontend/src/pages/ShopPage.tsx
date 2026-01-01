import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Filter, Loader2 } from 'lucide-react';
import { getAllProducts } from '../services/productService';
import type { ProductResponse } from '../models/apiTypes';

const ShopPage = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllProducts();
      // Filter only active products
      setProducts(data.filter(p => p.isActive !== false));
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = () => {
    setCartCount(cartCount + 1);
    // TODO: Integrate with Cart API when ready
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-text-main">
      
      {/* 1. Navbar (Consumer Specific) */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-dark">Farm<span className="text-secondary">Direct</span></h1>
          
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for fresh vegetables..." 
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:border-primary focus:outline-none bg-gray-50"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary transition-colors">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-secondary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* 2. Main Shop Area */}
      <main className="container mx-auto px-4 py-8">
        
        {/* Filters Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Fresh Arrivals</h2>
          <button className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-primary">
            <Filter size={18} /> Filters
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={loadProducts}
              className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!isLoading && !error && (
          <>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No products found</p>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-primary hover:underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.productId}
                    to={`/products/${product.productId}`}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group block"
                  >
                    
                    {/* Product Image Area */}
                    <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to emoji if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.nextElementSibling) {
                              (target.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full flex items-center justify-center text-6xl ${product.imageUrl ? 'hidden' : ''}`}
                        style={{ display: product.imageUrl ? 'none' : 'flex' }}
                      >
                        🍅
                      </div>
                      {product.stockQuantity <= 0 && (
                        <span className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded-md">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="mb-1 text-xs text-text-muted">Stock: {product.stockQuantity} {product.unit}</div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-xl font-bold text-gray-900">₹{product.currentPrice}</span>
                          <span className="text-xs font-normal text-gray-500">/{product.unit}</span>
                          {product.basePrice !== product.currentPrice && (
                            <div className="text-xs text-gray-400 line-through">₹{product.basePrice}</div>
                          )}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart();
                          }}
                          disabled={product.stockQuantity <= 0}
                          className="bg-primary hover:bg-primary-dark text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart size={18} />
                        </button>
                      </div>
                    </div>

                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ShopPage;