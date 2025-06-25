// components/dashboard/AIDelayPrediction.tsx (updated)
import React from 'react';
import { Clock, AlertTriangle, CheckCircle, CloudRain, TrafficCone, AlertCircle } from 'lucide-react';

interface PredictionData {
  predicted_delay_hours: number;
  reason: string;
  weather: {
    origin: {
      weather: string;
      temp: number;
      rain: number;
    };
    destination: {
      weather: string;
      temp: number;
      rain: number;
    };
  };
  traffic: {
    distance: number;
    traffic_delay: number;
  };
}

interface PredictionError {
  error: string;
  predicted_delay_hours?: number;
  reason?: string;
}

interface AIDelayPredictionProps {
  orderId: string;
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  shipmentType?: 'standard' | 'perishable' | 'hazardous';
  prediction: PredictionData | PredictionError;
}

const AIDelayPrediction: React.FC<AIDelayPredictionProps> = ({
  orderId,
  prediction
}) => {
  if (!prediction) {
    return (
      <div className="p-4 bg-blue-50 rounded-md flex items-center">
        <Clock className="mr-2 text-blue-500" size={16} />
        <span>Analyzing shipment #{orderId}...</span>
      </div>
    );
  }

  if ('error' in prediction) {
    return (
      <div className="p-4 bg-red-50 rounded-md flex items-center">
        <AlertCircle className="mr-2 text-red-500" size={16} />
        <span>Prediction error for shipment #{orderId}</span>
      </div>
    );
  }

  const isDelayed = prediction.predicted_delay_hours > 2;
  const delayHours = prediction.predicted_delay_hours.toFixed(1);

  return (
    <div className={`border rounded-lg overflow-hidden ${isDelayed ? 'border-orange-200' : 'border-green-200'}`}>
      <div className={`p-4 ${isDelayed ? 'bg-orange-50' : 'bg-green-50'}`}>
        <div className="flex items-start">
          <div className={`p-2 rounded-full mr-3 ${isDelayed ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
            {isDelayed ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          </div>
          <div>
            <h3 className="font-medium">
              Shipment #{orderId} - {isDelayed ? (
                <>Potential delay: ~{delayHours} hours</>
              ) : (
                <>On schedule</>
              )}
            </h3>
            <p className="text-sm mt-1">{prediction.reason}</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t grid grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-medium text-gray-500 mb-1">Weather Conditions</h4>
          <div className="flex items-center">
            <CloudRain size={14} className="mr-2 text-blue-500" />
            <span>Origin: {prediction.weather.origin.weather}, {prediction.weather.origin.temp}°C</span>
          </div>
          <div className="flex items-center mt-1">
            <CloudRain size={14} className="mr-2 text-blue-500" />
            <span>Dest: {prediction.weather.destination.weather}, {prediction.weather.destination.temp}°C</span>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-500 mb-1">Route Analysis</h4>
          <div className="flex items-center">
            <TrafficCone size={14} className="mr-2 text-orange-500" />
            <span>Distance: {prediction.traffic.distance.toFixed(1)} km</span>
          </div>
          <div className="flex items-center mt-1">
            <TrafficCone size={14} className="mr-2 text-orange-500" />
            <span>Traffic delay: {prediction.traffic.traffic_delay.toFixed(0)} min</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDelayPrediction;