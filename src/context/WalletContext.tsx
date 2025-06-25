import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '../types';
import { getUserLocation } from '../contracts';

type WalletAction =
  | { type: 'CONNECT_START' }
  | { type: 'CONNECT_SUCCESS'; payload: { address: string; chainId: number } }
  | { type: 'CONNECT_ERROR'; payload: string }
  | { type: 'DISCONNECT' }
  | { type: 'CHAIN_CHANGED'; payload: number }
  | { type: 'ACCOUNT_CHANGED'; payload: string | null };

const initialState: WalletState = {
  address: null,
  chainId: null,
  isConnecting: false,
  isConnected: false,
  error: null,
};

const WalletContext = createContext<{
  state: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
} | undefined>(undefined);

const walletReducer = (state: WalletState, action: WalletAction): WalletState => {
  switch (action.type) {
    case 'CONNECT_START':
      return {
        ...state,
        isConnecting: true,
        error: null,
      };
    case 'CONNECT_SUCCESS':
      return {
        ...state,
        address: action.payload.address,
        chainId: action.payload.chainId,
        isConnecting: false,
        isConnected: true,
        error: null,
      };
    case 'CONNECT_ERROR':
      return {
        ...state,
        isConnecting: false,
        isConnected: false,
        error: action.payload,
      };
    case 'DISCONNECT':
      return {
        ...initialState,
      };
    case 'CHAIN_CHANGED':
      return {
        ...state,
        chainId: action.payload,
      };
    case 'ACCOUNT_CHANGED':
      return {
        ...state,
        address: action.payload,
        isConnected: !!action.payload,
      };
    default:
      return state;
  }
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  useEffect(() => {
    // In WalletContext.tsx, update the checkConnection function
const checkConnection = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const network = await provider.getNetwork();
        dispatch({
          type: 'CONNECT_SUCCESS',
          payload: {
            address: accounts[0].address,
            chainId: Number(network.chainId),
          },
        });

        const location = await getUserLocation(provider, accounts[0].address);
        if (location) {
          // You'll need to pass this to your dashboard component
          // Either via context or props
        }
        
        // You might want to add an event here to trigger data loading
        // in your components
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  }
};

    checkConnection();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('chainChanged', (chainId: string) => {
        dispatch({ type: 'CHAIN_CHANGED', payload: parseInt(chainId, 16) });
      });

      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        dispatch({
          type: 'ACCOUNT_CHANGED',
          payload: accounts.length > 0 ? accounts[0] : null,
        });
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      dispatch({
        type: 'CONNECT_ERROR',
        payload: 'Please install MetaMask to connect your wallet',
      });
      return;
    }

    try {
      dispatch({ type: 'CONNECT_START' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      
      dispatch({
        type: 'CONNECT_SUCCESS',
        payload: {
          address: accounts[0],
          chainId: Number(network.chainId),
        },
      });
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      dispatch({
        type: 'CONNECT_ERROR',
        payload: error.message || 'Failed to connect wallet',
      });
    }
  };
  

  const disconnectWallet = () => {
    dispatch({ type: 'DISCONNECT' });
  };

  return (
    <WalletContext.Provider value={{ state, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

declare global {
  interface Window {
    ethereum: any;
  }
}