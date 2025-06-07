import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  currentView?: string;
  setCurrentView?: (view: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView = 'dashboard', setCurrentView }) => {
  const { user, logout } = useAuth();

  const handleNavClick = (view: string) => {
    if (setCurrentView) {
      setCurrentView(view);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y navegación principal */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <svg className="h-8 w-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12a8 8 0 01-8 8m0-16a8 8 0 00-8 8m16 0c0-4.42-3.58-8-8-8-4.42 0-8 3.58-8 8 0 4.42 3.58 8 8 8 1.73 0 3.33-.55 4.64-1.5" />
                  <circle cx="12" cy="9" r="3" fill="currentColor" />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900">NutriAdmin</span>
              </div>
            </div>
            
            {/* Navegación principal */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="flex space-x-4">
                <button 
                  onClick={() => handleNavClick('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                    currentView === 'dashboard' 
                      ? 'text-gray-900 border-b-2 border-green-500' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => handleNavClick('pacientes')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                    currentView === 'pacientes' 
                      ? 'text-gray-900 border-b-2 border-green-500' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Pacientes
                </button>
                <button 
                  onClick={() => handleNavClick('avances')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                    currentView === 'avances' 
                      ? 'text-gray-900 border-b-2 border-green-500' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Avances
                </button>
                <button 
                  onClick={() => handleNavClick('estadisticas')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                    currentView === 'estadisticas' 
                      ? 'text-gray-900 border-b-2 border-green-500' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Estadísticas
                </button>
              </div>
            </div>
          </div>

          {/* Herramientas y perfil */}
          <div className="flex items-center space-x-4">
            {/* Herramientas */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Agenda */}
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200" title="Agenda">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Reportes */}
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200" title="Reportes">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Configuración */}
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200" title="Configuración">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Separador */}
              <div className="w-px h-6 bg-gray-300"></div>
            </div>

            {/* Notificaciones */}
            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
              <span className="sr-only">Ver notificaciones</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* Perfil de usuario */}
            <div className="ml-3 relative flex items-center">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {user?.nombre?.charAt(0).toUpperCase()}{user?.apellido?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-2 hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.nombre} {user?.apellido}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="ml-3 text-sm text-gray-500 hover:text-gray-700 transition duration-200"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;