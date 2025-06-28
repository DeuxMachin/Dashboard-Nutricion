import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../api/api.js';
import { supabase } from '../lib/supabase.js';

interface User {
  id: number;
  username?: string;
  email: string;
  nombre: string;
  apellido: string;
  role: string;
  rut?: string;
  supabase_id?: string;
}

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

  // Verificar sesión de Supabase al cargar
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
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
              const userData = await authAPI.getCurrentUser();
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
        console.error('Error verificando autenticación:', error);
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
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithRut = async (rut: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authAPI.loginWithRut(rut, password);
      
      if (response.success && response.token) {
        setUser(response.user);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en login con RUT:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Error en logout:', error);
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
