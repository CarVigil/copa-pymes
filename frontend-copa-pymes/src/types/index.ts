// Índice de todos los tipos
export * from './api';
export interface Torneo {
  id: number;
  nombre: string;
  tipo: string;
  modalidad: string;
  fecha_inicio: string | Date;
  fecha_fin: string | Date;
}

export interface CreateTorneoRequest {
  nombre: string;
  tipo: string;
  modalidad: string;
  fecha_inicio: string;
  fecha_fin: string;
}