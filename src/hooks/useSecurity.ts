import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.js';

/**
 * Hook para manejar timeout de sesión por inactividad
 */
export const useSessionTimeout = (timeoutMinutes: number = 30) => {
  const { logout } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
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
          resetTimeout(); // Reiniciar el timeout si el usuario quiere continuar
        }
      }, warningTime);
    }

    // Configurar timeout principal
    timeoutRef.current = setTimeout(() => {
      alert('Tu sesión ha expirado por inactividad.');
      logout();
    }, timeoutMinutes * 60 * 1000);
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimeout();
    };

    // Agregar listeners para detectar actividad
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Iniciar el timeout
    resetTimeout();

    return () => {
      // Limpiar listeners y timeouts
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [timeoutMinutes, logout]);

  return { resetTimeout };
};

/**
 * Hook para detectar intentos de inyección de código
 */
export const useSecurityMonitor = () => {
  useEffect(() => {
    const detectSuspiciousActivity = (event: Event) => {
      const target = event.target as HTMLElement;
      
      // Detectar intentos de inyección en inputs
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const value = (target as HTMLInputElement).value;
        
        // Patrones sospechosos
        const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+=/i,
          /eval\(/i,
          /document\./i,
          /window\./i,
          /'.*(<|>).*'/,
          /".*(<|>).*"/
        ];

        const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(value));
        
        if (isSuspicious) {
          // En producción, esto se podría enviar a un servicio de logging de seguridad
        }
      }
    };

    document.addEventListener('input', detectSuspiciousActivity);
    
    return () => {
      document.removeEventListener('input', detectSuspiciousActivity);
    };
  }, []);
};

/**
 * Hook para validar integridad de datos sensibles
 */
export const useDataIntegrity = () => {
  const checkDataIntegrity = (data: any): boolean => {
    try {
      // Verificar que los datos no hayan sido manipulados
      const jsonString = JSON.stringify(data);
      
      // Detectar intentos de manipulación
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

  return { checkDataIntegrity };
};
