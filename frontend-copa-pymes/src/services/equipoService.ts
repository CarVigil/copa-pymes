import { apiClient } from './api';
import { Equipo, ApiResponse, CreateEquipoRequest } from '../types';

export const equiposService = {
  getEquipos: async (): Promise<ApiResponse<Equipo[]>> => {
    const response = await apiClient.get<ApiResponse<Equipo[]>>('/equipos');
    return response.data;
  },

  getEquiposActivos: async (): Promise<ApiResponse<Equipo[]>> => {
    const response = await apiClient.get<ApiResponse<Equipo[]>>('/equipos/activos');
    return response.data;
  },

  getEquipoById: async (id: number): Promise<ApiResponse<Equipo>> => {
    const response = await apiClient.get<ApiResponse<Equipo>>(`/equipos/${id}`);
    return response.data;
  },

  createEquipo: async (equipoData: CreateEquipoRequest): Promise<ApiResponse<Equipo>> => {
    const response = await apiClient.post<ApiResponse<Equipo>>('/equipos', equipoData);
    return response.data;
  },

  updateEquipo: async (id: number, equipoData: Partial<CreateEquipoRequest>): Promise<ApiResponse<Equipo>> => {
    const response = await apiClient.put<ApiResponse<Equipo>>(`/equipos/${id}`, equipoData);
    return response.data;
  },

  deleteEquipo: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/equipos/${id}`);
    return response.data;
  },

  reactivateEquipo: async (id: number): Promise<ApiResponse<Equipo>> => {
    const response = await apiClient.patch<ApiResponse<Equipo>>(`/equipos/${id}/reactivate`);
    return response.data;
  },

  deleteEquipoPermanent: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/equipos/${id}/permanent`);
    return response.data;
  },
};
