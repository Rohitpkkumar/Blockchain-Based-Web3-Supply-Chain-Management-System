import React, { useState, useEffect } from 'react';
import { Truck, CheckSquare, FileText, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { useWallet } from '../context/WalletContext';
import {ethers} from 'ethers';
import { startShipment, completeShipment, getAllOrders } from '../contracts.ts';


const Controls: React.FC = () => {
  const { state: walletState } = useWallet();
  const [isStartingShipment, setIsStartingShipment] = useState(false);
  const [isCompletingShipment, setIsCompletingShipment] = useState(false);

  useEffect(() => {
  const loadOrders = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const blockchainOrders = await getAllOrders(provider);
        setOrders(blockchainOrders);
      } catch (error) {
        console.error("Failed to load orders from blockchain:", error);
      }
    }
  };
  
  loadOrders();
}, []);

  // Mock data
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1001',
      supplierId: 'SUPP-001',
      productId: 'PROD-A101',
      orderDate: '2025-03-15',
      deliveryDate: '2025-03-20',
      transportType: 'Truck',
      price: 1250.0,
      isPaid: true,
      shipmentStatus: 'Delivered',
      requestStatus: 'Approved',
      carrierId: 'CAR-001',
    },
    {
      id: '1002',
      supplierId: 'SUPP-002',
      productId: 'PROD-B202',
      orderDate: '2025-03-18',
      deliveryDate: '2025-03-25',
      price: 850.0,
      transportType: 'Ship',
      isPaid: true,
      shipmentStatus: 'In Transit',
      requestStatus: 'Approved',
      carrierId: 'CAR-002',
    },
    {
      id: '1003',
      supplierId: 'SUPP-003',
      productId: 'PROD-C303',
      orderDate: '2025-03-19',
      deliveryDate: '2025-03-28',
      price: 2100.0,
      transportType: 'Train',
      isPaid: false,
      shipmentStatus: 'Pending',
      requestStatus: 'Approved',
      carrierId: null,
    },
  ]);

  // Form states
  const [startShipmentForm, setStartShipmentForm] = useState({
    orderId: '',
    carrierId: '',
  });

  const [completeShipmentForm, setCompleteShipmentForm] = useState({
    orderId: '',
  });

  // Get eligible orders for starting shipment (approved orders with Pending status)
  const eligibleForStart = orders.filter(
    (order) => order.requestStatus === 'Approved' && order.shipmentStatus === 'Pending'
  );

  // Get eligible orders for completing shipment (In Transit orders)
  const eligibleForComplete = orders.filter(
    (order) => order.shipmentStatus === 'In Transit' || order.shipmentStatus === 'Delayed' || order.shipmentStatus === 'Picked Up'
  );

  // Handle form input changes for starting shipment
  const handleStartFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStartShipmentForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form input changes for completing shipment
  const handleCompleteFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompleteShipmentForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle starting shipment
  const handleStartShipment = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!walletState.isConnected || !window.ethereum) {
    alert('Please connect your wallet to start a shipment');
    return;
  }
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const txHash = await startShipment(
      provider,
      startShipmentForm.orderId,
      startShipmentForm.carrierId
    );
    
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === startShipmentForm.orderId) {
          return {
            ...order,
            shipmentStatus: 'In Transit',
            carrierId: startShipmentForm.carrierId,
          };
        }
        return order;
      })
    );
    
    setIsStartingShipment(false);
    setStartShipmentForm({
      orderId: '',
      carrierId: '',
    });
    
    alert(`Shipment started successfully! Transaction hash: ${txHash}`);
  } catch (error) {
    console.error('Error starting shipment:', error);
    alert(`Failed to start shipment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const handleCompleteShipment = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!walletState.isConnected || !window.ethereum) {
    alert('Please connect your wallet to complete a shipment');
    return;
  }
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const txHash = await completeShipment(provider, completeShipmentForm.orderId);
    
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === completeShipmentForm.orderId) {
          return {
            ...order,
            shipmentStatus: 'Delivered',
            isPaid: true,
          };
        }
        return order;
      })
    );
    
    setIsCompletingShipment(false);
    setCompleteShipmentForm({
      orderId: '',
    });
    
    alert(`Shipment completed successfully! Transaction hash: ${txHash}`);
  } catch (error) {
    console.error('Error completing shipment:', error);
    alert(`Failed to complete shipment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

  return (
    <div className="container mx-auto p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shipment Controls</h1>
        <p className="text-gray-600">Manage your shipments lifecycle</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Start Shipment Card */}
        <div className="card">
          <div className="mb-4 flex items-center space-x-3">
            <div className="rounded-full bg-primary-100 p-2 text-primary-600">
              <Truck className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Start Shipment</h2>
          </div>
          
          <p className="mb-4 text-sm text-gray-600">
            Initialize a shipment for an approved order by assigning a carrier. This will update the
            blockchain and add the shipment to the live tracking map.
          </p>
          
          {eligibleForStart.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-500">No eligible orders to start shipment</p>
            </div>
          ) : (
            <button
              className="btn btn-primary w-full"
              onClick={() => setIsStartingShipment(true)}
            >
              Start New Shipment
            </button>
          )}
        </div>

        {/* Complete Shipment Card */}
        <div className="card">
          <div className="mb-4 flex items-center space-x-3">
            <div className="rounded-full bg-success-100 p-2 text-success-600">
              <CheckSquare className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Complete Shipment</h2>
          </div>
          
          <p className="mb-4 text-sm text-gray-600">
            Mark a shipment as delivered and trigger payment to the carrier. This will update the
            blockchain, remove the shipment from the map, and process payment.
          </p>
          
          {eligibleForComplete.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-500">No active shipments to complete</p>
            </div>
          ) : (
            <button
              className="btn btn-success w-full bg-success-600 text-white hover:bg-success-700"
              onClick={() => setIsCompletingShipment(true)}
            >
              Complete Shipment
            </button>
          )}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
        
        <div className="card">
          <div className="divide-y divide-gray-200">
            <div className="flex items-start space-x-3 pb-4">
              <div className="rounded-full bg-primary-100 p-2 text-primary-600">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Shipment Started</p>
                <p className="text-sm text-gray-600">Order #1002 has been assigned to carrier CAR-002</p>
                <p className="mt-1 text-xs text-gray-500">2 days ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 py-4">
              <div className="rounded-full bg-success-100 p-2 text-success-600">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Shipment Completed</p>
                <p className="text-sm text-gray-600">Order #1001 has been delivered and payment processed</p>
                <p className="mt-1 text-xs text-gray-500">5 days ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 py-4">
              <div className="rounded-full bg-warning-100 p-2 text-warning-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Order Approved</p>
                <p className="text-sm text-gray-600">Order #1003 has been approved and is ready for shipment</p>
                <p className="mt-1 text-xs text-gray-500">1 week ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 pt-4">
              <div className="rounded-full bg-error-100 p-2 text-error-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Shipment Delayed</p>
                <p className="text-sm text-gray-600">Order #1005 has been marked as delayed due to weather conditions</p>
                <p className="mt-1 text-xs text-gray-500">1 week ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Shipment Modal */}
      {isStartingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Start Shipment</h2>
            
            <form onSubmit={handleStartShipment}>
              <div className="mb-4">
                <label htmlFor="orderId" className="form-label">
                  Order ID
                </label>
                <select
                  id="orderId"
                  name="orderId"
                  className="form-select"
                  value={startShipmentForm.orderId}
                  onChange={handleStartFormChange}
                  required
                >
                  <option value="">Select an order...</option>
                  {eligibleForStart.map((order) => (
                    <option key={order.id} value={order.id}>
                      #{order.id} - {order.productId} ({order.supplierId})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="carrierId" className="form-label">
                  Carrier ID
                </label>
                <input
                  type="text"
                  id="carrierId"
                  name="carrierId"
                  className="form-input"
                  value={startShipmentForm.carrierId}
                  onChange={handleStartFormChange}
                  required
                  placeholder="e.g., CAR-001"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsStartingShipment(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!walletState.isConnected}
                >
                  {walletState.isConnected ? 'Start Shipment' : 'Connect Wallet to Start'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Shipment Modal */}
      {isCompletingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Complete Shipment</h2>
            
            <form onSubmit={handleCompleteShipment}>
              <div className="mb-4">
                <label htmlFor="orderId" className="form-label">
                  Order ID
                </label>
                <select
                  id="orderId"
                  name="orderId"
                  className="form-select"
                  value={completeShipmentForm.orderId}
                  onChange={handleCompleteFormChange}
                  required
                >
                  <option value="">Select an order...</option>
                  {eligibleForComplete.map((order) => (
                    <option key={order.id} value={order.id}>
                      #{order.id} - {order.productId} (Carrier: {order.carrierId})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-6 rounded-lg bg-yellow-50 p-4">
                <div className="flex">
                  <div className="mr-3 flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Payment Notice</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Completing this shipment will trigger a payment transaction through your
                        connected wallet. Please ensure you have sufficient funds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsCompletingShipment(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn bg-success-600 text-white hover:bg-success-700"
                  disabled={!walletState.isConnected}
                >
                  {walletState.isConnected ? 'Complete & Pay' : 'Connect Wallet to Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Controls;