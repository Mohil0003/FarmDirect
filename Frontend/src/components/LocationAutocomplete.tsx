import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';

interface LocationSuggestion {
    place_id: string;
    display_name: string;
    lat: string;
    lon: string;
    address?: {
        city?: string;
        state?: string;
        country?: string;
    };
}

interface LocationData {
    address: string;
    latitude: number;
    longitude: number;
}

interface LocationAutocompleteProps {
    value: string;
    onChange: (location: LocationData) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
    value,
    onChange,
    placeholder = 'Search for your location...',
    required = false,
    error,
}) => {
    const [inputValue, setInputValue] = useState(value);
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<number | null>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch location suggestions from Nominatim API
    const fetchSuggestions = async (query: string) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);

        try {
            // Using OpenStreetMap Nominatim API (free, no API key required)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(query)}` +
                `&format=json` +
                `&addressdetails=1` +
                `&limit=5` +
                `&countrycodes=in`, // Restrict to India, remove this line for worldwide search
                {
                    headers: {
                        'Accept-Language': 'en',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch locations');
            }

            const data: LocationSuggestion[] = await response.json();
            setSuggestions(data);
            setShowDropdown(true);
        } catch (error) {
            console.error('Error fetching location suggestions:', error);
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle input change with debouncing
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setSelectedLocation(null);

        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new timer for debounced API call
        debounceTimerRef.current = setTimeout(() => {
            fetchSuggestions(newValue);
        }, 500); // 500ms debounce
    };

    // Handle suggestion selection
    const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
        const locationData: LocationData = {
            address: suggestion.display_name,
            latitude: parseFloat(suggestion.lat),
            longitude: parseFloat(suggestion.lon),
        };

        setInputValue(suggestion.display_name);
        setSelectedLocation(locationData);
        setSuggestions([]);
        setShowDropdown(false);
        onChange(locationData);
    };

    // Handle clear
    const handleClear = () => {
        setInputValue('');
        setSelectedLocation(null);
        setSuggestions([]);
        onChange({ address: '', latitude: 0, longitude: 0 });
    };

    return (
        <div ref={wrapperRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm Location {required && <span className="text-red-500">*</span>}
            </label>

            <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => inputValue.length >= 3 && setShowDropdown(true)}
                    required={required}
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 outline-none transition-colors ${error
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-primary focus:ring-primary/20'
                        }`}
                    placeholder={placeholder}
                    autoComplete="off"
                />

                {/* Loading or Clear Button */}
                <div className="absolute right-3 top-3.5">
                    {isLoading ? (
                        <Loader2 className="text-gray-400 animate-spin" size={18} />
                    ) : inputValue ? (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
            )}

            {/* Selected Location Info */}
            {selectedLocation && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <MapPin size={12} />
                    Location confirmed: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                </p>
            )}

            {/* Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                        <button
                            key={suggestion.place_id}
                            type="button"
                            onClick={() => handleSelectSuggestion(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                            <div className="flex items-start gap-2">
                                <MapPin className="text-primary mt-0.5 flex-shrink-0" size={16} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {suggestion.display_name.split(',')[0]}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {suggestion.display_name}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No Results */}
            {showDropdown && !isLoading && inputValue.length >= 3 && suggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
                    No locations found. Try a different search term.
                </div>
            )}
        </div>
    );
};

export default LocationAutocomplete;
