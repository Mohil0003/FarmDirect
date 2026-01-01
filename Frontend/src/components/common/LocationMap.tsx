import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Icon Fix: Prevent broken marker images
// Delete the default icon prototype to force re-import
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Default location (India center) for fallback
const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

// MapRecenter component: Dynamically updates map view when lat/lng props change
interface MapRecenterProps {
  center: [number, number];
  zoom?: number;
}

const MapRecenter: React.FC<MapRecenterProps> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom ?? map.getZoom(), {
      duration: 1.5, // Smooth animation duration in seconds
    });
  }, [map, center, zoom]);

  return null;
};

// Main LocationMap Component
interface LocationMapProps {
  lat: number | null | undefined;
  lng: number | null | undefined;
  popupText?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({ lat, lng, popupText }) => {
  // Validate coordinates
  const isValidLocation = 
    lat != null && 
    lng != null && 
    !isNaN(lat) && 
    !isNaN(lng) && 
    lat >= -90 && 
    lat <= 90 && 
    lng >= -180 && 
    lng <= 180;

  // Use provided coordinates or fallback to India center
  const mapCenter: [number, number] = isValidLocation 
    ? [lat, lng] 
    : DEFAULT_CENTER;

  const mapZoom = isValidLocation ? 13 : DEFAULT_ZOOM;

  return (
    <div className="h-[350px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 z-0">
      {!isValidLocation ? (
        // Fallback view: Show India with message
        <div className="h-full w-full bg-gray-100 flex items-center justify-center relative">
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </MapContainer>
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-[1000]">
            <div className="bg-white px-6 py-3 rounded-lg shadow-lg">
              <p className="text-gray-700 font-medium">Location not set</p>
            </div>
          </div>
        </div>
      ) : (
        // Valid location: Show map with marker
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={mapCenter}>
            {popupText && <Popup>{popupText}</Popup>}
          </Marker>
          {/* MapRecenter component: Automatically pans/flys to new location when props change */}
          <MapRecenter center={mapCenter} zoom={mapZoom} />
        </MapContainer>
      )}
    </div>
  );
};

export default LocationMap;

