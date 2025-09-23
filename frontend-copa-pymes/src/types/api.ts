// Tipos para las respuestas de la API
export interface HealthResponse {
  message: string;
  database: string;
  timestamp: string;
}

export interface Jugador {
  id?: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  fecha_nacimiento: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

export interface CreateJugadorRequest {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  fecha_nacimiento: Date;
}

export interface UpdateJugadorRequest {
  nombre?: string;
  apellido?: string;
  dni?: string;
  email?: string;
  fecha_nacimiento?: Date;
}

export interface Torneo {
  id?: number;
  nombre: string;
  tipo: string;
  modalidad: string;
  fecha_inicio: Date;
  fecha_fin: Date;
}

export interface CreateTorneoRequest {
  nombre: string;
  tipo: string;
  modalidad: string;
  fecha_inicio: Date;
  fecha_fin: Date;
}

export interface UpdateTorneoRequest {
  nombre?: string;
  tipo?: string;
  modalidad?: string;
  fecha_inicio?: Date;
  fecha_fin?: Date;
}



