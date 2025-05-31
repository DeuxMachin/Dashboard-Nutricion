# Dashboard de Nutrición

Sistema de gestión para nutricionistas que permite el seguimiento de clientes, medidas y resultados.

## Requisitos previos

- Node.js (v18+)
- MySQL (a través de XAMPP)
- npm o yarn

## Configuración inicial

1. **Clonar el repositorio**

```bash
git clone <url-repositorio>
cd Dashboard
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar la base de datos**

- Inicia XAMPP y asegúrate que los servicios de Apache y MySQL estén funcionando
- Accede a phpMyAdmin (http://localhost/phpmyadmin)
- Crea una nueva base de datos llamada `dashboard_nutricion`
- Importa el archivo SQL `dashboard_nutricion.sql` ubicado en la raíz del proyecto

4. **Configuración del entorno**

Crea un archivo `.env` en la raíz del proyecto:

```
# Configuración de la base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=dashboard_nutricion

# JWT Secret Key
JWT_SECRET=tu_clave_secreta_aqui

# Puerto del servidor
PORT=3001
```

## Ejecución del proyecto

### Modo desarrollo

Para ejecutar tanto el backend como el frontend simultáneamente:

```bash
npm run dev:full
```

Para ejecutar solo el frontend:

```bash
npm run dev
```

Para ejecutar solo el backend:

```bash
npm run server
```

El frontend estará disponible en: http://localhost:5173  
El backend estará disponible en: http://localhost:3001

### Modo producción

```bash
npm run build
npm run preview
```


## Estructura del proyecto

- `/src` - Código fuente del frontend (React + TypeScript)
- `/server.js` - Servidor de backend (Express)
- `/public` - Archivos estáticos
- `/docs` - Documentación adicional

## Tecnologías utilizadas

- Frontend: React, TypeScript, Tailwind CSS, Vite
- Backend: Node.js, Express
- Base de datos: MySQL
- Autenticación: JWT

## Características principales

- Autenticación de usuarios (nutricionistas)
- Gestión de clientes
- Seguimiento de medidas antropométricas
- Generación de reportes
- Dashboard interactivo
