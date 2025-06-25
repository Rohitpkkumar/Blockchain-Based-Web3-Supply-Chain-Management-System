import React, { useEffect, useState, useRef } from 'react';
import { ethers } from 'ethers';
import Map from '../components/common/Map';
import ShipmentSummary from '../components/dashboard/ShipmentSummary';
import DelayAlert from '../components/dashboard/DelayAlert';
import CarbonCalculator from '../components/dashboard/CarbonCalculator';
import RecentOrders from '../components/dashboard/RecentOrders';
import FraudDetection from '../components/dashboard/FraudDetection';
import { MapMarker, Order, DelayPrediction, CarbonEmission, FraudAlert, Partner, UserLocation } from '../types';
import { useWallet } from '../context/WalletContext';
import { getAllOrders, getAllPartners, getUserLocation, getCarbonEmissions, recordCarbonEmission } from '../contracts.ts';

interface DashboardProps {
  isMapExpanded: boolean;
  onToggleMapExpand: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ isMapExpanded, onToggleMapExpand }) => {
  const { state: walletState } = useWallet();
  const [orders, setOrders] = useState<Order[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);


  // Mock data for demonstration (you can remove these once real data works)
  const [delayPredictions, setDelayPredictions] = useState<DelayPrediction[]>([]);

  const generateMockDelayPredictions = (orders: Order[], partners: Partner[]): DelayPrediction[] => {
    const activeOrders = orders.filter(order => 
      order.shipmentStatus === 'In Transit' || 
      order.shipmentStatus === 'Picked Up'
    );

    // In Dashboard.tsx, modify the generateMockDelayPredictions function:
const generateMockDelayPredictions = (orders: Order[], partners: Partner[]): DelayPrediction[] => {
  const activeOrders = orders.filter(order => 
    order.shipmentStatus === 'In Transit' || 
    order.shipmentStatus === 'Picked Up'
  );

  // Force at least one delay for testing
  if (activeOrders.length > 0) {
    return [
      {
        orderId: activeOrders[0].id,
        probability: 0.85,
        reason: "Severe weather conditions (heavy rain)",
        estimatedDelay: 3.5,
        timestamp: new Date().toISOString()
      },
      ...(activeOrders.length > 1 ? [{
        orderId: activeOrders[1].id,
        probability: 0.45,
        reason: "Moderate traffic congestion",
        estimatedDelay: 1.2,
        timestamp: new Date().toISOString()
      }] : [])
    ];
  }

  return [];
};

    return activeOrders.map(order => {
      const supplier = partners.find(p => p.id === order.supplierId);
      const hasWeatherIssue = Math.random() > 0.7;
      const hasTrafficIssue = Math.random() > 0.6;
      
      let probability = 0;
      let reason = "No significant delays expected";
      let estimatedDelay = 0;

      if (hasWeatherIssue && hasTrafficIssue) {
        probability = 0.85;
        reason = "Severe weather conditions and heavy traffic congestion";
        estimatedDelay = 4.5;
      } else if (hasWeatherIssue) {
        probability = 0.65;
        reason = `Heavy ${Math.random() > 0.5 ? 'rain' : 'snow'} at ${supplier?.name || 'origin'}`;
        estimatedDelay = 2.5;
      } else if (hasTrafficIssue) {
        probability = 0.55;
        reason = "Traffic congestion on major routes";
        estimatedDelay = 1.5;
      } else if (Math.random() > 0.8) {
        // Small chance of minor delay even without major issues
        probability = 0.3;
        reason = "Minor logistical delays";
        estimatedDelay = 0.5;
      }

      return {
        orderId: order.id,
        probability,
        reason,
        estimatedDelay,
        timestamp: new Date().toISOString()
      };
    }).filter(prediction => prediction.probability > 0); // Only include predictions with actual delays
  };
  const [carbonEmissions, setCarbonEmissions] = useState<CarbonEmission[]>([]);

  const fraudAlerts: FraudAlert[] = [
    {
      id: 'fraud-1',
      type: 'duplicate_address',
      severity: 'medium',
      description: 'Multiple suppliers sharing the same physical address may indicate fraudulent entities.',
      relatedIds: ['SUPP-002', 'SUPP-005'],
    },
    {
      id: 'fraud-2',
      type: 'suspicious_pattern',
      severity: 'high',
      description: 'Unusual pattern of large orders followed by quick cancellations detected.',
      relatedIds: ['ORD-1004', 'ORD-982', 'ORD-981'],
    },
  ];

  useEffect(() => {
  if (userLocation && mapRef.current) {
    mapRef.current.flyTo([userLocation.position.lat, userLocation.position.lng], 12);
  }
}, [userLocation]);

  useEffect(() => {
  const loadData = async () => {
    if (walletState.isConnected && window.ethereum) {
      try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const [ordersData, partnersData, emissionsData] = await Promise.all([
            getAllOrders(provider),
            getAllPartners(provider),
            getCarbonEmissions(provider)
          ]);

        // Only fetch user location if we have an address
        if (walletState.address) {
          const location = await getUserLocation(provider, walletState.address);
          setUserLocation(location);
        }

        setOrders(ordersData);
        setPartners(partnersData);
        setCarbonEmissions(emissionsData);
        setIsLoading(false);
        const mockPredictions = generateMockDelayPredictions(ordersData, partnersData);
          setDelayPredictions(mockPredictions);
      } catch (error) {
        console.error('Failed to load data:', error);
        setIsLoading(false);
      }
    }
  };

  loadData();
}, [walletState.isConnected, walletState.address]);

