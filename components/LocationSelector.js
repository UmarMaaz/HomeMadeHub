'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Target, CheckCircle } from 'lucide-react';

export default function LocationSelector({ onLocationSelect, initialLocation = null }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    let mapScript = document.querySelector('script[src^="https://maps.googleapis.com/maps/api/js"]');
    
    const handleMapLoad = () => {
      // Ensure we don't initialize twice
      if (!mapInstance.current && window.google && window.google.maps) {
        initMap();
      }
    };

    if (!mapScript) {
      mapScript = document.createElement('script');
      mapScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDGU-fCTyFVITYwM0fC00uzJtDxHnDNS3s&libraries=geometry,places,directions`;
      mapScript.async = true;
      mapScript.defer = true;
      document.head.appendChild(mapScript);
      
      mapScript.onload = handleMapLoad;
    } else {
      // If script already exists, check if Google Maps API is already loaded
      if (window.google && window.google.maps && !mapInstance.current) {
        handleMapLoad();
      } else {
        mapScript.addEventListener('load', handleMapLoad);
      }
    }

    mapScript.onerror = () => {
      setError('Failed to load Google Maps API');
      setLoading(false);
    };

    return () => {
      // Clean up the map when component unmounts
      if (mapInstance.current) {
        // Clear the map reference
        mapInstance.current = null;
      }
      if (markerRef.current) {
        markerRef.current = null;
      }
      
      // Remove event listener if script exists
      if (mapScript) {
        mapScript.removeEventListener('load', handleMapLoad);
      }
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current) {
      console.error('Map reference not available');
      setError('Map not loaded properly. Please try again.');
      setLoading(false);
      return;
    }

    // Clean up any existing map instance
    if (mapInstance.current) {
      // Remove the existing map
      mapInstance.current = null;
    }

    const defaultLocation = initialLocation || { lat: 37.0902, lng: -95.7129 }; // Center of US

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: defaultLocation,
      zoom: 12,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      styles: [
        {
          "featureType": "administrative",
          "elementType": "labels.text.fill",
          "stylers": [{"color": "#444444"}]
        },
        {
          "featureType": "landscape",
          "elementType": "all",
          "stylers": [{"color": "#f2f2f2"}]
        },
        {
          "featureType": "poi",
          "elementType": "all",
          "stylers": [{"visibility": "off"}]
        },
        {
          "featureType": "road",
          "elementType": "all",
          "stylers": [{"saturation": -100}, {"lightness": 45}]
        },
        {
          "featureType": "road.highway",
          "elementType": "all",
          "stylers": [{"visibility": "simplified"}]
        },
        {
          "featureType": "road.arterial",
          "elementType": "labels.icon",
          "stylers": [{"visibility": "off"}]
        },
        {
          "featureType": "transit",
          "elementType": "all",
          "stylers": [{"visibility": "off"}]
        },
        {
          "featureType": "water",
          "elementType": "all",
          "stylers": [{"color": "#f59e0b"}, {"visibility": "on"}]
        }
      ]
    });

    // Create draggable marker
    markerRef.current = new window.google.maps.Marker({
      position: defaultLocation,
      map: mapInstance.current,
      draggable: true,
      title: 'Drag to select location',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new window.google.maps.Size(40, 40)
      }
    });

    // Update location when marker is dragged
    markerRef.current.addListener('dragend', (event) => {
      const location = {
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng(),
      };
      setSelectedLocation(location);
      onLocationSelect(location);
    });

    // Update location when map is clicked
    mapInstance.current.addListener('click', (event) => {
      const location = {
        latitude: event.latLng.lat(),
        longitude: event.latLng.lng(),
      };
      if (markerRef.current) {
        markerRef.current.setPosition(event.latLng);
      }
      setSelectedLocation(location);
      onLocationSelect(location);
    });

    setLoading(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          if (mapInstance.current) {
            const latLng = new window.google.maps.LatLng(location.latitude, location.longitude);
            mapInstance.current.setCenter(latLng);
            mapInstance.current.setZoom(15);
            if (markerRef.current) {
              markerRef.current.setPosition(latLng);
            }
            setSelectedLocation(location);
            onLocationSelect(location);
          } else {
            console.error('Map instance not available');
            setError('Map not loaded properly. Please try again.');
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
          setError('Unable to retrieve your location. Please select manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser. Please select manually.');
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    } else {
      setError('Please select a location on the map first.');
    }
  };

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Select Delivery Location</h2>
            <p className="text-orange-100 mt-1">
              {selectedLocation 
                ? `Selected: ${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}` 
                : 'Click on the map or use your current location'}
            </p>
          </div>
          <MapPin className="h-10 w-10 text-amber-200" />
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-80">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-gray-700 font-medium">Loading map...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-50 bg-opacity-90 p-4">
            <div className="text-center">
              <div className="mx-auto bg-red-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-3">
                <Navigation className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-red-700 font-medium mb-2">Error</p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}
        
        <div 
          ref={mapRef} 
          className={`w-full ${loading || error ? 'h-0' : 'h-96'} transition-all duration-300`}
        />
      </div>

      {/* Controls */}
      <div className="bg-white p-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={getCurrentLocation}
              className="flex items-center px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Target className="h-5 w-5 mr-2" />
              Use My Location
            </button>
            
            <button
              type="button"
              onClick={handleConfirmLocation}
              disabled={!selectedLocation}
              className={`flex items-center px-5 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-md hover:shadow-lg transition-all duration-200 ${
                selectedLocation 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <MapPin className="h-5 w-5 mr-2" />
              Confirm Location
            </button>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Navigation className="h-4 w-4 mr-1 text-orange-500" />
            <span>Drag the marker or click on the map to select</span>
          </div>
        </div>
        
        {selectedLocation && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-700 font-medium">
                Location selected: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}