export * from './api';
export interface Torneo {
  id: number;
  nombre: string;
  tipo: string;
  modalidad: string;
  fechaInicio: string | Date;
  fechaFin: string | Date;
  cantidadDivisiones?: number;
  cantidadEquipos?: number;
  estado: 'pendiente' | 'inscripciones_abiertas' | 'activo' | 'finalizado';
}

export interface CreateTorneoRequest {
  nombre: string;
  tipo: string;
  modalidad: string;
  fechaInicio: string;
  fechaFin: string;
  cantidadDivisiones?: number;
  cantidadEquipos?: number;
  estado?: 'pendiente' | 'inscripciones_abiertas' | 'activo' | 'finalizado';
}