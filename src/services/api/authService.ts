import { supabase } from '../../lib/supabase.js';
import type { User, AuthResponse } from '../../types/index.js';
import { validateEmail, validateRUT, sanitizeInput, loginRateLimit, generateCSRFToken } from '../../utils/security.js';

export const authService = {

  // Login usando Supabase Auth 
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      // Validaciones de seguridad
      if (!validateEmail(email)) {
        throw new Error('Formato de email inválido');
      }

      // Rate limiting
      const clientId = `email_${email}`;
      if (!loginRateLimit.isAllowed(clientId)) {
        const remaining = loginRateLimit.getRemainingAttempts(clientId);
        throw new Error(`Demasiados intentos de login. Intentos restantes: ${remaining}`);
      }

      // Sanitizar entrada
      const sanitizedEmail = sanitizeInput(email) as string;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Generar token CSRF para esta sesión
      const csrfToken = generateCSRFToken();
      sessionStorage.setItem('csrf_token', csrfToken);

      // Obtener datos adicionales del nutricionista
      const { data: nutricionistaData, error: nutricionistaError } = await supabase
        .from('nutricionista')
        .select('*')
        .eq('correo', sanitizedEmail)
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

      // Resetear rate limit en login exitoso
      loginRateLimit.reset(clientId);

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
    } catch (error: any) {
      throw { error: error.message || 'Error de autenticación' };
    }
  },

  // Autenticación con RUT y contraseña para usuarios existentes
  loginWithRut: async (rut: string, password: string): Promise<AuthResponse> => {
    try {
      // Validar y limpiar los datos de entrada
      const sanitizedRut = rut.trim();
      const sanitizedPassword = password.trim();

      // Buscar nutricionista por RUT en la base de datos
      const { data: nutricionistaData, error: nutricionistaError } = await supabase
        .from('nutricionista')
        .select('*')
        .eq('rut', sanitizedRut);

      if (nutricionistaError) {
        throw new Error('Error al buscar en la base de datos: ' + nutricionistaError.message);
      }

      if (!nutricionistaData || nutricionistaData.length === 0) {
        throw new Error('RUT no encontrado en la base de datos');
      }

      const nutricionista = nutricionistaData[0];

      // Obtener las credenciales de acceso del nutricionista
      const { data: loginData, error: loginError } = await supabase
        .from('login')
        .select('*')
        .eq('id_nutri', nutricionista.id_nutri);

      if (loginError) {
        throw new Error('Error al buscar credenciales: ' + loginError.message);
      }

      if (!loginData || loginData.length === 0) {
        throw new Error('Credenciales no encontradas en la base de datos');
      }

      const login = loginData[0];

      // Verificar que la contraseña sea correcta
      if (sanitizedPassword !== login.contrasena_hash) {
        throw new Error('Contraseña incorrecta');
      }

      // Crear token de sesión con información del usuario
      const tokenPayload = {
        id: nutricionista.id_nutri,
        username: nutricionista.rut,
        email: nutricionista.correo,
        role: login.rol,
        nombre: nutricionista.nombre,
        apellido: nutricionista.apellido,
        timestamp: Date.now(),
        csrf: generateCSRFToken()
      };

      const token = btoa(JSON.stringify(tokenPayload));

      return {
        success: true,
        token,
        user: {
          id: nutricionista.id_nutri,
          username: nutricionista.rut,
          email: nutricionista.correo,
          nombre: nutricionista.nombre,
          apellido: nutricionista.apellido,
          role: login.rol
        }
      };
    } catch (error: any) {
      throw { error: error.message || 'Error de autenticación' };
    }
  },

  logout: async (): Promise<void> => {
    try {
      // Cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      
      // Limpiar todos los datos de sesión local
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('csrf_token');
      
      // Eliminar cualquier información sensible almacenada
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('nutricion_') || key.includes('session')) {
          localStorage.removeItem(key);
        }
      });
      
    } catch (error) {
      // Silenciar errores de logout para evitar interrumpir el flujo de cierre de sesión
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

        // Validar token
        let payload;
        try {
          payload = JSON.parse(atob(token));
        } catch {
          throw new Error('Token inválido');
        }

        // Verificar que el token no sea muy antiguo (24 horas)
        const tokenAge = Date.now() - payload.timestamp;
        if (tokenAge > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('Token expirado');
        }

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
    } catch (error: any) {
      throw { error: 'Error al obtener usuario' };
    }
  },

  // Verificar integridad de la sesión
  verifySession: async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Verificar que la sesión no haya expirado
        const expirationTime = new Date(session.expires_at || '').getTime();
        const now = Date.now();
        
        if (now >= expirationTime) {
          await authService.logout();
          return false;
        }
        
        return true;
      }
      
      // Verificar token local
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      try {
        const payload = JSON.parse(atob(token));
        const tokenAge = Date.now() - payload.timestamp;
        
        if (tokenAge > 24 * 60 * 60 * 1000) {
          await authService.logout();
          return false;
        }
        
        return true;
      } catch {
        await authService.logout();
        return false;
      }
      
    } catch {
      return false;
    }
  }
};
