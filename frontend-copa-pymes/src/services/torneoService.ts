import { apiClient } from './api';
import { Torneo, ApiResponse, CreateTorneoRequest, Equipo } from '../types';

export const torneosService = {
  getTorneos: async (): Promise<ApiResponse<Torneo[]>> => {
    const response = await apiClient.get<ApiResponse<Torneo[]>>('/torneos');
    return response.data;
  },

  createTorneo: async (torneoData: CreateTorneoRequest): Promise<ApiResponse<Torneo>> => {
    const response = await apiClient.post<ApiResponse<Torneo>>('/torneos', torneoData);
    return response.data;
  },

  getTorneoById: async (id: number): Promise<ApiResponse<Torneo>> => {
    const response = await apiClient.get<ApiResponse<Torneo>>(`/torneos/${id}`);
    return response.data;
  },

  updateTorneo: async (id: number, torneoData: Partial<CreateTorneoRequest>): Promise<ApiResponse<Torneo>> => {
    const response = await apiClient.put<ApiResponse<Torneo>>(`/torneos/${id}`, torneoData);
    return response.data;
  },

  deleteTorneo: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/torneos/${id}`);
    return response.data;
  },

  // Obtener equipos inscritos en el torneo
  getEquiposByTorneo: async (torneoId: number): Promise<ApiResponse<Equipo[]>> => {
    const response = await apiClient.get<ApiResponse<Equipo[]>>(`/torneos/${torneoId}/equipos`);
    return response.data;
  },

  // Obtener equipos disponibles para inscribir
  getEquiposDisponibles: async (torneoId: number): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get<ApiResponse<any[]>>(`/torneos/${torneoId}/equipos-disponibles`);
    return response.data;
  },

  // Agregar equipo al torneo
  agregarEquipoAlTorneo: async (torneoId: number, equipoId: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(`/torneos/${torneoId}/equipos`, { equipoId });
    return response.data;
  },

  // Dar de baja equipo inscrito (elimina la inscripcion)
  darDeBajaEquipoDelTorneo: async (inscripcionId: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete<ApiResponse<any>>(`/inscripciones/${inscripcionId}`);
    return response.data;
  },

  // Generar llave de partidos manualmente
  generarLlave: async (torneoId: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(`/torneos/${torneoId}/generar-llave`);
    return response.data;
  },

  // Regenerar llave de partidos (limpia y crea nuevos)
  regenerarLlave: async (torneoId: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(`/torneos/${torneoId}/regenerar-llave`);
    return response.data;
  },
};
