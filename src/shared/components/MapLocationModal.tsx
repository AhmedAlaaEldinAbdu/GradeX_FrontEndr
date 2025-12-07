import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import Modal from '../popups/Modal';
import Button from './Button';
import { logger } from '@/lib/utils/logger';

interface MapLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number };
  title?: string;
}

const MapLocationModal: React.FC<MapLocationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialLocation = { lat: 24.7136, lng: 46.6753 }, // Default to Riyadh
  title = 'تحديد موقع المدرسة',
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [address, setAddress] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Google Maps API Key from environment variable
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    language: 'ar',
  });

  // Reverse geocode to get address from coordinates
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setIsLoadingAddress(true);
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=ar`
        );
        const data = await response.json();
        if (data.results && data.results[0]) {
          setAddress(data.results[0].formatted_address);
        }
      } catch (error) {
        logger.error('Error reverse geocoding', error);
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      } finally {
        setIsLoadingAddress(false);
      }
    },
    [GOOGLE_MAPS_API_KEY]
  );

  // Load initial address
  useEffect(() => {
    if (isOpen) {
      reverseGeocode(selectedLocation.lat, selectedLocation.lng);
    }
  }, [isOpen, selectedLocation.lat, selectedLocation.lng, reverseGeocode]);

  // Handle map click
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setSelectedLocation({ lat, lng });
        reverseGeocode(lat, lng);
      }
    },
    [reverseGeocode]
  );

  // Handle get current location
  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setSelectedLocation({ lat, lng });
          reverseGeocode(lat, lng);
        },
        (error) => {
          logger.error('Error getting location', error);
          alert('تعذر الحصول على موقعك الحالي');
        }
      );
    } else {
      alert('المتصفح لا يدعم تحديد الموقع الجغرافي');
    }
  };

  const handleConfirm = () => {
    onConfirm({
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      address,
    });
    onClose();
  };

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '8px',
  };

  // Map options - defined as plain object to avoid google reference
  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: false,
  };

  // Custom marker icon - only created when Google Maps is loaded
  const getMarkerIcon = useCallback(() => {
    if (typeof google !== 'undefined' && google.maps) {
      return {
        path: 'M12 0C7.802 0 4.403 3.403 4.403 7.602c0 5.402 7.196 14.527 7.482 14.89a.31.31 0 00.23.108.31.31 0 00.23-.108c.286-.363 7.482-9.488 7.482-14.89C19.597 3.403 16.198 0 12 0zm0 11.574c-2.191 0-3.972-1.781-3.972-3.972S9.809 3.63 12 3.63s3.972 1.781 3.972 3.972-1.781 3.972-3.972 3.972z',
        fillColor: '#16A34A',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 2.5,
        anchor: new google.maps.Point(12, 24),
      };
    }
    return undefined;
  }, []);

  if (!isOpen) return null;

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md" title="">
        <div className="flex flex-col items-center justify-center py-8">
          <p className="mb-4 text-center text-red-600">
            مفتاح Google Maps API غير موجود. الرجاء إضافة المفتاح في ملف .env
          </p>
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </Modal>
    );
  }

  // Show loading state
  if (!isLoaded) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg" title="">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الخريطة...</p>
        </div>
      </Modal>
    );
  }

  // Show error if map failed to load
  if (loadError) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg" title="">
        <div className="flex flex-col items-center justify-center py-8">
          <p className="mb-4 text-center text-red-600">
            فشل تحميل الخريطة. الرجاء التحقق من الاتصال بالإنترنت ومفتاح API.
          </p>
          <Button variant="outline" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={
        <div className="w-full text-center">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
      }
    >
      <div className="flex flex-col">
        {/* Map Container with Google Maps */}
        <div className="relative mb-6 h-[400px] w-full overflow-hidden rounded-lg">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={selectedLocation}
            zoom={15}
            onClick={handleMapClick}
            options={mapOptions}
          >
            <Marker position={selectedLocation} icon={getMarkerIcon()} />
          </GoogleMap>

          {/* Address Display - Absolute at bottom of map */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-start gap-3 bg-white p-4 shadow-lg">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-right text-sm leading-relaxed text-gray-700">
              {isLoadingAddress ? 'جاري تحميل العنوان...' : address || 'حدد موقعاً على الخريطة'}
            </p>
          </div>

          {/* My Location Button - Bottom Right */}
          <button
            onClick={handleGetCurrentLocation}
            className="absolute bottom-20 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
            aria-label="موقعي"
            title="تحديد موقعي الحالي"
          >
            <svg
              className="h-5 w-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 px-8 text-gray-700 hover:bg-gray-50"
          >
            إلغاء
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            className="bg-green-600 px-8 hover:bg-green-700"
          >
            تأكيد
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MapLocationModal;