// Add to Dashboard.tsx
useEffect(() => {
  const calculateEmissionsForActiveShipments = async () => {
    if (!walletState.isConnected || !window.ethereum) return;
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const activeOrders = orders.filter(o => 
      o.shipmentStatus === 'In Transit' || 
      o.shipmentStatus === 'Picked Up'
    );

    // Get existing emissions to avoid duplicate calculations
    const existingEmissions = await getCarbonEmissions(provider);
    
    for (const order of activeOrders) {
      // Skip if already calculated
      if (existingEmissions.some(e => e.orderId === order.id)) continue;
      
      try {
        // Call your carbon calculator service
        const response = await fetch(`http://localhost:5001/calculate-carbon/${order.id}`);
        if (!response.ok) continue;
        
        const result = await response.json();
        
        // Store on blockchain
        await recordCarbonEmission(
          provider,
          result.orderId,
          result.emissions,
          result.distance,
          result.transportType
        );
        
        // Update local state
        setCarbonEmissions(prev => [...prev, result]);
      } catch (error) {
        console.error(`Failed to calculate emissions for order ${order.id}:`, error);
      }
    }
  };

  calculateEmissionsForActiveShipments();
}, [orders, walletState.isConnected]);

const handleNewEmission = (emission: CarbonEmission) => {
    setCarbonEmissions(prev => {
      const existing = prev.find(e => e.orderId === emission.orderId);
      if (existing) {
        return prev.map(e => 
          e.orderId === emission.orderId ? emission : e
        );
      }
      return [...prev, emission];
    });
  };

const handleNewPrediction = (prediction: DelayPrediction) => {
    setDelayPredictions(prev => {
      const existing = prev.find(p => p.orderId === prediction.orderId);
      if (existing) {
        return prev.map(p => 
          p.orderId === prediction.orderId ? prediction : p
        );
      }
      return [...prev, prediction];
    });
  };

  // In Dashboard.tsx, update the markers creation logic:
useEffect(() => {
  const markers: MapMarker[] = [];

  // Add user location if available
  if (userLocation) {
    markers.push({
      id: 'user-1',
      position: userLocation.position,
      type: 'user',
      label: 'HQ'
    });
  }

  // Add partners
  partners.forEach(partner => {
    markers.push({
      id: partner.id,
      position: partner.position,
      type: 'partner',
      label: partner.name,
      partnerType: partner.type
    });
  });

  // Add carriers
  orders
    .filter(order => order.shipmentStatus === 'In Transit' && order.carrierId)
    .forEach(order => {
      const partner = partners.find(p => p.id === order.supplierId);
      if (partner) {
        markers.push({
          id: `carrier-${order.carrierId}`,
          position: partner.position,
          type: 'carrier',
          label: `Shipment ${order.id}`,
          orderId: order.id
        });
      }
    });

  setMapMarkers(markers);
}, [partners, orders, userLocation]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 lg:p-6">
        <div className="flex justify-center items-center h-64">
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="mb-6">
        <Map
          markers={mapMarkers}
          userLocation={userLocation?.position} 
          isExpanded={isMapExpanded}
          onToggleExpand={onToggleMapExpand}
        />
      </div>

      <div className="mb-6">
        <ShipmentSummary orders={orders} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <DelayAlert 
          predictions={delayPredictions}
          onNewPrediction={handleNewPrediction} />
        <CarbonCalculator 
          emissions={carbonEmissions} 
          onNewEmission={handleNewEmission}
        />

      </div>

      <div className="mt-6">
        <RecentOrders orders={orders} />
      </div>

      <div className="mt-6">
        <FraudDetection alerts={fraudAlerts} />
      </div>
    </div>
  );
};

export default Dashboard;