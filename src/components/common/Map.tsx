import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Coordinates, MapMarker } from '../../types';

interface MapProps {
  markers: MapMarker[];
  userLocation?: Coordinates | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const Map: React.FC<MapProps> = ({ markers, userLocation, isExpanded, onToggleExpand }) => {
  const defaultCenter: Coordinates = { lat: 37.7749, lng: -122.4194 };
  const mapRef = useRef<L.Map | null>(null);
  
  // Priority: 1. User location 2. First marker with position 3. Default center
  const mapCenter = userLocation || 
                   (markers.length > 0 ? markers[0].position : defaultCenter);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 12);
    }
  }, [userLocation]);

  const createIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative">
          <div class="h-4 w-4 rounded-full shadow-md ${color}">
            <div class="absolute -inset-0.5 animate-ping rounded-full bg-current opacity-75"></div>
          </div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  };

  const getMarkerIcon = (type: MapMarker['type'], partnerType?: string) => {
    switch (type) {
      case 'user':
        return createIcon('bg-red-500');
      case 'partner':
        return partnerType === 'Importer' 
          ? createIcon('bg-blue-500') 
          : createIcon('bg-green-500');
      case 'carrier':
        return createIcon('bg-green-500');
      default:
        return createIcon('bg-gray-500');
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 ${
      isExpanded ? 'fixed inset-0 z-40 m-4 h-auto' : 'h-[400px] z-0'
    }`}>
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-3">
        <h3 className="text-base font-semibold text-gray-800">Live Shipment Map</h3>
        <button
          onClick={onToggleExpand}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
          aria-label={isExpanded ? 'Minimize map' : 'Expand map'}
        >
          {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      <MapContainer
        ref={mapRef}
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={7}
        className="h-full w-full"
        style={{ height: isExpanded ? 'calc(100vh - 8rem)' : '360px' }}
      >
        <TileLayer
          attribution='&copy; <a>Rohit</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.position.lat, marker.position.lng]}
            icon={getMarkerIcon(marker.type, marker.partnerType)}
          >
            {marker.label && (
              <Popup>
                <span className="font-medium">{marker.label}</span>
                {marker.orderId && <p>Order: {marker.orderId}</p>}
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-4 right-4 rounded-md bg-white p-3 shadow-md">
        <p className="mb-2 text-xs font-semibold text-gray-700">Legend</p>
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-primary-500"></div>
            <span className="text-xs text-gray-600">Your Location</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">Importers</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Exporters</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-orange-500"></div>
            <span className="text-xs text-gray-600">Carriers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;