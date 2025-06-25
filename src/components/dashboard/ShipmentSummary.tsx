import React from 'react';
import { Package, Truck, Clock, AlertTriangle } from 'lucide-react';
import { Order } from '../../types';

interface ShipmentSummaryProps {
  orders: Order[];
}

const ShipmentSummary: React.FC<ShipmentSummaryProps> = ({ orders }) => {
  // Calculate summary counts
  const completed = orders.filter(order => order.shipmentStatus === 'Delivered').length;
  const active = orders.filter(order => 
    ['Picked Up', 'In Transit', 'Delayed'].includes(order.shipmentStatus)
  ).length;
  const pending = orders.filter(order => 
    order.shipmentStatus === 'Pending' && order.requestStatus === 'Approved'
  ).length;
  const requests = orders.filter(order => order.requestStatus === 'Pending').length;

  const summaryItems = [
    {
      title: 'Completed Shipments',
      value: completed,
      icon: <Package className="h-6 w-6 text-success-500" />,
      color: 'bg-success-50 text-success-700',
    },
    {
      title: 'Active Shipments',
      value: active,
      icon: <Truck className="h-6 w-6 text-primary-500" />,
      color: 'bg-primary-50 text-primary-700',
    },
    {
      title: 'Pending Orders',
      value: pending,
      icon: <Clock className="h-6 w-6 text-warning-500" />,
      color: 'bg-warning-50 text-warning-700',
    },
    {
      title: 'Order Requests',
      value: requests,
      icon: <AlertTriangle className="h-6 w-6 text-accent-500" />,
      color: 'bg-accent-50 text-accent-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {summaryItems.map((item, index) => (
        <div key={index} className="card animate-fade-in">
          <div className="flex items-center">
            <div className={`rounded-full p-3 ${item.color.split(' ')[0]}`}>
              {item.icon}
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">{item.title}</h3>
              <p className={`text-2xl font-semibold ${item.color.split(' ')[1]}`}>{item.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShipmentSummary;