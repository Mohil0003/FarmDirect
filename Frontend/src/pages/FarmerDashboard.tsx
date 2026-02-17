import { useState } from 'react';
import { MapPin, Edit2, Save } from 'lucide-react';
import LocationMap from '../components/common/LocationMap';

/**
 * Example: FarmerDashboard Profile Section
 * Shows how to use LocationMap component so farmers can see their saved location
 */
const FarmerDashboard = () => {
  // In a real app, these would come from your API/User context
  // Example: Farmer's current saved location (Pune, Maharashtra, India)
  const [farmerLat, _setFarmerLat] = useState<number | null>(18.5204);
  const [farmerLng, _setFarmerLng] = useState<number | null>(73.8567);
  const [isEditing, setIsEditing] = useState(false);

  // Handle location updates (in real app, this would call your API)
  const handleSaveLocation = () => {
    // API call would go here
    console.log('Saving location:', farmerLat, farmerLng);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="text-primary" size={24} />
              My Farm Location
            </h1>
            <button
              onClick={() => isEditing ? handleSaveLocation() : setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            >
              {isEditing ? (
                <>
                  <Save size={18} />
                  Save Location
                </>
              ) : (
                <>
                  <Edit2 size={18} />
                  Edit Location
                </>
              )}
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            This is your registered farm location. Customers will see this location when viewing your products.
          </p>

          {/* LocationMap Component Usage */}
          <LocationMap
            lat={farmerLat}
            lng={farmerLng}
            popupText="My Farm Location"
          />

          {/* Location Coordinates Display (Optional) */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Latitude: </span>
                <span className="text-gray-600">{farmerLat?.toFixed(4) ?? 'Not set'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Longitude: </span>
                <span className="text-gray-600">{farmerLng?.toFixed(4) ?? 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Note: If coordinates are null/undefined, the map will show "Location not set" overlay */}
          {(!farmerLat || !farmerLng) && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ Your location is not set. Please update your location so customers can find your farm.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;

