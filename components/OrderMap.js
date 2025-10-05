'use client';

import { useEffect, useRef, useState } from 'react';

export default function OrderMap({ buyerLocation, sellerLocation }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mapScript = document.querySelector('script[src^="https://maps.googleapis.com/maps/api/js"]');
    
    if (!mapScript) {
      mapScript = document.createElement('script');
      mapScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDGU-fCTyFVITYwM0fC00uzJtDxHnDNS3s&libraries=geometry,places,directions`;
      mapScript.async = true;
      mapScript.defer = true;
      document.head.appendChild(mapScript);
    }

    mapScript.onload = () => {
      initMap();
    };

    mapScript.onerror = () => {
      setError('Failed to load Google Maps API');
      setLoading(false);
    };

    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [buyerLocation, sellerLocation]);

  const initMap = () => {
    if (!buyerLocation || !sellerLocation) {
      setLoading(false);
      return;
    }

    // Calculate center between buyer and seller
    const center = {
      lat: (buyerLocation.latitude + sellerLocation.latitude) / 2,
      lng: (buyerLocation.longitude + sellerLocation.longitude) / 2,
    };

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: 12,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
    });

    // Create markers for buyer and seller
    const buyerMarker = new window.google.maps.Marker({
      position: { lat: buyerLocation.latitude, lng: buyerLocation.longitude },
      map: mapInstance.current,
      title: 'Buyer Location',
      label: 'B',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      },
    });

    const sellerMarker = new window.google.maps.Marker({
      position: { lat: sellerLocation.latitude, lng: sellerLocation.longitude },
      map: mapInstance.current,
      title: 'Seller Location',
      label: 'S',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      },
    });

    // Show route between buyer and seller
    directionsServiceRef.current = new window.google.maps.DirectionsService();
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      map: mapInstance.current,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 6,
      },
    });

    const request = {
      origin: { lat: sellerLocation.latitude, lng: sellerLocation.longitude },
      destination: { lat: buyerLocation.latitude, lng: buyerLocation.longitude },
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    directionsServiceRef.current.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRendererRef.current.setDirections(result);
      } else {
        console.error('Directions request failed due to ' + status);
      }
      setLoading(false);
    });
  };

  if (!buyerLocation || !sellerLocation) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Location data not available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {loading && (
        <div className="w-full h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      )}
      {error && (
        <div className="w-full h-96 flex items-center justify-center bg-red-100 text-red-700">
          {error}
        </div>
      )}
      <div 
        ref={mapRef} 
        className={`w-full ${loading || error ? 'h-0' : 'h-96'} transition-all duration-300`}
      />
    </div>
  );
}