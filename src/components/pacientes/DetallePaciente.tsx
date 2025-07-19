import React, { useState, useEffect } from 'react';
import { Cliente } from '../../types/index';
import { clientesService } from '../../services/api/clientesService';

interface DetallePacienteProps {
  clienteId: number;
  onBack: () => void;
}

export const DetallePaciente: React.FC<DetallePacienteProps> = ({ clienteId, onBack }) => {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'general' | 'medidas' | 'historial' | 'progreso'>('general');

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        setLoading(true);
        const data = await clientesService.getClienteById(clienteId);
        setCliente(data);
      } catch (err: any) {
        setError(err.error || 'Error al cargar el paciente');
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
  }, [clienteId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Paciente no encontrado</h3>
      </div>
    );
  }

  const getProgresoColor = (progreso: string) => {
    switch (progreso) {
      case 'Excelente': return 'bg-green-100 text-green-800';
      case 'Bueno': return 'bg-blue-100 text-blue-800';
      case 'Regular': return 'bg-yellow-100 text-yellow-800';
      case 'Pendiente': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateAge = (fechaNacimiento: string | undefined) => {
    if (!fechaNacimiento) return 'No especificada';
    const today = new Date();
    const birth = new Date(fechaNacimiento);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  const calculateIMC = () => {
    if (!cliente.peso || !cliente.altura) return 'No calculable';
    const imc = cliente.peso / (cliente.altura  * cliente.altura);
    return imc.toFixed(1);
  };

  const getIMCCategory = (imc: number) => {
    if (imc < 18.5) return { category: 'Bajo peso', color: 'text-blue-600' };
    if (imc < 25) return { category: 'Normal', color: 'text-green-600' };
    if (imc < 30) return { category: 'Sobrepeso', color: 'text-yellow-600' };
    return { category: 'Obesidad', color: 'text-red-600' };
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      {/* Información básica */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Nombre Completo</label>
            <p className="mt-1 text-sm text-gray-900">{cliente.nombre} {cliente.apellido}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">RUT</label>
            <p className="mt-1 text-sm text-gray-900">{cliente.rut}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Edad</label>
            <p className="mt-1 text-sm text-gray-900">{calculateAge(cliente.fecha_nacimiento)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Género</label>
            <p className="mt-1 text-sm text-gray-900">{cliente.genero || 'No especificado'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Correo</label>
            <p className="mt-1 text-sm text-gray-900">{cliente.correo || 'No especificado'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Teléfono</label>
            <p className="mt-1 text-sm text-gray-900">{cliente.telefono || 'No especificado'}</p>
          </div>
        </div>
      </div>

      {/* Datos físicos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Físicos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Altura</label>
            <p className="mt-1 text-sm text-gray-900">{cliente.altura ? `${cliente.altura} cm` : 'No especificada'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Peso Actual</label>
            <p className="mt-1 text-sm text-gray-900">{cliente.peso ? `${cliente.peso} kg` : 'No especificado'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Peso Objetivo</label>
            <p className="mt-1 text-sm text-gray-900">{cliente.peso_objetivo ? `${cliente.peso_objetivo} kg` : 'No especificado'}</p>
          </div>
        </div>
        
        {cliente.peso && cliente.altura && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-500">Índice de Masa Corporal (IMC)</label>
                <p className="mt-1 text-2xl font-bold text-gray-900">{calculateIMC()}</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${getIMCCategory(parseFloat(calculateIMC())).color}`}>
                  {getIMCCategory(parseFloat(calculateIMC())).category}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estado y progreso */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Tratamiento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Progreso</label>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getProgresoColor(cliente.progreso)}`}>
              {cliente.progreso}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Última Visita</label>
            <p className="mt-1 text-sm text-gray-900">
              {cliente.ultimavisita ? new Date(cliente.ultimavisita).toLocaleDateString() : 'Sin visitas registradas'}
            </p>
          </div>
        </div>
        
        {cliente.objetivos && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-500">Objetivos</label>
            <p className="mt-1 text-sm text-gray-900">{cliente.objetivos}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMedidasTab = () => (
    <div className="space-y-6">
      {/* Placeholder para gráfico de araña */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Medidas Corporales</h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900">Gráfico de Medidas</h4>
          <p className="text-gray-500 mt-2">Aquí se mostrará el gráfico de araña con las medidas de pliegues cutáneos</p>
          <p className="text-sm text-gray-400 mt-1">Funcionalidad en desarrollo</p>
        </div>
      </div>

      {/* Placeholder para composición corporal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Composición Corporal</h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900">Análisis de Masa Muscular</h4>
          <p className="text-gray-500 mt-2">Gráficos de evolución de masa muscular y grasa corporal</p>
          <p className="text-sm text-gray-400 mt-1">Funcionalidad en desarrollo</p>
        </div>
      </div>
    </div>
  );

  const renderHistorialTab = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial Médico</h3>
      
      {/* Alergias */}
      {cliente.alergias && cliente.alergias.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-2">Alergias</label>
          <div className="flex flex-wrap gap-2">
            {cliente.alergias.map((alergia, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full">
                {alergia}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Condiciones médicas */}
      {cliente.condiciones_medicas && cliente.condiciones_medicas.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-2">Condiciones Médicas</label>
          <div className="flex flex-wrap gap-2">
            {cliente.condiciones_medicas.map((condicion, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">
                {condicion}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tratamientos */}
      {cliente.tratamientos && cliente.tratamientos.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-500 mb-2">Tratamientos</label>
          <div className="flex flex-wrap gap-2">
            {cliente.tratamientos.map((tratamiento, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                {tratamiento}
              </span>
            ))}
          </div>
        </div>
      )}

      {(!cliente.alergias?.length && !cliente.condiciones_medicas?.length && !cliente.tratamientos?.length) && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Sin historial médico</h3>
          <p className="mt-1 text-sm text-gray-500">No se han registrado alergias, condiciones médicas o tratamientos.</p>
        </div>
      )}
    </div>
  );

  const renderProgresoTab = () => (
    <div className="space-y-6">
      {/* Placeholder para gráficos de progreso */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución del Peso</h3>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900">Gráfico de Progreso</h4>
          <p className="text-gray-500 mt-2">Evolución del peso y medidas a lo largo del tiempo</p>
          <p className="text-sm text-gray-400 mt-1">Funcionalidad en desarrollo</p>
        </div>
      </div>

      {/* Resumen del progreso */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Progreso</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-600">Peso Inicial</p>
            <p className="text-2xl font-bold text-blue-900">{cliente.peso || '--'} kg</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-600">Objetivo</p>
            <p className="text-2xl font-bold text-green-900">{cliente.peso_objetivo || '--'} kg</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm font-medium text-purple-600">Por Alcanzar</p>
            <p className="text-2xl font-bold text-purple-900">
              {cliente.peso && cliente.peso_objetivo 
                ? `${Math.abs(cliente.peso - cliente.peso_objetivo).toFixed(1)} kg`
                : '--'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Volver a la lista
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-lg font-medium text-green-600">
                {cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{cliente.nombre} {cliente.apellido}</h1>
              <p className="text-sm text-gray-500">RUT: {cliente.rut}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Información General
            </button>
            <button
              onClick={() => setActiveTab('medidas')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'medidas'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Medidas y Composición
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'historial'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Historial Médico
            </button>
            <button
              onClick={() => setActiveTab('progreso')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'progreso'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Progreso
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'medidas' && renderMedidasTab()}
        {activeTab === 'historial' && renderHistorialTab()}
        {activeTab === 'progreso' && renderProgresoTab()}
      </div>
    </div>
  );
};
