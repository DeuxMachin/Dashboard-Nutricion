import { useState, useEffect } from 'react';
import { clientesService } from '../services/api/index.js';
import type { Cliente } from '../types/index.js';

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clientesService.getClientes();
      setClientes(data);
    } catch (err: any) {
      setError(err.error || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const createCliente = async (clienteData: Partial<Cliente>) => {
    try {
      const nuevoCliente = await clientesService.createCliente(clienteData);
      setClientes(prev => [nuevoCliente, ...prev]);
      return nuevoCliente;
    } catch (err: any) {
      throw err;
    }
  };

  const updateCliente = async (clienteId: number, clienteData: Partial<Cliente>) => {
    try {
      const clienteActualizado = await clientesService.updateCliente(clienteId, clienteData);
      setClientes(prev => 
        prev.map(cliente => 
          cliente.id_cliente === clienteId ? clienteActualizado : cliente
        )
      );
      return clienteActualizado;
    } catch (err: any) {
      throw err;
    }
  };

  const deleteCliente = async (clienteId: number) => {
    try {
      await clientesService.deleteCliente(clienteId);
      setClientes(prev => prev.filter(cliente => cliente.id_cliente !== clienteId));
    } catch (err: any) {
      throw err;
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return {
    clientes,
    loading,
    error,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente
  };
};
