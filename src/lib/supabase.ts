import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para TypeScriptaa
export interface Nutricionista {
  id_nutri: number;
  nombre: string;
  apellido: string;
  rut: string;
  correo: string;
  telefono?: string;
  especialidad?: string;
  fecha_registro?: string;
}

export interface Cliente {
  id_cliente: number;
  id_nutri: number;
  nombre: string;
  apellido: string;
  rut: string;
  correo?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: 'M' | 'F' | 'Otro';
  inactividad: boolean;
  id_plan?: number;
  progreso: 'Pendiente' | 'Regular' | 'Bueno' | 'Excelente';
  ultimavisita?: string;
  fecha_registro?: string;
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
