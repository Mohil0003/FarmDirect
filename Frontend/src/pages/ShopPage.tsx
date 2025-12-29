import React, { useState } from 'react';
import { ShoppingCart, Search, Filter } from 'lucide-react';

// Mock Data (Later this will come from your API)
const PRODUCTS = [
  { id: 1, name: 'Organic Tomatoes', price: 40, farmer: 'Green Farms', image: '🍅', category: 'Vegetable' },
  { id: 2, name: 'Fresh Potatoes', price: 25, farmer: 'Mohil Agro', image: '🥔', category: 'Vegetable' },
  { id: 3, name: 'Sweet Mangoes', price: 150, farmer: 'Desai Orchards', image: '🥭', category: 'Fruit' },
  { id: 4, name: 'Basmati Rice', price: 90, farmer: 'Punjab Fields', image: '🍚', category: 'Grains' },
];

const ShopPage = () => {
  const [cartCount, setCartCount] = useState(0);

  const addToCart = () => {
    setCartCount(cartCount + 1);
    // In real app: call API or update Context
  };

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
                placeholder="Search for fresh vegetables..." 
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:border-primary focus:outline-none bg-gray-50"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          <button className="relative p-2 text-gray-600 hover:text-primary transition-colors">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-secondary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
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

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group">
              
              {/* Product Image Area */}
              <div className="h-48 bg-gray-100 flex items-center justify-center text-6xl relative">
                {product.image}
                <span className="absolute top-3 left-3 bg-white/90 px-2 py-1 text-xs font-bold text-primary rounded-md">
                  {product.category}
                </span>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-1 text-xs text-text-muted">Sold by {product.farmer}</div>
                <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xl font-bold text-gray-900">₹{product.price}<span className="text-xs font-normal text-gray-500">/kg</span></span>
                  <button 
                    onClick={addToCart}
                    className="bg-primary hover:bg-primary-dark text-white p-2 rounded-lg transition-colors"
                  >
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ShopPage;