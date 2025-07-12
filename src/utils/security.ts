// Utilidades de validación y sanitización para prevenir ataques

/**
 * Sanitiza strings para prevenir XSS
 */
export const sanitizeString = (str: string): string => {
  if (!str) return '';
  
  return str
    .replace(/[<>]/g, '') // Remover < y > para prevenir tags HTML
    .replace(/javascript:/gi, '') // Remover javascript: URLs
    .replace(/on\w+=/gi, '') // Remover event handlers (onclick, onload, etc.)
    .trim();
};

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 100;
};

/**
 * Valida formato de RUT chileno (versión simplificada)
 */
export const validateRUT = (rut: string): boolean => {
  if (!rut || typeof rut !== 'string') return false;
  
  // Solo verificar que no esté vacío y tenga al menos 7 caracteres
  const cleanRut = rut.replace(/[\s.-]/g, '');
  
  return cleanRut.length >= 7;
};

/**
 * Formatea un RUT al formato estándar (ej: 12345678-9)
 */
export const formatRUT = (rut: string): string => {
  if (!rut) return '';
  
  // Limpiar RUT
  const cleanRut = rut.replace(/[\s.-]/g, '');
  
  if (cleanRut.length < 8) return cleanRut;
  
  // Extraer número y dígito verificador
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  
  // Formatear con puntos y guión
  let formattedBody = '';
  for (let i = 0; i < body.length; i++) {
    if (i > 0 && (body.length - i) % 3 === 0) {
      formattedBody += '.';
    }
    formattedBody += body[i];
  }
  
  return `${formattedBody}-${dv}`;
};

/**
 * Sanitiza datos de entrada para prevenir inyección de código
 */
export const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return sanitizeString(input);
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
};

/**
 * Valida datos del cliente
 */
export const validateClienteData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }
  
  if (!data.apellido || typeof data.apellido !== 'string' || data.apellido.trim().length < 2) {
    errors.push('El apellido debe tener al menos 2 caracteres');
  }
  
  if (!data.rut || !validateRUT(data.rut)) {
    console.log('Error en RUT:', data.rut, 'validateRUT result:', validateRUT(data.rut));
    errors.push('El RUT no es válido');
  }
  
  if (data.correo && !validateEmail(data.correo)) {
    errors.push('El email no es válido');
  }
  
  if (data.telefono && !/^\+?[\d\s-()]{8,15}$/.test(data.telefono)) {
    errors.push('El teléfono no es válido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Escape HTML para prevenir XSS
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Genera un token CSRF aleatorio
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Rate limiting simple en el cliente
 */
class ClientRateLimit {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) { // 5 intentos en 15 minutos
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Limpiar intentos antiguos
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    return true;
  }

  getRemainingAttempts(identifier: string): number {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxAttempts - recentAttempts.length);
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const loginRateLimit = new ClientRateLimit(5, 15 * 60 * 1000); // 5 intentos en 15 minutos
