import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { authService } from '../services/api/index.js';
import { supabase } from '../lib/supabase.js';
import type { User } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithRut: (rut: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Referencias para el timeout de sesión
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para verificar integridad de datos (implementación simple)
  const checkDataIntegrity = (data: any): boolean => {
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
  };

  // Función de logout
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      // Limpiar timeouts
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    } catch (error) {
      // En caso de error, limpiar datos localmente
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  // Función para resetear timeout de sesión
  const resetSessionTimeout = () => {
    const timeoutMinutes = 30;
    
    // Limpiar timeouts existentes
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    // Mostrar advertencia 5 minutos antes de cerrar sesión
    const warningTime = (timeoutMinutes - 5) * 60 * 1000;
    if (warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        const shouldContinue = confirm(
          'Tu sesión expirará en 5 minutos por inactividad. ¿Deseas continuar?'
        );
        if (!shouldContinue) {
          logout();
        } else {
          resetSessionTimeout();
        }
      }, warningTime);
    }

    // Configurar timeout principal
    timeoutRef.current = setTimeout(() => {
      alert('Tu sesión ha expirado por inactividad.');
      logout();
    }, timeoutMinutes * 60 * 1000);
  };

  // Configurar listeners de actividad para el timeout
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetSessionTimeout();
    };

    // Agregar listeners para detectar actividad
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Iniciar el timeout
    resetSessionTimeout();

    return () => {
      // Limpiar listeners y timeouts
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [user]);

  // Verificar sesión de Supabase al cargar
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Probar conexión a Supabase
        await authService.testConnection();
        
        // Verificar sesión de Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Si hay sesión de Supabase, obtener datos del usuario
          const { data: nutricionistaData } = await supabase
            .from('nutricionista')
            .select('*')
            .eq('correo', session.user.email)
            .single();

          if (nutricionistaData) {
            const { data: loginData } = await supabase
              .from('login')
              .select('rol')
              .eq('id_nutri', nutricionistaData.id_nutri)
              .single();

            setUser({
              id: nutricionistaData.id_nutri,
              email: nutricionistaData.correo,
              nombre: nutricionistaData.nombre,
              apellido: nutricionistaData.apellido,
              rut: nutricionistaData.rut,
              role: loginData?.rol || 'Nutricionista',
              supabase_id: session.user.id
            });
            
            // Guardar también en localStorage para compatibilidad
            localStorage.setItem('user', JSON.stringify({
              id: nutricionistaData.id_nutri,
              email: nutricionistaData.correo,
              nombre: nutricionistaData.nombre,
              apellido: nutricionistaData.apellido,
              role: loginData?.rol || 'Nutricionista'
            }));
          }
        } else {
          // Fallback a token local
          const token = localStorage.getItem('token');
          const savedUser = localStorage.getItem('user');
          
          if (token && savedUser) {
            try {
              const userData = await authService.getCurrentUser();
              setUser(JSON.parse(savedUser));
            } catch (error) {
              // Token inválido, limpiar
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          }
        }
      } catch (error) {
        // Limpiar estado en caso de error durante la verificación
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    // Escuchar cambios en la autenticación de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Validar integridad de los datos de entrada
      const loginData = { email, password };
      if (!checkDataIntegrity(loginData)) {
        throw new Error('Datos de entrada no válidos o potencialmente peligrosos');
      }
      
      const response = await authService.login(email, password);
      
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        return true;
      }
      return false;
    } catch (error: any) {
      throw error; // Propagar el error para manejo en el componente
    } finally {
      setLoading(false);
    }
  };

  const loginWithRut = async (rut: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Validar integridad de los datos de entrada
      const loginData = { rut, password };
      if (!checkDataIntegrity(loginData)) {
        throw new Error('Datos de entrada no válidos o potencialmente peligrosos');
      }
      
      const response = await authService.loginWithRut(rut, password);
      
      if (response.success && response.token) {
        setUser(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return true;
      }
      return false;
    } catch (error: any) {
      throw error; // Propagar el error para manejo en el componente
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithRut,
      logout,
      loading,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
