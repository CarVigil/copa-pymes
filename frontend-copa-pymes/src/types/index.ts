export * from './api';
export interface Torneo {
  id: number;
  nombre: string;
  tipo: string;
  modalidad: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  cantidad_divisiones?: number;
  cantidad_equipos?: number;
  estado: 'pendiente' | 'inscripciones_abiertas' | 'activo' | 'finalizado';
}

export interface CreateTorneoRequest {
  nombre: string;
  tipo: string;
  modalidad: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  cantidad_divisiones?: number;
  cantidad_equipos?: number;
  estado?: 'pendiente' | 'inscripciones_abiertas' | 'activo' | 'finalizado';
}

export interface UpdateTorneoRequest {
  nombre: string;
  tipo:string;
  modalidad: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  cantidad_divisiones?: number;
  cantidad_equipos?: number;
  estado?: 'pendiente' | 'inscripciones_abiertas' | 'activo' | 'finalizado';
}