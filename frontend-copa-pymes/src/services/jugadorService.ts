import { apiClient } from './api';
import { Jugador, ApiResponse, CreateJugadorRequest } from '../types';

export const jugadorService = {
  getJugadores: async (): Promise<ApiResponse<Jugador[]>> => {
    const response = await apiClient.get<ApiResponse<Jugador[]>>('/jugadores');
    return response.data;
  },
  createJugador: async (jugadorData: CreateJugadorRequest): Promise<ApiResponse<Jugador>> => {
    const response = await apiClient.post<ApiResponse<Jugador>>('/jugadores', jugadorData);
    return response.data;
  },
  getJugadorById: async (id: number): Promise<ApiResponse<Jugador>> => {
    const response = await apiClient.get<ApiResponse<Jugador>>(`/jugadores/${id}`);
    return response.data;
  },
  updateJugador: async (id: number, jugadorData: Partial<CreateJugadorRequest>): Promise<ApiResponse<Jugador>> => {
    const response = await apiClient.put<ApiResponse<Jugador>>(`/jugadores/${id}`, jugadorData);
    return response.data;
  },
  deleteJugador: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/jugadores/${id}`);
    return response.data;
  },
};
