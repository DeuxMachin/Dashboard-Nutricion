import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { loginRateLimit, generateCSRFToken } from '../../utils/security';

export const SecuritySettings: React.FC = () => {
  const { user } = useAuth();
  const [securityStatus, setSecurityStatus] = useState({
    csrfToken: '',
    sessionTimeout: 30,
    rateLimitAttempts: 5,
    xssProtection: true,
    integrityCheck: true
  });

  useEffect(() => {
    // Generar token CSRF actual
    const token = generateCSRFToken();
    setSecurityStatus(prev => ({
      ...prev,
      csrfToken: token
    }));
  }, []);

  const handleRegenerateCSRF = () => {
    const newToken = generateCSRFToken();
    sessionStorage.setItem('csrf_token', newToken);
    setSecurityStatus(prev => ({
      ...prev,
      csrfToken: newToken
    }));
  };

  const handleResetRateLimit = () => {
    if (user?.email) {
      loginRateLimit.reset(`email_${user.email}`);
      alert('Rate limit reseteado exitosamente');
    }
  };

  if (!user || user.role !== 'Administrador') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <svg className="h-6 w-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">Configuración de Seguridad</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800">Protecciones Activas</h4>
            <ul className="mt-2 space-y-1 text-sm text-green-700">
              <li>✓ Protección XSS activada</li>
              <li>✓ Validación de datos de entrada</li>
              <li>✓ Sanitización automática</li>
              <li>✓ Timeout de sesión configurado ({securityStatus.sessionTimeout} min)</li>
              <li>✓ Rate limiting en login ({securityStatus.rateLimitAttempts} intentos)</li>
              <li>✓ Tokens CSRF generados</li>
              <li>✓ Verificación de integridad de datos</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800">Configuración Actual</h4>
            <div className="mt-2 space-y-2 text-sm">
              <div>
                <label className="text-blue-700">Token CSRF:</label>
                <div className="font-mono text-xs bg-white p-1 rounded border mt-1">
                  {securityStatus.csrfToken.substring(0, 16)}...
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Timeout de Sesión:</span>
                <span className="font-medium">{securityStatus.sessionTimeout} min</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-blue-700">Límite de Intentos:</span>
                <span className="font-medium">{securityStatus.rateLimitAttempts}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-3">Acciones de Seguridad</h4>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRegenerateCSRF}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Regenerar Token CSRF
            </button>
            
            <button
              onClick={handleResetRateLimit}
              className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              Resetear Rate Limit
            </button>
            
            <button
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Limpiar Sesiones
            </button>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-2">Recomendaciones de Seguridad</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Revisa regularmente las políticas RLS en Supabase</li>
            <li>• Monitorea logs de acceso y errores de seguridad</li>
            <li>• Mantén actualizada la base de datos y dependencias</li>
            <li>• Configura HTTPS en producción</li>
            <li>• Implementa backup automático de datos</li>
            <li>• Revisa permisos de usuarios periódicamente</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
