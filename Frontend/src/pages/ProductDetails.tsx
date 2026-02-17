import { ArrowLeft, ShoppingCart } from 'lucide-react';
import LocationMap from '../components/common/LocationMap';

/**
 * Example: ProductDetails Page (Consumer Side)
 * Shows how to use LocationMap component to display a Farmer's location
 */
const ProductDetails = () => {
  // In a real app, these would come from your API/state
  // Using dummy coordinates as requested (Ahmedabad, Gujarat, India)
  const farmerLat = 23.0225;
  const farmerLng = 72.5714;
  const productName = 'Organic Tomatoes';
  const farmerName = 'Green Valley Farms';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <ArrowLeft size={20} />
          <span>Back to Shop</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Product Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{productName}</h1>
            <p className="text-gray-600 mb-4">
              Fresh organic tomatoes grown with sustainable farming practices.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <span className="font-semibold text-gray-700">Price: </span>
                <span className="text-2xl font-bold text-primary">₹40/kg</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Farmer: </span>
                <span className="text-lg text-gray-800">{farmerName}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Stock: </span>
                <span className="text-green-600">In Stock (50 kg)</span>
              </div>
            </div>

            <button className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
              <ShoppingCart size={20} />
              Add to Cart
            </button>
          </div>

          {/* Right Column: Farmer Location Map */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Farm Location
            </h2>
            <p className="text-gray-600 mb-4">
              Location of {farmerName}
            </p>

            {/* LocationMap Component Usage */}
            <LocationMap
              lat={farmerLat}
              lng={farmerLng}
              popupText={`${farmerName} - Farm Location`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

