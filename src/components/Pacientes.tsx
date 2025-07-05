import React, { useEffect, useState, useCallback } from 'react';
import { clientesService } from '../services/api/clientesService';
import type { Cliente } from '../types/index';
import { sanitizeInput, escapeHtml } from '../utils/security';
import DropdownMenu from './ui/DropdownMenu';
import { NuevoPacienteForm } from './pacientes/NuevoPacienteForm';

const Pacientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroProgreso, setFiltroProgreso] = useState<string>('');
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  
  const [paginaActual, setPaginaActual] = useState(1);
  const clientesPorPagina = 7;

  // Función para verificar integridad de datos - memoizada para evitar re-renders
  const checkDataIntegrity = useCallback((data: any): boolean => {
    try {
      const jsonString = JSON.stringify(data);
      const maliciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+=/i,
        /data:text\/html/i,
        /vbscript:/i
      ];
      return !maliciousPatterns.some(pattern => pattern.test(jsonString));
    } catch {
      return false;
    }
  }, []);

  // Monitoreo de seguridad implementado directamente
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
          console.warn('Actividad sospechosa detectada en Pacientes:', value);
        }
      }
    };

    document.addEventListener('input', detectSuspiciousActivity);
    
    return () => {
      document.removeEventListener('input', detectSuspiciousActivity);
    };
  }, []);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        const data = await clientesService.getClientes();
        
        // Validar integridad de los datos recibidos
        if (!checkDataIntegrity(data)) {
          throw new Error('Los datos recibidos no son seguros');
        }
        
        // Sanitizar datos antes de almacenar
        const sanitizedData = data.map(cliente => ({
          ...cliente,
          nombre: escapeHtml(cliente.nombre),
          apellido: escapeHtml(cliente.apellido),
          correo: cliente.correo ? escapeHtml(cliente.correo) : '',
        }));
        
        setClientes(sanitizedData);
      } catch (err) {
        setError('Error al cargar los pacientes');
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []); // Removemos checkDataIntegrity de las dependencias

  // Filtrar clientes con validaciones de seguridad
  const clientesFiltrados = clientes.filter(cliente => {
    // Sanitizar término de búsqueda para prevenir XSS
    const sanitizedSearchTerm = sanitizeInput(searchTerm);
    
    // Validar que el término de búsqueda no contenga patrones maliciosos
    const suspiciousPatterns = [/<script/i, /javascript:/i, /on\w+=/i];
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(sanitizedSearchTerm));
    
    if (isSuspicious) {
      console.warn('Término de búsqueda sospechoso detectado:', searchTerm);
      return false;
    }
    
    const matchesSearch = 
      cliente.nombre.toLowerCase().includes(sanitizedSearchTerm.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(sanitizedSearchTerm.toLowerCase()) ||
      cliente.rut.includes(sanitizedSearchTerm) ||
      cliente.correo?.toLowerCase().includes(sanitizedSearchTerm.toLowerCase());
    
    const matchesProgreso = 
      filtroProgreso === '' || cliente.progreso === filtroProgreso;
    
    return matchesSearch && matchesProgreso && !cliente.inactividad;
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

  // Funciones para las acciones de cada paciente
  const handleVer = (cliente: Cliente) => {
    // Aquí iría la lógica para ver los detalles del paciente
    console.log('Ver detalles de:', cliente.nombre);
  };

  const handleEditar = (cliente: Cliente) => {
    // Aquí iría la lógica para editar el paciente
    console.log('Editar paciente:', cliente.nombre);
  };

  const handleEliminar = (cliente: Cliente) => {
    // Confirmar antes de eliminar un paciente
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${cliente.nombre} ${cliente.apellido}?`)) {
      // Aquí iría la lógica para eliminar el paciente
      console.log('Eliminar paciente:', cliente.nombre);
    }
  };

  // Nuevas funciones para las acciones adicionales
  const handleRegistrarVisita = (cliente: Cliente) => {
    // Aquí iría la lógica para registrar una nueva visita
    console.log('Registrar visita para:', cliente.nombre);
  };

  const handleEditarPlan = (cliente: Cliente) => {
    // Aquí iría la lógica para editar el plan nutricional
    console.log('Editar plan de:', cliente.nombre);
  };

  const handleVerHistorial = (cliente: Cliente) => {
    // Aquí iría la lógica para ver el historial médico
    console.log('Ver historial de:', cliente.nombre);
  };

  const handleEnviarMensaje = (cliente: Cliente) => {
    // Aquí iría la lógica para enviar un mensaje al paciente
    console.log('Enviar mensaje a:', cliente.nombre);
  };

  // Función para manejar el nuevo paciente
  const handleNuevoPaciente = async (data: Partial<Cliente>) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      const nuevoCliente = await clientesService.createCliente(data);
      
      // Actualizar la lista de clientes
      setClientes(prev => [nuevoCliente, ...prev]);
      setShowNewPatientForm(false);
      
      // Mensaje de éxito (podrías agregar un toast aquí)
      console.log('Paciente creado exitosamente:', nuevoCliente.nombre);
      
    } catch (err) {
      console.error('Error al crear paciente:', err);
      setError('Error al crear el paciente. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelNewPatient = () => {
    setShowNewPatientForm(false);
    setError('');
  };

  // Función para generar las opciones del dropdown menu
  const getDropdownOptions = (cliente: Cliente) => [
    {
      label: 'Ver detalles',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      onClick: () => handleVer(cliente),
      color: 'default' as const
    },
    {
      label: 'Registrar visita',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => handleRegistrarVisita(cliente),
      color: 'success' as const
    },
    {
      label: 'Editar plan',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      onClick: () => handleEditarPlan(cliente),
      color: 'warning' as const
    },
    {
      label: 'Ver historial',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      onClick: () => handleVerHistorial(cliente),
      color: 'default' as const
    },
    {
      label: 'Enviar mensaje',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      onClick: () => handleEnviarMensaje(cliente),
      color: 'default' as const
    },
    {
      label: 'Editar paciente',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: () => handleEditar(cliente),
      color: 'warning' as const
    },
    {
      label: 'Eliminar paciente',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      onClick: () => handleEliminar(cliente),
      color: 'danger' as const
    }
  ];

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

  // Si mostrar formulario de nuevo paciente
  if (showNewPatientForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center">
              <button
                onClick={handleCancelNewPatient}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nuevo Paciente</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Completa la información para registrar un nuevo paciente
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NuevoPacienteForm
            onSubmit={handleNuevoPaciente}
            onCancel={handleCancelNewPatient}
            isLoading={isSubmitting}
          />
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
            <button 
              onClick={() => setShowNewPatientForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center"
            >
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
                <p className="text-2xl font-bold text-gray-900">{clientes.filter(c => !c.inactividad).length}</p>
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
                  {clientes.filter(c => c.progreso === 'Excelente' && !c.inactividad).length}
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
                  {clientes.filter(c => c.progreso === 'Pendiente' && !c.inactividad).length}
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
                  onChange={(e) => {
                    const sanitized = sanitizeInput(e.target.value);
                    setSearchTerm(sanitized);
                  }}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nombre, RUT o correo..."
                  maxLength={100}
                  autoComplete="off"
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
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
                      <tr key={cliente.id_cliente} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-green-600">
                                {getInitials(cliente.nombre, cliente.apellido)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {cliente.nombre} {cliente.apellido}
                              </div>
                              <div className="text-sm text-gray-500">
                                RUT: {cliente.rut}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{cliente.correo || 'Sin correo'}</div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getProgresoColor(cliente.progreso)}`}>
                            {cliente.progreso}
                          </span>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(cliente.ultimavisita)}
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-sm font-medium">
                          <div className="flex justify-end pr-2">
                            <DropdownMenu 
                              options={getDropdownOptions(cliente)}
                              className="relative"
                            />
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