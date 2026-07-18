import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import SimulatorConsole from './components/SimulatorConsole';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Team from './pages/Team';
import { FiLoader } from 'react-icons/fi';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh', 
          backgroundColor: '#f8fafc',
          color: 'var(--accent-primary)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <FiLoader className="animate-spin" size={40} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '16px', color: 'var(--text-sub)', fontWeight: 500 }}>
            Loading your billing profile...
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'billing':
        return <Billing />;
      case 'team':
        return <Team />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Primary content area */}
      <main className="main-content">
        {renderActiveView()}
      </main>

      {/* Floating super admin demo controls */}
      <SimulatorConsole />
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
