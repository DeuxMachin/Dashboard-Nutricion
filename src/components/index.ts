// Exportaciones centralizadas de componentes

// Componentes principales
export { default as Dashboard } from './Dashboard.tsx';
export { default as Navbar } from './Navbar.tsx';
export { default as Pacientes } from './Pacientes.tsx';

// Componentes de pacientes
export { DetallePaciente } from './pacientes/DetallePaciente.tsx';

// Componentes de autenticación
export { default as Login } from './auth/Login.tsx';
export { default as ProtectedRoute } from './auth/ProtectedRoute.tsx';

// Componentes UI
export { SecuritySettings } from './ui/SecuritySettings.tsx';

// Componentes de pacientes
export { NuevoPacienteForm } from './pacientes/NuevoPacienteForm.tsx';
