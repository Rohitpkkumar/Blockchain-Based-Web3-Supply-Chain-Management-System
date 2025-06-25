import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Check, X, Calendar, DollarSign, Truck, Clock, AlertCircle, Ship, Plane, Train } from 'lucide-react';
import { Order } from '../types';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import { createOrder, getAllOrders, getPendingOrders, respondToOrderRequest } from '../contracts';

const Orders: React.FC = () => {
  const { state: walletState } = useWallet();
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [isRespondingToRequest, setIsRespondingToRequest] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'In Transit' | 'Delivered'>('All');
  const [orders, setOrders] = useState<Order[]>([]);

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

  // New order form state
  const [newOrder, setNewOrder] = useState({
    supplierId: '',
    productId: '',
    transportType: '' // Default transport type
  });

  // Order request response form state
  const [orderResponse, setOrderResponse] = useState({
    price: '',
    deliveryDate: ''
  });

  // Filter orders based on search query and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplierId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Pending' && order.shipmentStatus === 'Pending') ||
      (statusFilter === 'In Transit' && (order.shipmentStatus === 'In Transit' || order.shipmentStatus === 'Picked Up' || order.shipmentStatus === 'Delayed')) ||
      (statusFilter === 'Delivered' && order.shipmentStatus === 'Delivered');
    
    return matchesSearch && matchesStatus;
  });

  // Group orders by request status
  const pendingRequests = orders.filter(order => order.requestStatus === 'Pending');

  // Handle form input changes for new order
  const handleNewOrderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewOrder((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form input changes for order response
  const handleResponseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrderResponse((prev) => ({ ...prev, [name]: value }));
  };

  // Handle new order submission
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletState.isConnected || !window.ethereum) {
      alert('Please connect your wallet to create an order');
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Trigger MetaMask transaction
      const txHash = await createOrder(
        provider,
        newOrder.supplierId,
        newOrder.productId,
        newOrder.transportType
      );
      
      // Only update local state after successful blockchain transaction
      const newOrderEntry: Order = {
        id: (1000 + orders.length + 1).toString(),
        supplierId: newOrder.supplierId,
        productId: newOrder.productId,
        transportType: newOrder.transportType,
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: null,
        price: null,
        isPaid: false,
        shipmentStatus: 'Pending',
        requestStatus: 'Pending',
        carrierId: null,
      };
      
      setOrders((prev) => [...prev, newOrderEntry]);
      setIsAddingOrder(false);
      setNewOrder({
        supplierId: '',
        productId: '',
        transportType: 'truck'
      });
      
      alert(`Order request created successfully! Transaction hash: ${txHash}`);
    } catch (error) {
      console.error('Error creating order:', error);
      alert(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle order request response (accept or decline)
  const handleOrderResponse = async (orderId: string, isAccepted: boolean) => {
    if (!walletState.isConnected || !window.ethereum) {
      alert('Please connect your wallet to respond to this request');
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      if (isAccepted) {
        // For accepted orders, we need price and delivery date
        if (!orderResponse.price || !orderResponse.deliveryDate) {
          alert('Please provide price and delivery date');
          return;
        }
        
        const txHash = await respondToOrderRequest(
          provider,
          orderId,
          true,
          orderResponse.price,
          orderResponse.deliveryDate
        );
        
        setOrders(prev => prev.map(order => 
          order.id === orderId ? {
            ...order,
            price: parseFloat(orderResponse.price),
            deliveryDate: orderResponse.deliveryDate,
            requestStatus: 'Approved'
          } : order
        ));
        
        alert(`Order accepted successfully! Transaction hash: ${txHash}`);
      } else {
        // For declined orders
        const txHash = await respondToOrderRequest(provider, orderId, false);
        
        setOrders(prev => prev.map(order => 
          order.id === orderId ? {
            ...order,
            requestStatus: 'Declined'
          } : order
        ));
        
        alert(`Order declined successfully! Transaction hash: ${txHash}`);
      }
      
      setIsRespondingToRequest(null);
      setOrderResponse({ price: '', deliveryDate: '' });
    } catch (error) {
      console.error('Error responding to order request:', error);
      alert(`Failed to process response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Get status badge for order
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

  // Get transport icon
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
    <div className="container mx-auto p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">Manage your supply chain orders</p>
      </div>

      {/* Order requests section */}
      {pendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Order Requests</h2>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="card animate-fade-in">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">Order #{request.id}</span>
                      <span className="badge badge-warning">Pending Approval</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <p>Supplier ID: {request.supplierId}</p>
                      <p>Product ID: {request.productId}</p>
                      <p>Requested on: {request.orderDate}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="btn btn-outline"
                      onClick={() => setIsRespondingToRequest(request.id)}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Accept
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => handleOrderResponse(request.id, false)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="form-input pl-10"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="form-select pl-10"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Pending' | 'In Transit' | 'Delivered')}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setIsAddingOrder(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </button>
        </div>
      </div>

      {/* Orders table */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <div className="mb-3 rounded-full bg-gray-100 p-3">
            <Truck className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mb-1 text-base font-medium text-gray-900">No orders found</h3>
          <p className="text-sm text-gray-500">
            {searchQuery || statusFilter !== 'All'
              ? 'Try changing your search or filter criteria'
              : 'Start by creating your first order'}
          </p>
          <button
            className="mt-4 btn btn-primary"
            onClick={() => setIsAddingOrder(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Supplier ID</th>
                <th>Product ID</th>
                <th>Transport</th>
                <th>Order Date</th>
                <th>Delivery Date</th>
                <th>Price</th>
                <th>Paid</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="animate-fade-in">
                  <td className="font-medium text-gray-900">#{order.id}</td>
                  <td>{order.supplierId}</td>
                  <td>{order.productId}</td>
                  <td>
                    <div className="flex items-center">
                      {getTransportIcon(order.transportType)}
                      <span className="ml-1 capitalize">{order.transportType}</span>
                    </div>
                  </td>
                  <td>{order.orderDate}</td>
                  <td>{order.deliveryDate || '-'}</td>
                  <td>
                    {order.price !== null ? (
                      <div className="flex items-center">
                        <DollarSign className="mr-1 h-4 w-4 text-gray-400" />
                        {order.price.toFixed(2)}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    {order.isPaid ? (
                      <span className="badge badge-success">Paid</span>
                    ) : (
                      <span className="badge badge-error">Unpaid</span>
                    )}
                  </td>
                  <td>{getStatusBadge(order.shipmentStatus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Order Modal */}
      {isAddingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Create New Order</h2>
            <form onSubmit={handleCreateOrder}>
              <div className="mb-4">
                <label htmlFor="supplierId" className="form-label">
                  Supplier ID
                </label>
                <input
                  type="text"
                  id="supplierId"
                  name="supplierId"
                  className="form-input"
                  value={newOrder.supplierId}
                  onChange={handleNewOrderChange}
                  required
                  placeholder="e.g., SUPP-001"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="productId" className="form-label">
                  Product ID
                </label>
                <input
                  type="text"
                  id="productId"
                  name="productId"
                  className="form-input"
                  value={newOrder.productId}
                  onChange={handleNewOrderChange}
                  required
                  placeholder="e.g., PROD-A101"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="transportType" className="form-label">
                  Transport Type
                </label>
                <select
                  id="transportType"
                  name="transportType"
                  className="form-select"
                  value={newOrder.transportType}
                  onChange={handleNewOrderChange}
                  required
                >
                  <option value="truck">Truck</option>
                  <option value="ship">Ship</option>
                  <option value="plane">Air Freight</option>
                  <option value="train">Train</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsAddingOrder(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!walletState.isConnected}
                >
                  {walletState.isConnected ? 'Create Order Request' : 'Connect Wallet to Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Response Modal */}
      {isRespondingToRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Accept Order Request</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleOrderResponse(isRespondingToRequest, true);
            }}>
              <div className="mb-4">
                <label htmlFor="price" className="form-label">
                  Price (in ETH)
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    id="price"
                    name="price"
                    className="form-input pl-10"
                    value={orderResponse.price}
                    onChange={handleResponseChange}
                    required
                    placeholder="Enter price in ETH"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="deliveryDate" className="form-label">
                  Estimated Delivery Date
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="deliveryDate"
                    name="deliveryDate"
                    className="form-input pl-10"
                    value={orderResponse.deliveryDate}
                    onChange={handleResponseChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div className="rounded-lg bg-yellow-50 p-4 mb-6">
                <div className="flex">
                  <div className="mr-3 flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Notice</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Accepting this order will create a blockchain transaction.
                        You'll need to confirm it in your MetaMask wallet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsRespondingToRequest(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!walletState.isConnected}
                >
                  {walletState.isConnected ? 'Accept Order' : 'Connect Wallet to Accept'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;