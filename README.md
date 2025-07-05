# Dashboard de Nutrición

Sistema de gestión para nutricionistas que permite el seguimiento de clientes, medidas y resultados. Utiliza Supabase como base de datos y sistema de autenticación.

## Requisitos previos

- Node.js (v18+)
- npm o yarn
- Una cuenta de Supabase (gratuita)

## Configuración inicial

### 1. Clonar el repositorio

```bash
git clone <url-repositorio>
cd Dashboard
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

#### Crear proyecto en Supabase:

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Ve a Settings > API para obtener tus credenciales
4. Copia la URL del proyecto y la clave anónima (anon key)

#### Configurar las tablas:

En el SQL Editor de Supabase, ejecuta el siguiente script para crear las tablas:

```sql
-- Crear tabla nutricionista
CREATE TABLE nutricionista (
  id_nutri SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  rut VARCHAR(12) UNIQUE NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  telefono VARCHAR(15),
  especialidad VARCHAR(100),
  fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Crear tabla login
CREATE TABLE login (
  id_login SERIAL PRIMARY KEY,
  id_nutri INTEGER REFERENCES nutricionista(id_nutri),
  contrasena_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'Nutricionista',
  ultimo_acceso TIMESTAMP,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);

-- Crear tabla cliente
CREATE TABLE cliente (
  id_cliente SERIAL PRIMARY KEY,
  id_nutri INTEGER REFERENCES nutricionista(id_nutri),
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  rut VARCHAR(12) UNIQUE NOT NULL,
  correo VARCHAR(100),
  telefono VARCHAR(15),
  fecha_nacimiento DATE,
  genero CHAR(1) CHECK (genero IN ('M', 'F', 'O')),
  inactividad BOOLEAN DEFAULT FALSE,
  id_plan INTEGER,
  progreso VARCHAR(20) DEFAULT 'Pendiente' CHECK (progreso IN ('Pendiente', 'Regular', 'Bueno', 'Excelente')),
  ultimavisita TIMESTAMP,
  fecha_registro TIMESTAMP DEFAULT NOW()
);

-- Crear tabla plan nutricional
CREATE TABLE plannutricional (
  id_plan SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  calorias_diarias INTEGER,
  duracion_semanas INTEGER,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  activo BOOLEAN DEFAULT TRUE
);

-- Crear tabla consulta
CREATE TABLE consulta (
  id_consulta SERIAL PRIMARY KEY,
  id_cliente INTEGER REFERENCES cliente(id_cliente),
  fecha TIMESTAMP DEFAULT NOW(),
  observaciones TEXT,
  peso_actual DECIMAL(5,2),
  presion_arterial VARCHAR(10),
  estado_animo VARCHAR(50),
  sintomas TEXT,
  proxima_cita TIMESTAMP
);

-- Crear tabla medidas
CREATE TABLE medidas (
  id_medidas SERIAL PRIMARY KEY,
  id_cliente INTEGER REFERENCES cliente(id_cliente),
  peso DECIMAL(5,2),
  altura DECIMAL(5,2),
  edad INTEGER,
  imc DECIMAL(4,2),
  porcentaje_grasa DECIMAL(4,2),
  masa_muscular DECIMAL(5,2),
  cintura DECIMAL(5,2),
  cadera DECIMAL(5,2),
  brazo DECIMAL(5,2),
  fecha TIMESTAMP DEFAULT NOW()
);

-- Crear tabla resultados
CREATE TABLE resultados (
  id_resultados SERIAL PRIMARY KEY,
  id_medidas INTEGER REFERENCES medidas(id_medidas),
  id_nutri INTEGER REFERENCES nutricionista(id_nutri),
  observaciones TEXT,
  recomendaciones TEXT,
  objetivo_peso DECIMAL(5,2),
  objetivo_grasa DECIMAL(4,2),
  fechareporte TIMESTAMP DEFAULT NOW(),
  estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En_progreso', 'Finalizado'))
);

-- Insertar datos de prueba
INSERT INTO nutricionista (nombre, apellido, rut, correo, telefono, especialidad) VALUES
('Juan', 'Pérez', '12345678-9', 'test@nutricion.com', '+56912345678', 'Nutrición Deportiva'),
('María', 'González', '98765432-1', 'maria@nutricion.com', '+56987654321', 'Nutrición Clínica');

INSERT INTO login (id_nutri, contrasena_hash, rol) VALUES
(1, 'test123', 'Nutricionista'),
(2, 'admin123', 'Admin');

INSERT INTO cliente (id_nutri, nombre, apellido, rut, correo, telefono, progreso) VALUES
(1, 'Ana', 'Martínez', '11111111-1', 'ana@email.com', '+56911111111', 'Bueno'),
(1, 'Carlos', 'López', '22222222-2', 'carlos@email.com', '+56922222222', 'Regular'),
(1, 'Sofía', 'Rodríguez', '33333333-3', 'sofia@email.com', '+56933333333', 'Excelente');
```

### 4. Configuración del entorno

Crea un archivo `.env` en la raíz del proyecto con tus credenciales de Supabase:

```env
# Configuración de Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Para desarrollo local (opcional)
VITE_APP_ENV=development
```

**⚠️ Importante:** Reemplaza `https://tu-proyecto.supabase.co` y `tu_anon_key_aqui` con tus credenciales reales de Supabase.

## Ejecución del proyecto

### Modo desarrollo

```bash
npm run dev
```

El frontend estará disponible en: http://localhost:5173

### Modo producción

```bash
npm run build
npm run preview
```


## Estructura del proyecto

- `/src` - Código fuente del frontend (React + TypeScript)
  - `/api` - Funciones de API para comunicación con Supabase
  - `/components` - Componentes React (Login, Dashboard, Pacientes, etc.)
  - `/contexts` - Contextos de React (AuthContext)
  - `/lib` - Configuración de Supabase y tipos TypeScript
- `/public` - Archivos estáticos
- `/docs` - Documentación adicional

## Tecnologías utilizadas

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Base de datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth + token local para compatibilidad
- **Estado:** React Context API
- **Estilos:** Tailwind CSS

## Características principales

- **Autenticación dual:** Login con email (Supabase Auth) o RUT (tradicional)
- **Gestión de clientes:** CRUD completo con paginación tipo carrusel
- **Seguimiento de medidas:** Registro de medidas antropométricas con cálculo automático de IMC
- **Consultas médicas:** Registro de observaciones y seguimiento
- **Dashboard interactivo:** Vista general con estadísticas
- **Responsive:** Adaptado para desktop y mobile
- **Real-time:** Actualizaciones en tiempo real con Supabase
- **🔒 Seguridad robusta:** Implementación completa de medidas de seguridad

## 🔒 Medidas de Seguridad Implementadas

Este dashboard implementa múltiples capas de seguridad para proteger los datos de pacientes y garantizar la confidencialidad médica:

### Protecciones Activas
- ✅ **Prevención SQL Injection:** Uso de Supabase con RLS y validación de datos
- ✅ **Protección XSS:** Sanitización automática y escape HTML
- ✅ **Tokens CSRF:** Generación y validación de tokens únicos
- ✅ **Autenticación robusta:** Sistema dual con timeout de sesión
- ✅ **Rate Limiting:** Protección contra ataques de fuerza bruta
- ✅ **Validación de datos:** Verificación completa de entradas
- ✅ **Monitoreo de seguridad:** Detección de actividad sospechosa

### Panel de Administración de Seguridad
Los usuarios administradores tienen acceso a:
- Estado actual de protecciones
- Configuración de tokens CSRF
- Control de rate limiting
- Recomendaciones de seguridad

📋 **Ver documentación completa:** [SECURITY.md](./SECURITY.md)

## Credenciales de prueba

### Login con RUT:
- **RUT:** 12345678-9
- **Contraseña:** test123

### Login con Email:
- **Email:** test@nutricion.com
- **Contraseña:** test123

## Estructura de la base de datos

El sistema utiliza las siguientes tablas principales:

- **nutricionista:** Datos de los profesionales
- **login:** Credenciales y roles de acceso
- **cliente:** Información de los pacientes
- **plannutricional:** Planes alimentarios
- **consulta:** Registro de consultas médicas
- **medidas:** Medidas antropométricas
- **resultados:** Informes y resultados

## Troubleshooting

### Error de conexión a Supabase
1. Verifica que las variables de entorno estén correctamente configuradas
2. Asegúrate de que tu proyecto de Supabase esté activo
3. Revisa que las credenciales sean correctas

### Problemas con las tablas
1. Verifica que hayas ejecutado el script SQL completo
2. Asegúrate de que las políticas RLS estén configuradas correctamente
3. Revisa los logs en el dashboard de Supabase

### Error al instalar dependencias
```bash
# Limpiar caché y reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.
