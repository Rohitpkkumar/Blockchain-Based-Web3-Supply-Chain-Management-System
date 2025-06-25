import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Menu, X, ChevronDown, Wallet, User, MapPin } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { updateUserLocation } from '../../contracts';
import { AppState } from '../../types';
import logo from '../../assets/logo.png';

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  onLocationUpdate: (lat: number, lng: number) => void;
  onNavigate: (page: AppState['currentPage']) => void;
  currentPage: AppState['currentPage'];
}

const Navbar: React.FC<NavbarProps> = ({ 
  toggleSidebar, 
  isSidebarOpen, 
  onLocationUpdate, 
  onNavigate,
  currentPage 
}) => {
  const { state, connectWallet, disconnectWallet } = useWallet();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [location, setLocation] = useState({
    lat: '',
    lng: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocation(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.isConnected || !window.ethereum) {
      alert('Please connect your wallet to update location');
      return;
    }

    try {
      setIsUpdating(true);
      const lat = parseFloat(location.lat);
      const lng = parseFloat(location.lng);
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Please enter valid coordinates');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const txHash = await updateUserLocation(provider, lat, lng);
      
      onLocationUpdate(lat, lng);
      
      alert(`Location updated successfully! Transaction hash: ${txHash}`);
      setIsLocationModalOpen(false);
      setLocation({ lat: '', lng: '' });
    } catch (error) {
      console.error('Error updating location:', error);
      alert(`Failed to update location: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Navigation items data
  const navItems = [
    { id: 'Dashboard', label: 'Dashboard' },
    { id: 'Partners', label: 'Partners' },
    { id: 'Orders', label: 'Orders' },
    { id: 'Controls', label: 'Controls' },
    { id: 'AIFeatures', label: 'AI Features' },
    { id: 'BlockchainFeatures', label: 'Blockchain Features' },
    { id: 'Settings', label: 'Settings' }
  ];

  return (
    <nav className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:px-6">
      {/* Left section */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-4 rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <button 
          onClick={toggleSidebar}
          className="flex items-center hover:text-primary-600 transition-colors"
        >
          
        <img src={logo} alt="ChainFlow" style={{ height: '135px', width: 'auto' }} />

        </button>
      </div>

      {/* Center section - Navigation Links */}
      <div className="hidden space-x-4 md:flex">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as AppState['currentPage'])}
            className={`px-3 py-2 text-sm font-medium ${
              currentPage === item.id 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-700 hover:text-primary-600'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        {/* Wallet connect button */}
        {!state.isConnected ? (
          <button
            onClick={connectWallet}
            className="btn btn-primary flex items-center space-x-2"
            disabled={state.isConnecting}
          >
            <Wallet size={16} />
            <span>{state.isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5">
            <Wallet size={16} className="text-primary-600" />
            <span className="text-sm font-medium">{formatAddress(state.address)}</span>
          </div>
        )}

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 rounded-full bg-gray-100 p-1 text-gray-700 hover:bg-gray-200"
          >
            <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-300">
              <div className="flex h-full w-full items-center justify-center bg-primary-100 text-primary-700">
                <User size={16} />
              </div>
            </div>
            <ChevronDown size={16} className="hidden md:block" />
          </button>

          {/* Dropdown menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="block border-b border-gray-100 px-4 py-2 text-sm text-gray-700">
                <p className="font-medium">My Profile</p>
                {state.address && (
                  <p className="mt-1 truncate text-xs text-gray-500">{state.address}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsLocationModalOpen(true);
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <MapPin size={14} className="mr-2" />
                Add Location
              </button>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  onNavigate('Settings');
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Settings
              </button>
              {state.isConnected && (
                <button
                  onClick={disconnectWallet}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                >
                  Disconnect Wallet
                </button>
              )}
            </div>
          )}
        </div>

        {/* Location Update Modal */}
        {isLocationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl z-[60]">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Update Your Location</h2>
              
              <form onSubmit={handleLocationSubmit}>
                <div className="mb-4">
                  <label htmlFor="lat" className="form-label">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    id="lat"
                    name="lat"
                    className="form-input"
                    value={location.lat}
                    onChange={handleLocationChange}
                    required
                    placeholder="e.g., 37.7749"
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="lng" className="form-label">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    id="lng"
                    name="lng"
                    className="form-input"
                    value={location.lng}
                    onChange={handleLocationChange}
                    required
                    placeholder="e.g., -122.4194"
                  />
                </div>
                
                <div className="rounded-lg bg-blue-50 p-4 mb-6">
                  <div className="flex">
                    <div className="mr-3 flex-shrink-0">
                      <MapPin className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Notice</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          Updating your location will create a blockchain transaction.
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
                    onClick={() => setIsLocationModalOpen(false)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!state.isConnected || isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Update Location'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;