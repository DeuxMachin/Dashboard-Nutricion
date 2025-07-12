import { supabase } from '../../lib/supabase.js';
import type { Cliente } from '../../types/index.js';
import { validateClienteData, sanitizeInput } from '../../utils/security.js';

export const clientesService = {
  getClientes: async (): Promise<Cliente[]> => {
    try {
      // Intentar obtener el usuario actual
      const { data: { session } } = await supabase.auth.getSession();
      let nutricionistaId: number;

      if (session) {
        // Si hay sesión de Supabase, obtener ID del nutricionista
        const { data: nutricionistaData } = await supabase
          .from('nutricionista')
          .select('id_nutri')
          .eq('correo', session.user.email)
          .single();
        
        nutricionistaId = nutricionistaData?.id_nutri;
      } else {
        // Fallback a token local
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay autenticación');
        }
        const payload = JSON.parse(atob(token));
        nutricionistaId = payload.id;
      }

      if (!nutricionistaId) {
        throw new Error('No se pudo identificar al nutricionista');
      }

      const { data, error } = await supabase
        .from('cliente')
        .select('*')
        .eq('id_nutri', nutricionistaId)
        .eq('inactividad', false)
        .order('ultimavisita', { ascending: false, nullsFirst: false })
        .order('id_cliente', { ascending: false });

      if (error) {
        throw new Error('Error al obtener clientes: ' + error.message);
      }

      return data || [];
    } catch (error: any) {
      throw { error: error.message || 'Error al obtener clientes' };
    }
  },

  createCliente: async (clienteData: Partial<Cliente>): Promise<Cliente> => {
    try {
      // Validar datos de entrada
      const validation = validateClienteData(clienteData);
      
      if (!validation.isValid) {
        throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
      }

      // Sanitizar todos los campos de texto
      const sanitizedData = {
        ...clienteData,
        nombre: sanitizeInput(clienteData.nombre || ''),
        apellido: sanitizeInput(clienteData.apellido || ''),
        rut: sanitizeInput(clienteData.rut || ''),
        correo: clienteData.correo ? sanitizeInput(clienteData.correo) : null,
      };

      // Obtener ID del nutricionista
      const { data: { session } } = await supabase.auth.getSession();
      let nutricionistaId: number;

      if (session) {
        const { data: nutricionistaData } = await supabase
          .from('nutricionista')
          .select('id_nutri')
          .eq('correo', session.user.email)
          .single();
        
        nutricionistaId = nutricionistaData?.id_nutri;
      } else {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay autenticación');
        }
        const payload = JSON.parse(atob(token));
        nutricionistaId = payload.id;
      }

      if (!nutricionistaId) {
        throw new Error('No se pudo identificar al nutricionista');
      }

      // Preparar datos del cliente (solo campos que existen en la tabla)
      const nuevoCliente = {
        nombre: sanitizedData.nombre,
        apellido: sanitizedData.apellido,
        rut: sanitizedData.rut,
        correo: sanitizedData.correo,
        telefono: sanitizedData.telefono,
        fecha_nacimiento: sanitizedData.fecha_nacimiento,
        genero: sanitizedData.genero,
        altura: sanitizedData.altura,
        peso: sanitizedData.peso,
        peso_objetivo: sanitizedData.peso_objetivo,
        alergias: sanitizedData.alergias || [],
        condiciones_medicas: sanitizedData.condiciones_medicas || [],
        tratamientos: sanitizedData.tratamientos || [],
        objetivos: sanitizedData.objetivos,
        id_nutri: nutricionistaId,
        inactividad: false,
        progreso: sanitizedData.progreso || 'Pendiente'
      };

      const { data, error } = await supabase
        .from('cliente')
        .insert([nuevoCliente])
        .select()
        .single();

      if (error) {
        throw new Error('Error al crear cliente: ' + error.message);
      }

      return data;
    } catch (error: any) {
      throw { error: error.message || 'Error al crear cliente' };
    }
  },

  updateCliente: async (clienteId: number, clienteData: Partial<Cliente>): Promise<Cliente> => {
    try {
      const { data, error } = await supabase
        .from('cliente')
        .update(clienteData)
        .eq('id_cliente', clienteId)
        .select()
        .single();

      if (error) {
        throw new Error('Error al actualizar cliente: ' + error.message);
      }

      return data;
    } catch (error: any) {
      throw { error: error.message || 'Error al actualizar cliente' };
    }
  },

  deleteCliente: async (clienteId: number): Promise<Cliente> => {
    try {
      // Soft delete - marcar como inactivo
      const { data, error } = await supabase
        .from('cliente')
        .update({ inactividad: true })
        .eq('id_cliente', clienteId)
        .select()
        .single();

      if (error) {
        throw new Error('Error al eliminar cliente: ' + error.message);
      }

      return data;
    } catch (error: any) {
      throw { error: error.message || 'Error al eliminar cliente' };
    }
  },

  getClienteById: async (clienteId: number): Promise<Cliente> => {
    try {
      const { data, error } = await supabase
        .from('cliente')
        .select('*')
        .eq('id_cliente', clienteId)
        .eq('inactividad', false)
        .single();

      if (error) {
        throw new Error('Cliente no encontrado');
      }

      return data;
    } catch (error: any) {
      throw { error: error.message || 'Error al obtener cliente' };
    }
  }
};
