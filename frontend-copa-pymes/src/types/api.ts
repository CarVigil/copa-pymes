// Tipos para las respuestas de la API
export interface HealthResponse {
  message: string;
  database: string;
  timestamp: string;
}

// Interfaz completa del Jugador (hereda de Usuario)
export interface Jugador {
  id?: number;
  // Campos de Usuario
  email: string;
  password?: string; // Agregado para permitir el manejo en el frontend
  nombre: string;
  apellido: string;
  role?: string; // 'jugador'
  activo: boolean;
  ultimo_login?: Date;
  documento?: string; // Antes era 'dni'
  telefono?: string;
  fecha_nacimiento?: Date; // Opcional
  // Campos específicos de Jugador
  posicion?: string;
  numero_camiseta?: number; // Cambié de 0 a number opcional
  equipo?: Equipo; // Relación con Equipo
  // Timestamps heredados de BaseModel
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

export interface CreateJugadorRequest {
  // Campos requeridos
  email: string;
  password: string; // Requerido al crear
  nombre: string;
  apellido: string;
  // Campos opcionales
  documento?: string; // Cambié de 'dni'
  telefono?: string;
  fecha_nacimiento?: Date;
  posicion?: string;
  numero_camiseta?: number;
  activo?: boolean; // Default true en el backend
}

export interface UpdateJugadorRequest {
  // Todos opcionales al editar
  email?: string;
  password?: string; // Solo si se quiere cambiar
  nombre?: string;
  apellido?: string;
  documento?: string; // Cambié de 'dni'
  telefono?: string;
  fecha_nacimiento?: Date;
  posicion?: string;
  numero_camiseta?: number;
  activo?: boolean;
}

// Tipo para datos del formulario (usado en el modal)
export interface JugadorFormData {
  id?: number;
  email: string;
  password?: string;
  nombre: string;
  apellido: string;
  documento?: string;
  telefono?: string;
  fecha_nacimiento?: Date | string; // Puede ser Date o string del input
  posicion?: string;
  numero_camiseta?: number;
  activo: boolean;
}

export interface Torneo {
  id?: number;
  nombre: string;
  tipo: string;
  modalidad: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  cantidad_divisiones: number;
  cantidad_equipos: number;
  estado: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateTorneoRequest {
  nombre: string;
  tipo: string;
  modalidad: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  cantidad_divisiones: number;
  cantidad_equipos: number;
  estado: string;
}

export interface UpdateTorneoRequest {
  nombre?: string;
  tipo?: string;
  modalidad?: string;
  fecha_inicio?: Date;
  fecha_fin?: Date;
  cantidad_divisiones?: number; // Debería ser opcional
  cantidad_equipos?: number; // Debería ser opcional
  estado?: string; // Debería ser opcional
}

export interface Equipo {
  id?: number;
  nombre: string;
  sigla: string;
  estado: boolean;
  escudo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateEquipoRequest {
  nombre: string;
  sigla: string;
  estado?: boolean;
  escudo?: string;
}

export interface UpdateEquipoRequest {
  nombre?: string;
  sigla?: string;
  estado?: boolean;
  escudo?: string;
}

export interface Partido {
  id: number;
  fecha?: Date;
  equipo1?: Equipo;
  equipo2?: Equipo;
  golesEquipo1?: number;
  golesEquipo2?: number;
  estado: 'pendiente' | 'en_juego' | 'finalizado' | 'suspendido';
  fase?: string;
  numeroPartido?: number;
  equipoGanador?: number;
  posicionEnSiguiente?: number;
}

// Tipos adicionales para otros roles de Usuario (por si los necesitas)
export interface Usuario {
  id?: number;
  email: string;
  nombre: string;
  apellido: string;
  role: 'administrador' | 'gestor' | 'recepcionista' | 'arbitro' | 'jugador';
  activo: boolean;
  ultimo_login?: Date;
  documento?: string;
  telefono?: string;
  fecha_nacimiento?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Administrador extends Usuario {
  role: 'administrador';
  nivel_acceso?: string;
}

export interface Gestor extends Usuario {
  role: 'gestor';
  departamento?: string;
}

export interface Recepcionista extends Usuario {
  role: 'recepcionista';
  turno?: string;
}

export interface Arbitro extends Usuario {
  role: 'arbitro';
  categoria?: string;
  numero_licencia?: string;
  especialidad?: string;
}