import { useState, useEffect } from 'react';
import { dashboardService, type DashboardStats } from '../services/api/dashboardService';

// Hook personalizado para manejar las estadísticas del dashboard
export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar las estadísticas
  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      const estadisticas = await dashboardService.getEstadisticasGenerales();
      setStats(estadisticas);
    } catch (err: any) {
      setError('No se pudieron cargar las estadísticas del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar los datos
  const refrescarDatos = () => {
    cargarEstadisticas();
  };

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    cargarEstadisticas();
  }, []);

  return {
    stats,
    loading,
    error,
    refrescarDatos
  };
};

// Hook para formatear datos de fechas de manera amigable
export const useDateFormatter = () => {
  const formatearFecha = (fecha?: string): string => {
    if (!fecha) return 'Sin fecha';
    
    const fechaObj = new Date(fecha);
    const ahora = new Date();
    const diferenciaDias = Math.floor((ahora.getTime() - fechaObj.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diferenciaDias === 0) return 'Hoy';
    if (diferenciaDias === 1) return 'Ayer';
    if (diferenciaDias < 7) return `${diferenciaDias} días`;
    if (diferenciaDias < 30) return `${Math.floor(diferenciaDias / 7)} semanas`;
    
    return fechaObj.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatearFechaCompleta = (fecha?: string): string => {
    if (!fecha) return 'Sin fecha';
    
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return {
    formatearFecha,
    formatearFechaCompleta
  };
};

// Hook para generar colores de avatares de manera consistente
export const useAvatarColors = () => {
  const colores = [
    'blue', 'purple', 'orange', 'green', 
    'red', 'indigo', 'pink', 'yellow',
    'cyan', 'teal', 'lime', 'amber'
  ];

  const obtenerColor = (index: number): string => {
    return colores[index % colores.length];
  };

  const obtenerIniciales = (nombre: string, apellido: string): string => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  return {
    obtenerColor,
    obtenerIniciales
  };
};
