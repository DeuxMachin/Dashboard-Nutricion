import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Pacientes from './components/Pacientes';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'pacientes':
        return <Pacientes />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar currentView={currentView} setCurrentView={setCurrentView} />
          {renderView()}
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default App;