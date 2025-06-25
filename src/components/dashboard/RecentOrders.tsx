import React from 'react';
import { Eye, ArrowUpRight } from 'lucide-react';
import { Order } from '../../types';

interface RecentOrdersProps {
  orders: Order[];
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ orders }) => {
  // Sort orders by date (newest first) and take the 5 most recent
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: Order['shipmentStatus']) => {
    switch (status) {
      case 'Pending':
        return <span className="badge badge-warning">Pending</span>;
      case 'Picked Up':
        return <span className="badge badge-primary">Picked Up</span>;
      case 'In Transit':
        return <span className="badge badge-secondary">In Transit</span>;
      case 'Delayed':
        return <span className="badge badge-error">Delayed</span>;
      case 'Delivered':
        return <span className="badge badge-success">Delivered</span>;
      default:
        return <span className="badge badge-warning">Pending</span>;
    }
  };

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
        <a href="#" className="flex items-center text-xs font-medium text-primary-600 hover:text-primary-700">
          <span>View all</span>
          <ArrowUpRight className="ml-1 h-3 w-3" />
        </a>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Supplier</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              recentOrders.map((order) => (
                <tr key={order.id} className="animate-fade-in">
                  <td className="font-medium text-gray-900">#{order.id}</td>
                  <td>{order.supplierId}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>{getStatusBadge(order.shipmentStatus)}</td>
                  <td>
                    <button className="flex items-center rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;