import React from 'react';
import {
  LayoutDashboard,
  Users,
  PackageCheck,
  ToggleLeft,
  BrainCircuit,
  Blocks,
  Settings,
  User,
  Wallet,
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { AppState } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  currentPage: AppState['currentPage'];
  onNavigate: (page: AppState['currentPage']) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentPage, onNavigate }) => {
  const { state } = useWallet();

  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-700">ChainFlow</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <button
          onClick={() => onNavigate('Dashboard')}
          className={`sidebar-link w-full ${currentPage === 'Dashboard' ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate('Partners')}
          className={`sidebar-link w-full ${currentPage === 'Partners' ? 'active' : ''}`}
        >
          <Users size={18} />
          <span>Partners</span>
        </button>

        <button
          onClick={() => onNavigate('Orders')}
          className={`sidebar-link w-full ${currentPage === 'Orders' ? 'active' : ''}`}
        >
          <PackageCheck size={18} />
          <span>Orders</span>
        </button>

        <button
          onClick={() => onNavigate('Controls')}
          className={`sidebar-link w-full ${currentPage === 'Controls' ? 'active' : ''}`}
        >
          <ToggleLeft size={18} />
          <span>Controls</span>
        </button>

        <button
          onClick={() => onNavigate('AIFeatures')}
          className={`sidebar-link w-full ${currentPage === 'AIFeatures' ? 'active' : ''}`}
        >
          <BrainCircuit size={18} />
          <span>AI Features</span>
        </button>

        <button
          onClick={() => onNavigate('BlockchainFeatures')}
          className={`sidebar-link w-full ${currentPage === 'BlockchainFeatures' ? 'active' : ''}`}
        >
          <Blocks size={18} />
          <span>Blockchain Features</span>
        </button>

        <button
          onClick={() => onNavigate('Settings')}
          className={`sidebar-link w-full ${currentPage === 'Settings' ? 'active' : ''}`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-primary-100">
            <div className="flex h-full w-full items-center justify-center text-primary-700">
              <User size={20} />
            </div>
          </div>
          <div className="flex-1 truncate">
            {state.isConnected ? (
              <>
                <p className="text-sm font-medium text-gray-700">Connected</p>
                <p className="truncate text-xs text-gray-500">{formatAddress(state.address)}</p>
              </>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-700">Not Connected</p>
                <p className="text-xs text-gray-500">Connect your wallet</p>
              </div>
            )}
          </div>
          <Wallet size={16} className="text-gray-400" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;