import React, { useState, useEffect } from 'react';
import { Search, Plus, User, MapPin, Wallet, Filter } from 'lucide-react';
import { Partner } from '../types';
import { useWallet } from '../context/WalletContext';
import {ethers} from 'ethers';
import { addPartner, getAllPartners } from '../contracts.ts';

const Partners: React.FC = () => {
  const { state: walletState } = useWallet();
  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Importer' | 'Exporter'>('All');

  useEffect(() => {
  const loadPartners = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const blockchainPartners = await getAllPartners(provider);
        setPartners(blockchainPartners);
      } catch (error) {
        console.error("Failed to load partners from blockchain:", error);
      }
    }
  };
  
  loadPartners();
}, []);

  // Mock data
  const [partners, setPartners] = useState<Partner[]>([
    {
      id: 'SUPP-001',
      name: 'Global Imports Inc.',
      type: 'Importer',
      position: { lat: 37.7749, lng: -122.4194 },
      walletAddress: '0x1234...5678',
      createdAt: '2025-01-15',
    },
    {
      id: 'SUPP-002',
      name: 'East-West Exports',
      type: 'Exporter',
      position: { lat: 34.0522, lng: -118.2437 },
      walletAddress: '0x8765...4321',
      createdAt: '2025-02-20',
    },
    {
      id: 'SUPP-003',
      name: 'Oceanic Trading Co.',
      type: 'Importer',
      position: { lat: 40.7128, lng: -74.006 },
      walletAddress: '0xabcd...efgh',
      createdAt: '2025-03-05',
    },
  ]);

  // New partner form state
  const [newPartner, setNewPartner] = useState<{
    id: string;
    name: string;
    type: 'Importer' | 'Exporter';
    lat: string;
    lng: string;
    walletAddress: string;
  }>({
    id: '',
    name: '',
    type: 'Importer',
    lat: '',
    lng: '',
    walletAddress: '',
  });

  // Filter partners based on search query and type filter
  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.walletAddress.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'All' || partner.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewPartner((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!walletState.isConnected || !window.ethereum) {
    alert('Please connect your wallet to add a partner');
    return;
  }
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Trigger MetaMask transaction
    const txHash = await addPartner(provider, {
      id: newPartner.id,
      name: newPartner.name,
      type: newPartner.type,
      lat: parseFloat(newPartner.lat),
      lng: parseFloat(newPartner.lng),
      walletAddress: newPartner.walletAddress
    });
    
    // Only update local state after successful blockchain transaction
    const newPartnerEntry: Partner = {
      id: newPartner.id,
      name: newPartner.name,
      type: newPartner.type,
      position: {
        lat: parseFloat(newPartner.lat),
        lng: parseFloat(newPartner.lng),
      },
      walletAddress: newPartner.walletAddress,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    setPartners((prev) => [...prev, newPartnerEntry]);
    setIsAddingPartner(false);
    setNewPartner({
      id: '',
      name: '',
      type: 'Importer',
      lat: '',
      lng: '',
      walletAddress: '',
    });
    
    alert(`Partner added successfully! Transaction hash: ${txHash}`);
  } catch (error) {
    console.error('Error adding partner:', error);
    alert(`Failed to add partner: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

  return (
    <div className="container mx-auto p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
        <p className="text-gray-600">Manage your supply chain partners</p>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="form-input pl-10"
            placeholder="Search partners..."
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'All' | 'Importer' | 'Exporter')}
            >
              <option value="All">All Types</option>
              <option value="Importer">Importers</option>
              <option value="Exporter">Exporters</option>
            </select>
          </div>
          
          <button
            className="btn btn-primary"
            onClick={() => setIsAddingPartner(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Partner
          </button>
        </div>
      </div>

      {/* Partner list */}
      {filteredPartners.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
          <div className="mb-3 rounded-full bg-gray-100 p-3">
            <User className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mb-1 text-base font-medium text-gray-900">No partners found</h3>
          <p className="text-sm text-gray-500">
            {searchQuery || filterType !== 'All'
              ? 'Try changing your search or filter criteria'
              : 'Start by adding your first supply chain partner'}
          </p>
          <button
            className="mt-4 btn btn-primary"
            onClick={() => setIsAddingPartner(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Partner
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Wallet Address</th>
                <th>Added On</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map((partner) => (
                <tr key={partner.id} className="animate-fade-in">
                  <td className="font-medium text-gray-900">{partner.id}</td>
                  <td>{partner.name}</td>
                  <td>
                    <span
                      className={`badge ${
                        partner.type === 'Importer' ? 'badge-primary' : 'badge-secondary'
                      }`}
                    >
                      {partner.type}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>
                        {partner.position.lat.toFixed(4)}, {partner.position.lng.toFixed(4)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-1">
                      <Wallet className="h-4 w-4 text-gray-400" />
                      <span>{partner.walletAddress}</span>
                    </div>
                  </td>
                  <td>{partner.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Partner Modal */}
      {isAddingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Add New Partner</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="id" className="form-label">
                  Supplier ID
                </label>
                <input
                  type="text"
                  id="id"
                  name="id"
                  className="form-input"
                  value={newPartner.id}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., SUPP-004"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={newPartner.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Partner name"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="type" className="form-label">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  className="form-select"
                  value={newPartner.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Importer">Importer</option>
                  <option value="Exporter">Exporter</option>
                </select>
              </div>
              
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lat" className="form-label">
                    Latitude
                  </label>
                  <input
                    type="text"
                    id="lat"
                    name="lat"
                    className="form-input"
                    value={newPartner.lat}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 37.7749"
                  />
                </div>
                <div>
                  <label htmlFor="lng" className="form-label">
                    Longitude
                  </label>
                  <input
                    type="text"
                    id="lng"
                    name="lng"
                    className="form-input"
                    value={newPartner.lng}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., -122.4194"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="walletAddress" className="form-label">
                  Wallet Address
                </label>
                <input
                  type="text"
                  id="walletAddress"
                  name="walletAddress"
                  className="form-input"
                  value={newPartner.walletAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 0x1234...5678"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsAddingPartner(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!walletState.isConnected}
                >
                  {walletState.isConnected ? 'Add Partner' : 'Connect Wallet to Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;