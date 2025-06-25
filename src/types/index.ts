// Wallet Types
export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
}

// Map Types
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string;
  position: Coordinates;
  type: 'user' | 'partner' | 'carrier';
  label?: string;
  partnerType?: 'Importer' | 'Exporter'; // Add this
  orderId?: string; // Add this
}

// Partner Types
export interface Partner {
  id: string;
  name: string;
  type: 'Importer' | 'Exporter';
  position: Coordinates;
  walletAddress: string;
  createdAt: string;
}

//User Location
export interface UserLocation {
  position: Coordinates;
}

// Order Types
export interface Order {
  id: string;
  supplierId: string;
  productId: string;
  orderDate: string;
  deliveryDate: string | null;
  price: number | null;
  isPaid: boolean;
  shipmentStatus: 'Pending' | 'Picked Up' | 'In Transit' | 'Delayed' | 'Delivered';
  requestStatus: 'Pending' | 'Approved' | 'Declined';
  carrierId: string | null;
  transportType: 'Truck' | 'Ship' | 'Plane' | 'Train'
}

// AI Prediction Types
export interface DelayPrediction {
  orderId: string;
  probability: number;
  reason: string;
  estimatedDelay: number;
  timestamp?: string;  // in hours
}

export interface CarbonEmission {
  orderId: string;
  emissions: number; // in kg CO2
  distance: number; // in km
  transportType: string;
}

export interface FraudAlert {
  id: string;
  type: 'duplicate_address' | 'suspicious_pattern' | 'location_mismatch';
  severity: 'low' | 'medium' | 'high';
  description: string;
  relatedIds: string[];
}

// App State Types
export interface AppState {
  currentPage: 'Dashboard' | 'Partners' | 'Orders' | 'Controls' | 'AIFeatures' | 'BlockchainFeatures' | 'Settings';
  isDarkMode: boolean;
  isMapExpanded: boolean;
}

// Theme Types
export interface ThemeState {
  isDarkMode: boolean;
}