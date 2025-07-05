// Centralizador de servicios API
export { authService } from './authService.js';
export { clientesService } from './clientesService.js';
export { medidasService, consultasService } from './medidasService.js';

// Función de prueba de conexión
import { supabase } from '../../lib/supabase.js';

export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('nutricionista')
      .select('count', { count: 'exact' });

    if (error) {
      throw new Error('Error de conexión a Supabase: ' + error.message);
    }

    return { 
      message: 'Conexión a Supabase exitosa', 
      count: data,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    throw { error: error.message || 'Error de conexión a Supabase' };
  }
};
