import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Contenido principal sin panel lateral */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {/* Navegación de pestañas */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-6">
            <a href="#" className="border-b-2 border-green-500 py-4 px-1 text-sm font-medium text-gray-900">
              Vista General
            </a>
            <a href="#" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Analíticas
            </a>
            <a href="#" className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Reportes
            </a>
          </nav>
        </div>

        {/* Tarjetas métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tarjeta Total Pacientes */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-medium text-gray-600">Total Pacientes</h2>
              <span className="p-2 bg-blue-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">245</h3>
              <p className="text-sm text-green-600">+12% respecto al mes anterior</p>
            </div>
          </div>

          {/* Tarjeta Consultas Mensuales */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-medium text-gray-600">Consultas Mensuales</h2>
              <span className="p-2 bg-green-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">132</h3>
              <p className="text-sm text-green-600">+4% respecto al mes anterior</p>
            </div>
          </div>

          {/* Tarjeta Tasa de Éxito */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-medium text-gray-600">Tasa de Éxito</h2>
              <span className="p-2 bg-purple-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">78%</h3>
              <p className="text-sm text-green-600">+2% respecto al mes anterior</p>
            </div>
          </div>

          {/* Tarjeta Planes Activos */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-medium text-gray-600">Planes Activos</h2>
              <span className="p-2 bg-orange-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">189</h3>
              <p className="text-sm text-green-600">+8% respecto al mes anterior</p>
            </div>
          </div>
        </div>

        {/* Gráficos y listados */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gráfico de progreso nutricional - ocupa 2/3 del espacio */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Progreso Nutricional</h2>
            <p className="text-sm text-gray-500 mb-6">Progreso promedio de los pacientes en los últimos 30 días</p>
            
            <div className="h-64 relative">
              {/* Mockup de gráfico mejorado */}
              <div className="absolute inset-0">
                <div className="flex h-full items-end justify-between px-4">
                  {/* Etiquetas del eje Y */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400">
                    <span>100</span>
                    <span>75</span>
                    <span>50</span>
                    <span>25</span>
                    <span>0</span>
                  </div>
                  
                  {/* Líneas de la grilla */}
                  <div className="absolute inset-0 left-8">
                    <div className="h-full relative">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gray-200"></div>
                      <div className="absolute top-1/4 left-0 right-0 h-[1px] bg-gray-200"></div>
                      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gray-200"></div>
                      <div className="absolute top-3/4 left-0 right-0 h-[1px] bg-gray-200"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"></div>
                    </div>
                  </div>
                  
                  {/* Barras del gráfico */}
                  <div className="flex items-end justify-center w-full ml-8 space-x-3">
                    {[65, 70, 68, 75, 80, 85, 78, 82].map((height, i) => (
                      <div key={i} className="flex flex-col items-center space-y-1">
                        <div 
                          className="w-8 bg-gradient-to-t from-green-500 to-green-400 rounded-t-sm"
                          style={{ height: `${height}%` }}
                        ></div>
                        <span className="text-xs text-gray-500">S{i+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de pacientes recientes mejorada */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Pacientes Recientes</h2>
            <p className="text-sm text-gray-500 mb-6">Últimos pacientes registrados en el sistema</p>

            <div className="space-y-4">
              {/* Paciente 1 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">JD</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Juan Díaz</p>
                    <p className="text-xs text-gray-500">Plan: Pérdida de peso</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 bg-green-100 px-2 py-1 rounded-full">Hoy</span>
              </div>
              
              {/* Paciente 2 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">MR</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">María Rodríguez</p>
                    <p className="text-xs text-gray-500">Plan: Ganancia muscular</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded-full">Ayer</span>
              </div>
              
              {/* Paciente 3 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-orange-600">CL</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Carlos López</p>
                    <p className="text-xs text-gray-500">Plan: Nutrición deportiva</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">2 días</span>
              </div>
            </div>

            {/* Botón para ver más */}
            <div className="mt-4">
              <button className="w-full text-center text-sm text-green-600 hover:text-green-700 font-medium">
                Ver todos los pacientes →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
