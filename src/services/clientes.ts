import { clientesAPI } from '../api/api.js';

export interface Cliente {
  ID_Cliente: number;
  ID_Nutri: number;
  Nombre: string;
  Apellido: string;
  Rut: string;
  Correo: string;
  Inactividad: number;
  ID_Plan?: number;
  Progreso: 'Pendiente' | 'Regular' | 'Bueno' | 'Excelente';
  UltimaVisita?: string;
}

export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const clientes = await clientesAPI.getClientes();
    return clientes;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw error;
  }
};