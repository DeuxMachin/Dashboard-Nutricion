import { supabase } from '../../lib/supabase.js';
import type { Medidas, Consulta } from '../../types/index.js';

export const medidasService = {
  getMedidasByCliente: async (clienteId: number): Promise<Medidas[]> => {
    try {
      const { data, error } = await supabase
        .from('medidas')
        .select('*')
        .eq('id_cliente', clienteId)
        .order('fecha', { ascending: false });

      if (error) {
        throw new Error('Error al obtener medidas: ' + error.message);
      }

      return data || [];
    } catch (error: any) {
      throw { error: error.message || 'Error al obtener medidas' };
    }
  },

  createMedida: async (medidaData: Partial<Medidas>): Promise<Medidas> => {
    try {
      const nuevaMedida = {
        ...medidaData,
        fecha: medidaData.fecha || new Date().toISOString()
      };

      // Calcular IMC si hay peso y altura
      if (nuevaMedida.peso && nuevaMedida.altura) {
        const alturaMetros = nuevaMedida.altura / 100;
        nuevaMedida.imc = parseFloat((nuevaMedida.peso / (alturaMetros * alturaMetros)).toFixed(2));
      }

      const { data, error } = await supabase
        .from('medidas')
        .insert([nuevaMedida])
        .select()
        .single();

      if (error) {
        throw new Error('Error al crear medida: ' + error.message);
      }

      return data;
    } catch (error: any) {
      throw { error: error.message || 'Error al crear medida' };
    }
  }
};

export const consultasService = {
  getConsultasByCliente: async (clienteId: number): Promise<Consulta[]> => {
    try {
      const { data, error } = await supabase
        .from('consulta')
        .select('*')
        .eq('id_cliente', clienteId)
        .order('fecha', { ascending: false });

      if (error) {
        throw new Error('Error al obtener consultas: ' + error.message);
      }

      return data || [];
    } catch (error: any) {
      throw { error: error.message || 'Error al obtener consultas' };
    }
  },

  createConsulta: async (consultaData: Partial<Consulta>): Promise<Consulta> => {
    try {
      const nuevaConsulta = {
        ...consultaData,
        fecha: consultaData.fecha || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('consulta')
        .insert([nuevaConsulta])
        .select()
        .single();

      if (error) {
        throw new Error('Error al crear consulta: ' + error.message);
      }

      return data;
    } catch (error: any) {
      throw { error: error.message || 'Error al crear consulta' };
    }
  }
};
