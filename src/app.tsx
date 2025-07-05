import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, Dashboard, Navbar, Pacientes } from './components/index.js';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  // Monitoreo de seguridad global implementado directamente
  useEffect(() => {
    const detectSuspiciousActivity = (event: Event) => {
      const target = event.target as HTMLElement;
      
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const value = (target as HTMLInputElement).value;
        
        const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+=/i,
          /eval\(/i,
          /document\./i,
          /window\./i,
        ];

        const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(value));
        
        if (isSuspicious) {
          console.warn('Actividad sospechosa detectada globalmente:', value);
        }
      }
    };

    document.addEventListener('input', detectSuspiciousActivity);
    
    return () => {
      document.removeEventListener('input', detectSuspiciousActivity);
    };
  }, []);

  // Validar integridad de la aplicación
  useEffect(() => {
    // Verificar que no haya código malicioso inyectado
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && !src.startsWith('/') && !src.startsWith('http://localhost') && !src.startsWith('https://')) {
        console.warn('Script externo detectado:', src);
      }
    });

    // TODO: Configurar CSP después de que el login funcione
    // Temporalmente deshabilitado para permitir Supabase
  }, []);

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