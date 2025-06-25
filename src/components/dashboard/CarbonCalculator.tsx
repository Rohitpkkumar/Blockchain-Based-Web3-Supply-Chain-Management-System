import React, { useState, useEffect } from 'react';
import { Truck, Ship, Plane, Train, Leaf } from 'lucide-react';
import { CarbonEmission } from '../../types';
import { useWallet } from '../../context/WalletContext';
import { ethers } from 'ethers';
import { recordCarbonEmission, getCarbonEmissions } from '../../contracts';

interface CarbonCalculatorProps {
  emissions: CarbonEmission[];
  onNewEmission?: (emission: CarbonEmission) => void;
}

const CarbonCalculator: React.FC<CarbonCalculatorProps> = ({ emissions, onNewEmission }) => {
  const { state: walletState } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [totalEmissions, setTotalEmissions] = useState(0);

  const calculateEmissions = async (orderId: string) => {
    if (!walletState.isConnected) {
      alert('Please connect your wallet to calculate emissions');
      return;
    }

    setIsLoading(true);
    
    try {
      // Call your carbon calculator service
      const response = await fetch(`http://localhost:5001/calculate-carbon/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to calculate emissions');
      }
      
      const result = await response.json();
      
      // Store on blockchain
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await recordCarbonEmission(
          provider,
          result.orderId,
          result.emissions,
          result.distance,
          result.transportType
        );
      }
      
      if (onNewEmission) {
        onNewEmission(result);
      }
    } catch (error) {
      console.error('Emission calculation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Calculate total emissions whenever emissions array changes
    const total = emissions.reduce((sum, e) => sum + e.emissions, 0);
    setTotalEmissions(total);
  }, [emissions]);

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'truck': return <Truck className="h-4 w-4" />;
      case 'ship': return <Ship className="h-4 w-4" />;
      case 'plane': return <Plane className="h-4 w-4" />;
      case 'train': return <Train className="h-4 w-4" />;
      default: return <Truck className="h-4 w-4" />;
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Carbon Emissions</h3>
        <div className="flex items-center space-x-2">
          <Leaf className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-gray-700">
            Total: {totalEmissions.toFixed(2)} kg CO₂
          </span>
        </div>
      </div>
      
      {emissions.length === 0 ? (
        <div className="mt-4 rounded-md bg-blue-50 p-4 text-center">
          <p className="text-sm text-blue-600">
            No emission data available. Calculate emissions for active shipments.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {emissions.map((emission) => (
            <div key={emission.orderId} className="rounded-md bg-gray-50 p-3">
              <div className="flex items-start space-x-3">
                <div className="rounded-full bg-green-100 p-2 text-green-600">
                  {getTransportIcon(emission.transportType)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      Order #{emission.orderId}
                    </h4>
                    <span className="text-xs font-semibold text-gray-600">
                      {emission.emissions.toFixed(2)} kg CO₂
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-600">
                    <span className="mr-2">Distance: {emission.distance.toFixed(2)} km</span>
                    <span className="flex items-center">
                      {getTransportIcon(emission.transportType)}
                      <span className="ml-1 capitalize">{emission.transportType}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => emissions.length > 0 && calculateEmissions(emissions[0].orderId)}
          disabled={isLoading || emissions.length === 0}
          className="btn btn-sm btn-outline"
        >
          {isLoading ? 'Calculating...' : 'Refresh Calculations'}
        </button>
      </div>
    </div>
  );
};

export default CarbonCalculator;