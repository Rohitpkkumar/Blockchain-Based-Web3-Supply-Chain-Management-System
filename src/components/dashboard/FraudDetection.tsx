import React, { useState } from 'react';
import { AlertCircle, Shield, CheckCircle, Info } from 'lucide-react';
import { FraudAlert } from '../../types';

interface FraudDetectionProps {
  alerts: FraudAlert[];
}

const FraudDetection: React.FC<FraudDetectionProps> = ({ alerts }) => {
  const [expandedAlerts, setExpandedAlerts] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedAlerts((prev) =>
      prev.includes(id) ? prev.filter((alertId) => alertId !== id) : [...prev, id]
    );
  };

  const getSeverityIcon = (severity: FraudAlert['severity']) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-error-600" />;
      case 'medium':
        return <Info className="h-5 w-5 text-warning-600" />;
      case 'low':
        return <Info className="h-5 w-5 text-gray-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityClass = (severity: FraudAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-error-50 border-error-200';
      case 'medium':
        return 'bg-warning-50 border-warning-200';
      case 'low':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-800">Fraud Detection</h2>
          <span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800">
            AI-Powered
          </span>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 rounded-full bg-success-100 p-3 text-success-600">
            <Shield className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-900">No suspicious activity detected</p>
            <p className="text-sm text-gray-600">All transactions and locations appear normal</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border p-3 ${getSeverityClass(alert.severity)}`}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-0.5">{getSeverityIcon(alert.severity)}</div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium text-gray-900">
                      {alert.type === 'duplicate_address'
                        ? 'Duplicate Address Detected'
                        : alert.type === 'suspicious_pattern'
                        ? 'Suspicious Pattern Detected'
                        : 'Location Mismatch'}
                    </div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium shadow-sm">
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Severity
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{alert.description}</p>
                  
                  <div className="mt-2 flex justify-between">
                    <button
                      onClick={() => toggleExpand(alert.id)}
                      className="text-xs font-medium text-primary-600 hover:text-primary-700"
                    >
                      {expandedAlerts.includes(alert.id) ? 'Hide details' : 'Show details'}
                    </button>
                  </div>
                  
                  {expandedAlerts.includes(alert.id) && (
                    <div className="mt-3 rounded-md bg-white p-3 text-sm shadow-sm">
                      <p className="mb-1 font-medium text-gray-900">Related IDs:</p>
                      <div className="flex flex-wrap gap-1">
                        {alert.relatedIds.map((id) => (
                          <span
                            key={id}
                            className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700"
                          >
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FraudDetection;