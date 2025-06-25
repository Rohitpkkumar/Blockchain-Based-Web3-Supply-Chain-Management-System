import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Partners from './pages/Partners';
import Orders from './pages/Orders';
import Controls from './pages/Controls';
import AIFeatures from './pages/AIFeatures';
import BlockchainFeatures from './pages/BlockchainFeatures';
import { WalletProvider } from './context/WalletContext';
import { AppState, MapMarker, Partner, Order, Coordinates } from './types';


function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<AppState['currentPage']>('Dashboard');
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [orders] = useState<Order[]>([]);
  const [partners] = useState<Partner[]>([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigate = (page: AppState['currentPage']) => {
    setCurrentPage(page);
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  useEffect(() => {
  if (partners.length > 0 || orders.length > 0) {
    const markers: MapMarker[] = [];

    // Add user location if available
    if (userLocation) {
      markers.push({
        id: 'user-1',
        position: userLocation,
        type: 'user',
        label: 'HQ'
      });
    }

    // ... rest of your marker logic
  }
}, [partners, orders, userLocation]);

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return (
          <Dashboard 
            isMapExpanded={isMapExpanded} 
            onToggleMapExpand={() => setIsMapExpanded(!isMapExpanded)} 
          />
        );
      case 'Partners':
        return <Partners />;
      case 'Orders':
        return <Orders />;
      case 'Controls':
        return <Controls />;
      case 'AIFeatures':
        return <AIFeatures />
      case 'BlockchainFeatures':
        return <BlockchainFeatures />
      case 'Settings':
        return (
          <div className="container mx-auto p-4 lg:p-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">This section is under development</p>
          </div>
        );
      default:
        return <Dashboard isMapExpanded={isMapExpanded} onToggleMapExpand={() => setIsMapExpanded(!isMapExpanded)} />;
    }
  };

  return (
    <WalletProvider>
      <div className="flex h-screen flex-col">
        <Navbar 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
          onLocationUpdate={(lat, lng) => setUserLocation({ lat, lng })}
          onNavigate={handleNavigate}
          currentPage={currentPage}
        />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar 
            isOpen={isSidebarOpen} 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
          />
          
          {/* Main content */}
          <main 
            className={`flex-1 overflow-y-auto bg-gray-50 transition-all duration-300 ${
              isMapExpanded ? 'pt-0' : 'pt-4'
            } ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}
          >
            {renderPage()}
          </main>
        </div>
      </div>
    </WalletProvider>
  );
}

export default App;