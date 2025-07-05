// Interfaces principales de la aplicación

export interface Nutricionista {
  id_nutri: number;
  nombre: string;
  apellido: string;
  rut: string;
  correo: string;
  telefono?: string;
  especialidad?: string;
}

export interface Cliente {
  id_cliente: number;
  id_nutri: number;
  nombre: string;
  apellido: string;
  rut: string;
  correo?: string;
  inactividad: boolean;
  id_plan?: number;
  progreso: 'Pendiente' | 'Regular' | 'Bueno' | 'Excelente';
  ultimavisita?: string;
}

export interface Login {
  id_login: number;
  id_nutri: number;
  contrasena_hash: string;
  rol: 'Nutricionista' | 'Admin';
  ultimo_acceso?: string;
  fecha_creacion?: string;
}

export interface PlanNutricional {
  id_plan: number;
  nombre: string;
  descripcion?: string;
  calorias_diarias?: number;
  duracion_semanas?: number;
  fecha_creacion?: string;
  activo: boolean;
}

export interface Consulta {
  id_consulta: number;
  id_cliente: number;
  fecha: string;
  observaciones?: string;
  peso_actual?: number;
  presion_arterial?: string;
  estado_animo?: string;
  sintomas?: string;
  proxima_cita?: string;
}

export interface Medidas {
  id_medidas: number;
  id_cliente: number;
  peso?: number;
  altura?: number;
  edad?: number;
  imc?: number;
  porcentaje_grasa?: number;
  masa_muscular?: number;
  cintura?: number;
  cadera?: number;
  brazo?: number;
  fecha: string;
}

export interface Resultados {
  id_resultados: number;
  id_medidas: number;
  id_nutri: number;
  observaciones?: string;
  recomendaciones?: string;
  objetivo_peso?: number;
  objetivo_grasa?: number;
  fechareporte?: string;
  estado: 'Pendiente' | 'En_progreso' | 'Finalizado';
}

// Tipos para autenticación
export interface User {
  id: number;
  username?: string;
  email: string;
  nombre: string;
  apellido: string;
  role: string;
  rut?: string;
  supabase_id?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user: User;
  session?: any;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
