import React, { useEffect, useState } from 'react';
import { getClientes, Cliente } from '../services/clientes';

const Pacientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroProgreso, setFiltroProgreso] = useState<string>('');
  
  
  const [paginaActual, setPaginaActual] = useState(1);
  const clientesPorPagina = 7;

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        const data = await getClientes();
        setClientes(data);
      } catch (err) {
        console.error('Error al obtener clientes:', err);
        setError('Error al cargar los pacientes');
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  // Filtrar clientes
  const clientesFiltrados = clientes.filter(cliente => {
    const matchesSearch = 
      cliente.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.Apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.Rut.includes(searchTerm) ||
      cliente.Correo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProgreso = 
      filtroProgreso === '' || cliente.Progreso === filtroProgreso;
    
    return matchesSearch && matchesProgreso && !cliente.Inactividad;
  });

  
  const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
  const indiceInicio = (paginaActual - 1) * clientesPorPagina;
  const indiceFin = indiceInicio + clientesPorPagina;
  const clientesPaginados = clientesFiltrados.slice(indiceInicio, indiceFin);

 
  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, filtroProgreso]);

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const getProgresoColor = (progreso: string) => {
    switch (progreso) {
      case 'Excelente':
        return 'bg-green-100 text-green-800';
      case 'Bueno':
        return 'bg-blue-100 text-blue-800';
      case 'Regular':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pendiente':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Sin visitas';
    return new Date(date).toLocaleDateString('es-CL');
  };

  // Funciones para las acciones
  const handleVer = (cliente: Cliente) => {
    console.log('Ver cliente:', cliente);
    
  };

  const handleEditar = (cliente: Cliente) => {
    console.log('Editar cliente:', cliente);
    
  };

  const handleEliminar = (cliente: Cliente) => {
    console.log('Eliminar cliente:', cliente);
   
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${cliente.Nombre} ${cliente.Apellido}?`)) {
      
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona y monitorea a todos tus pacientes
              </p>
            </div>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Paciente
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{clientes.filter(c => !c.Inactividad).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Progreso Excelente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clientes.filter(c => c.Progreso === 'Excelente' && !c.Inactividad).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Necesitan Atención</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clientes.filter(c => c.Progreso === 'Pendiente' && !c.Inactividad).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Visitas Este Mes</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar paciente
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nombre, RUT o correo..."
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div>
              <label htmlFor="progreso" className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por progreso
              </label>
              <select
                id="progreso"
                value={filtroProgreso}
                onChange={(e) => setFiltroProgreso(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todos</option>
                <option value="Excelente">Excelente</option>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center justify-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar Lista
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Lista de pacientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {clientesFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pacientes</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filtroProgreso ? 'No se encontraron pacientes con los filtros aplicados.' : 'Comienza agregando tu primer paciente.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progreso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Última Visita
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientesPaginados.map((cliente) => (
                      <tr key={cliente.ID_Cliente} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-green-600">
                                {getInitials(cliente.Nombre, cliente.Apellido)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {cliente.Nombre} {cliente.Apellido}
                              </div>
                              <div className="text-sm text-gray-500">
                                RUT: {cliente.Rut}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{cliente.Correo || 'Sin correo'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProgresoColor(cliente.Progreso)}`}>
                            {cliente.Progreso}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(cliente.UltimaVisita)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {/* Botón Ver */}
                            <button
                              onClick={() => handleVer(cliente)}
                              className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors duration-200 border border-blue-200"
                              title="Ver detalles"
                            >
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver
                            </button>

                            {/* Botón Editar */}
                            <button
                              onClick={() => handleEditar(cliente)}
                              className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-100 transition-colors duration-200 border border-amber-200"
                              title="Editar información"
                            >
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar
                            </button>

                            {/* Botón Eliminar */}
                            <button
                              onClick={() => handleEliminar(cliente)}
                              className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors duration-200 border border-red-200"
                              title="Eliminar paciente"
                            >
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              
              {totalPaginas > 1 && (
                <div className="bg-white px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-700">
                      <span>
                        Mostrando <span className="font-medium">{indiceInicio + 1}</span> a{' '}
                        <span className="font-medium">{Math.min(indiceFin, clientesFiltrados.length)}</span> de{' '}
                        <span className="font-medium">{clientesFiltrados.length}</span> pacientes
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/*  página anterior */}
                      <button
                        onClick={() => cambiarPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                          paginaActual === 1
                            ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        
                      </button>

                      {/* Números de página */}
                      <div className="flex space-x-1">
                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numeroPagina) => {
                          // Mostrar solo algunas páginas para evitar overflow
                          if (
                            numeroPagina === 1 ||
                            numeroPagina === totalPaginas ||
                            (numeroPagina >= paginaActual - 1 && numeroPagina <= paginaActual + 1)
                          ) {
                            return (
                              <button
                                key={numeroPagina}
                                onClick={() => cambiarPagina(numeroPagina)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                                  paginaActual === numeroPagina
                                    ? 'bg-green-600 text-white border-green-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {numeroPagina}
                              </button>
                            );
                          } else if (
                            numeroPagina === paginaActual - 2 ||
                            numeroPagina === paginaActual + 2
                          ) {
                            return (
                              <span key={numeroPagina} className="px-2 py-2 text-sm text-gray-500">
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      {/*  página siguiente */}
                      <button
                        onClick={() => cambiarPagina(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                          paginaActual === totalPaginas
                            ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        
                        <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pacientes;