import { apiClient } from './api';
import { Partido, ApiResponse } from '../types';

export const partidoService = {
  getPartidosByTorneo: async (torneoId: number): Promise<ApiResponse<Partido[]>> => {
    const response = await apiClient.get<ApiResponse<Partido[]>>(`/torneos/${torneoId}/partidos`);
    return response.data;
  },

  actualizarResultado: async (
    partidoId: number, 
    golesEquipo1: number, 
    golesEquipo2: number
  ): Promise<ApiResponse<Partido>> => {
    const response = await apiClient.put<ApiResponse<Partido>>(
      `/partidos/${partidoId}/resultado`,
      { golesEquipo1, golesEquipo2 }
    );
    return response.data;
  },
};
