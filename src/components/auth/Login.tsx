import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail, validateRUT, sanitizeInput, loginRateLimit } from '../../utils/security';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState<'email' | 'rut'>('rut');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const { login, loginWithRut } = useAuth();
  
  // Implementar monitoreo de seguridad directamente
  useEffect(() => {
    const detectSuspiciousActivity = (event: Event) => {
      const target = event.target as HTMLElement;
      
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const value = (target as HTMLInputElement).value;
        
        const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /on\w+=/i,
          /eval\(/i,
          /document\./i,
          /window\./i,
        ];

        const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(value));
        
        if (isSuspicious) {
          console.warn('Actividad sospechosa detectada en login:', value);
        }
      }
    };

    document.addEventListener('input', detectSuspiciousActivity);
    
    return () => {
      document.removeEventListener('input', detectSuspiciousActivity);
    };
  }, []);

  // Validar entrada en tiempo real
  useEffect(() => {
    const errors: string[] = [];
    
    if (username) {
      const sanitized = sanitizeInput(username);
      if (sanitized !== username) {
        errors.push('El campo contiene caracteres no válidos');
      }
      
      if (loginMethod === 'email' && !validateEmail(username)) {
        errors.push('Formato de email inválido');
      } else if (loginMethod === 'rut' && !validateRUT(username)) {
        errors.push('Formato de RUT inválido');
      }
    }
    
    setValidationErrors(errors);
  }, [username, loginMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Verificar rate limiting antes de hacer la petición
      const clientId = loginMethod === 'email' ? `email_${username}` : `rut_${username}`;
      if (!loginRateLimit.isAllowed(clientId)) {
        const remaining = loginRateLimit.getRemainingAttempts(clientId);
        setRemainingAttempts(remaining);
        throw new Error(`Demasiados intentos de login. Intentos restantes: ${remaining}. Intenta de nuevo en 15 minutos.`);
      }

      // Validar datos antes de enviar
      if (validationErrors.length > 0) {
        throw new Error(validationErrors[0]);
      }

      // Sanitizar datos de entrada
      const sanitizedUsername = sanitizeInput(username);
      const sanitizedPassword = sanitizeInput(password);

      let success = false;
      
      if (loginMethod === 'email') {
        success = await login(sanitizedUsername, sanitizedPassword);
      } else {
        success = await loginWithRut(sanitizedUsername, sanitizedPassword);
      }
      
      if (!success) {
        setError('Credenciales inválidas. Verifica tu información y contraseña.');
      }
    } catch (err: any) {
      setError(err?.error || err?.message || 'Error al iniciar sesión. Verifica tu conexión.');
      
      // Actualizar intentos restantes si es error de rate limiting
      if (err?.message?.includes('Intentos restantes')) {
        const clientId = loginMethod === 'email' ? `email_${username}` : `rut_${username}`;
        setRemainingAttempts(loginRateLimit.getRemainingAttempts(clientId));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-gray-600 mb-8">
              Ingresa tus credenciales para acceder al dashboard
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
                {remainingAttempts !== null && remainingAttempts <= 2 && (
                  <div className="mt-2 text-xs">
                    ⚠️ Solo te quedan {remainingAttempts} intentos antes del bloqueo temporal.
                  </div>
                )}
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                <ul className="list-disc list-inside">
                  {validationErrors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Selector de método de login */}
            <div className="flex space-x-4 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setLoginMethod('rut')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === 'rut'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                RUT
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMethod === 'email'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Email
              </button>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                {loginMethod === 'email' ? 'Correo Electrónico' : 'RUT'}
              </label>
              <input
                id="username"
                name="username"
                type={loginMethod === 'email' ? 'email' : 'text'}
                required
                value={username}
                onChange={(e) => {
                  const sanitized = sanitizeInput(e.target.value);
                  setUsername(sanitized);
                }}
                className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ${
                  validationErrors.length > 0 ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={loginMethod === 'email' ? 'ejemplo@correo.com' : 'Ingresa tu RUT'}
                maxLength={loginMethod === 'email' ? 100 : 12}
                autoComplete={loginMethod === 'email' ? 'email' : 'username'}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  const sanitized = sanitizeInput(e.target.value);
                  setPassword(sanitized);
                }}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                placeholder="Ingresa tu contraseña"
                maxLength={128}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || validationErrors.length > 0 || (remainingAttempts !== null && remainingAttempts === 0)}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <span className="text-indigo-600 font-medium">
                Comunícate con el administrador del sistema.
              </span>
            </p>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Credenciales de prueba:</strong><br />
                RUT: 12345678-9 | Contraseña: test123<br />
                Email: test@nutricion.com | Contraseña: test123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
