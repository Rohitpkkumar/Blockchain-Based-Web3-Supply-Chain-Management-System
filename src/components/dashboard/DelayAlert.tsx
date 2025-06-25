// components/dashboard/DelayAlert.tsx
import React from 'react';
import { AlertCircle, Clock, CloudRain, CloudSnow, TrafficCone, CheckCircle } from 'lucide-react';
import { DelayPrediction } from '../../types';

interface DelayAlertProps {
  predictions: DelayPrediction[];
  onNewPrediction?: (prediction: DelayPrediction) => void; // Add this
}

const DelayAlert: React.FC<DelayAlertProps> = ({ predictions }) => {
  const getSeverity = (probability: number) => {
    if (probability > 0.7) return 'high';
    if (probability > 0.4) return 'medium';
    return 'low';
  };

  const getIcon = (reason: string) => {
    if (reason.toLowerCase().includes('rain')) return <CloudRain className="h-5 w-5" />;
    if (reason.toLowerCase().includes('snow')) return <CloudSnow className="h-5 w-5" />;
    if (reason.toLowerCase().includes('traffic')) return <TrafficCone className="h-5 w-5" />;
    return <AlertCircle className="h-5 w-5" />;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Delay Predictions</h3>
      </div>
      
      {predictions.length === 0 ? (
        <div className="mt-4 rounded-md bg-green-50 p-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-full bg-green-100 p-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">No delays predicted</h4>
              <p className="text-sm text-gray-600">All active shipments are on schedule</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {predictions.map((prediction) => (
            <div
              key={prediction.orderId}
              className={`rounded-md p-3 ${
                getSeverity(prediction.probability) === 'high'
                  ? 'bg-red-50'
                  : getSeverity(prediction.probability) === 'medium'
                  ? 'bg-yellow-50'
                  : 'bg-blue-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`rounded-full p-2 ${
                    getSeverity(prediction.probability) === 'high'
                      ? 'bg-red-100 text-red-600'
                      : getSeverity(prediction.probability) === 'medium'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {getIcon(prediction.reason)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      Order #{prediction.orderId}
                    </h4>
                    <span
                      className={`text-xs font-semibold ${
                        getSeverity(prediction.probability) === 'high'
                          ? 'text-red-600'
                          : getSeverity(prediction.probability) === 'medium'
                          ? 'text-yellow-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {Math.round(prediction.probability * 100)}% probability
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {prediction.reason}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Clock className="mr-1 h-4 w-4" />
                    Estimated delay: ~{prediction.estimatedDelay} hours
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DelayAlert;