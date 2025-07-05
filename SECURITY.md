# Documentación de Seguridad - Dashboard de Nutrición

## Medidas de Seguridad Implementadas

### 1. Prevención de Inyección SQL
- **Uso de Supabase**: Todas las consultas utilizan Supabase que maneja automáticamente la prevención de SQL injection.
- **Políticas RLS**: Row Level Security configurado en Supabase para controlar acceso a datos.
- **Validación de datos**: Todas las entradas se validan antes de enviar a la base de datos.

### 2. Protección contra XSS (Cross-Site Scripting)
- **Sanitización automática**: Función `sanitizeInput()` que limpia caracteres peligrosos.
- **Escape HTML**: Función `escapeHtml()` para mostrar datos de usuario de forma segura.
- **Validación en tiempo real**: Monitor de seguridad que detecta intentos de inyección.
- **CSP Headers**: Content Security Policy básico implementado.

### 3. Protección CSRF (Cross-Site Request Forgery)
- **Tokens CSRF**: Generación automática de tokens únicos por sesión.
- **Validación de origen**: Verificación de tokens en formularios sensibles.
- **Regeneración de tokens**: Posibilidad de renovar tokens para administradores.

### 4. Autenticación Robusta (Broken Authentication Prevention)
- **Supabase Auth**: Sistema de autenticación seguro y probado.
- **Timeout de sesión**: Cierre automático por inactividad (30 minutos configurable).
- **Rate limiting**: Limitación de intentos de login (5 intentos por 15 minutos).
- **Validación de sesión**: Verificación continua de integridad de sesión.

### 5. Controles de Acceso
- **Roles de usuario**: Sistema de roles implementado (Nutricionista/Administrador).
- **Rutas protegidas**: ProtectedRoute component para control de acceso.
- **Verificación de permisos**: Validación en frontend y backend.

### 6. Validación y Sanitización de Datos
- **Validación de email**: Regex y límites de longitud.
- **Validación de RUT**: Algoritmo de verificación de dígito verificador.
- **Validación de contraseñas**: Criterios de complejidad configurables.
- **Sanitización universal**: Limpieza automática de todas las entradas.

### 7. Monitoreo de Seguridad
- **Hook useSecurityMonitor**: Detección de actividad sospechosa.
- **Logging de eventos**: Registro de intentos de ataque.
- **Verificación de integridad**: Control de manipulación de datos.

## Archivos de Seguridad

### Utilidades (`src/utils/security.ts`)
- `sanitizeString()`: Limpia caracteres peligrosos
- `validateEmail()`: Valida formato de email
- `validateRUT()`: Valida RUT chileno con dígito verificador
- `sanitizeInput()`: Sanitización recursiva de objetos
- `validateClienteData()`: Validación específica de datos de cliente
- `escapeHtml()`: Escape de caracteres HTML
- `generateCSRFToken()`: Generación de tokens CSRF
- `ClientRateLimit`: Clase para limitación de rate

### Hooks de Seguridad (`src/hooks/useSecurity.ts`)
- `useSessionTimeout()`: Gestión de timeout de sesión
- `useSecurityMonitor()`: Monitoreo de actividad sospechosa
- `useDataIntegrity()`: Verificación de integridad de datos

### Servicios Seguros (`src/services/api/`)
- `authService.ts`: Autenticación con validaciones
- `clientesService.ts`: CRUD de clientes con sanitización
- `medidasService.ts`: Gestión de medidas con controles

## Configuración de Seguridad

### Variables de Entorno
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Configuración de Supabase
1. **Row Level Security (RLS)** habilitado en todas las tablas
2. **Políticas de acceso** configuradas por usuario
3. **Auth settings** con timeout y rate limiting

### Headers de Seguridad
- Content Security Policy básico
- Detección de scripts externos maliciosos

## Uso de Medidas de Seguridad

### En Componentes
```tsx
import { sanitizeInput, validateEmail } from '../utils/security';
import { useSecurityMonitor } from '../hooks/useSecurity';

const MyComponent = () => {
  useSecurityMonitor(); // Monitoreo automático
  
  const handleInput = (value: string) => {
    const clean = sanitizeInput(value);
    // Usar valor limpio
  };
};
```

### En Formularios
```tsx
import { validateClienteData, generateCSRFToken } from '../utils/security';

const FormComponent = () => {
  const [csrfToken] = useState(generateCSRFToken());
  
  const handleSubmit = (data) => {
    const validation = validateClienteData(data);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    // Procesar datos válidos
  };
};
```

## Panel de Administración de Seguridad

Para usuarios con rol **Administrador**, el dashboard incluye:
- Estado de protecciones activas
- Configuración actual de seguridad
- Acciones de seguridad (regenerar tokens, resetear limits)
- Recomendaciones de seguridad

## Recomendaciones Adicionales

### Para Producción
1. **HTTPS obligatorio**: Configurar SSL/TLS
2. **Backup automático**: Implementar respaldos regulares
3. **Monitoreo de logs**: Sistema de alertas por actividad sospechosa
4. **Auditorías regulares**: Revisión periódica de permisos y accesos
5. **Actualizaciones**: Mantener dependencias actualizadas

### Para Desarrollo
1. Usar variables de entorno para credenciales
2. No commitear tokens o claves
3. Probar validaciones con datos maliciosos
4. Revisar logs de seguridad regularmente

## Testing de Seguridad

### Pruebas Recomendadas
1. **XSS**: Intentar inyectar `<script>alert('xss')</script>`
2. **SQL Injection**: Probar con `'; DROP TABLE --`
3. **CSRF**: Peticiones desde dominios externos
4. **Rate Limiting**: Múltiples intentos de login
5. **Session Timeout**: Verificar cierre por inactividad

### Herramientas Sugeridas
- OWASP ZAP para scanning de vulnerabilidades
- Burp Suite para testing manual
- npm audit para vulnerabilidades en dependencias

## Contacto

Para reportar vulnerabilidades de seguridad o consultas:
- Revisar logs en la consola del navegador
- Verificar el panel de administración de seguridad
- Contactar al equipo de desarrollo
