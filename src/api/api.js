import { supabase } from '../lib/supabase.js';

// Funciones de autenticación usando Supabase Auth
export const authAPI = {
  // Login usando Supabase Auth (recomendado)
  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Obtener datos adicionales del nutricionista
      const { data: nutricionistaData, error: nutricionistaError } = await supabase
        .from('nutricionista')
        .select('*')
        .eq('correo', email)
        .single();

      if (nutricionistaError || !nutricionistaData) {
        throw new Error('No se encontraron datos del nutricionista');
      }

      // Obtener rol del usuario
      const { data: loginData, error: loginError } = await supabase
        .from('login')
        .select('rol')
        .eq('id_nutri', nutricionistaData.id_nutri)
        .single();

      const userRole = loginData?.rol || 'Nutricionista';

      return {
        success: true,
        user: {
          id: nutricionistaData.id_nutri,
          email: nutricionistaData.correo,
          nombre: nutricionistaData.nombre,
          apellido: nutricionistaData.apellido,
          rut: nutricionistaData.rut,
          role: userRole,
          supabase_id: data.user.id
        },
        session: data.session
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw { error: error.message || 'Error de autenticación' };
    }
  },

  // Login tradicional con RUT/contraseña (para compatibilidad)
  loginWithRut: async (rut, password) => {
    try {
      // Buscar nutricionista por RUT
      const { data: nutricionistaData, error: nutricionistaError } = await supabase
        .from('nutricionista')
        .select('*')
        .eq('rut', rut)
        .single();

      if (nutricionistaError || !nutricionistaData) {
        throw new Error('RUT no encontrado');
      }

      // Buscar datos de login
      const { data: loginData, error: loginError } = await supabase
        .from('login')
        .select('*')
        .eq('id_nutri', nutricionistaData.id_nutri)
        .single();

      if (loginError || !loginData) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar contraseña (en producción usar bcrypt)
      if (password !== loginData.contrasena_hash) {
        throw new Error('Contraseña incorrecta');
      }

      // Crear token simple para compatibilidad
      const token = btoa(JSON.stringify({
        id: nutricionistaData.id_nutri,
        username: nutricionistaData.rut,
        email: nutricionistaData.correo,
        role: loginData.rol,
        nombre: nutricionistaData.nombre,
        apellido: nutricionistaData.apellido,
        timestamp: Date.now()
      }));

      return {
        success: true,
        token,
        user: {
          id: nutricionistaData.id_nutri,
          username: nutricionistaData.rut,
          email: nutricionistaData.correo,
          nombre: nutricionistaData.nombre,
          apellido: nutricionistaData.apellido,
          role: loginData.rol
        }
      };
    } catch (error) {
      console.error('Error en login con RUT:', error);
      throw { error: error.message || 'Error de autenticación' };
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error al cerrar sesión:', error);
      }
      // Limpiar almacenamiento local
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error en logout:', error);
    }
  },

  getCurrentUser: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Fallback a token local si no hay sesión de Supabase
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay sesión activa');
        }

        const payload = JSON.parse(atob(token));
        const userId = payload.id;

        const { data, error } = await supabase
          .from('nutricionista')
          .select('id_nutri, nombre, apellido, rut, correo')
          .eq('id_nutri', userId)
          .single();

        if (error) {
          throw new Error('Usuario no encontrado');
        }

        return data;
      }

      // Si hay sesión de Supabase, obtener datos del nutricionista
      const { data, error } = await supabase
        .from('nutricionista')
        .select('*')
        .eq('correo', session.user.email)
        .single();

      if (error) {
        throw new Error('Usuario no encontrado');
      }

      return data;
    } catch (error) {
      throw { error: 'Error al obtener usuario' };
    }
  }
};

// Funciones para clientes
export const clientesAPI = {
  getClientes: async () => {
    try {
      // Intentar obtener el usuario actual
      const { data: { session } } = await supabase.auth.getSession();
      let nutricionistaId;

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
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw { error: error.message || 'Error al obtener clientes' };
    }
  },

  createCliente: async (clienteData) => {
    try {
      // Obtener ID del nutricionista
      const { data: { session } } = await supabase.auth.getSession();
      let nutricionistaId;

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

      // Preparar datos del cliente
      const nuevoCliente = {
        ...clienteData,
        id_nutri: nutricionistaId,
        inactividad: false,
        progreso: clienteData.progreso || 'Pendiente'
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
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw { error: error.message || 'Error al crear cliente' };
    }
  },

  updateCliente: async (clienteId, clienteData) => {
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
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw { error: error.message || 'Error al actualizar cliente' };
    }
  },

  deleteCliente: async (clienteId) => {
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
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      throw { error: error.message || 'Error al eliminar cliente' };
    }
  },

  getClienteById: async (clienteId) => {
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
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      throw { error: error.message || 'Error al obtener cliente' };
    }
  }
};

// Funciones para medidas
export const medidasAPI = {
  getMedidasByCliente: async (clienteId) => {
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
    } catch (error) {
      console.error('Error al obtener medidas:', error);
      throw { error: error.message || 'Error al obtener medidas' };
    }
  },

  createMedida: async (medidaData) => {
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
    } catch (error) {
      console.error('Error al crear medida:', error);
      throw { error: error.message || 'Error al crear medida' };
    }
  }
};

// Funciones para consultas
export const consultasAPI = {
  getConsultasByCliente: async (clienteId) => {
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
    } catch (error) {
      console.error('Error al obtener consultas:', error);
      throw { error: error.message || 'Error al obtener consultas' };
    }
  },

  createConsulta: async (consultaData) => {
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
    } catch (error) {
      console.error('Error al crear consulta:', error);
      throw { error: error.message || 'Error al crear consulta' };
    }
  }
};

// Función de prueba de conexión
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
  } catch (error) {
    console.error('Error de conexión:', error);
    throw { error: error.message || 'Error de conexión a Supabase' };
  }
};
