import { apiClient } from "./api";
import { Equipo, Jugador, ApiResponse, CreateEquipoRequest } from "../types";

export const equipoService = {
  getEquipos: async (): Promise<ApiResponse<Equipo[]>> => {
    const response = await apiClient.get<ApiResponse<Equipo[]>>("/equipos");
    return response.data;
  },

  getEquiposActivos: async (): Promise<ApiResponse<Equipo[]>> => {
    const response = await apiClient.get<ApiResponse<Equipo[]>>(
      "/equipos/activos"
    );
    return response.data;
  },

  getEquipoById: async (id: number): Promise<ApiResponse<Equipo>> => {
    const response = await apiClient.get<ApiResponse<Equipo>>(`/equipos/${id}`);
    return response.data;
  },

  createEquipo: async (
    equipoData: CreateEquipoRequest
  ): Promise<ApiResponse<Equipo>> => {
    const response = await apiClient.post<ApiResponse<Equipo>>(
      "/equipos",
      equipoData
    );
    return response.data;
  },

  updateEquipo: async (
    id: number,
    equipoData: Partial<CreateEquipoRequest>
  ): Promise<ApiResponse<Equipo>> => {
    const response = await apiClient.put<ApiResponse<Equipo>>(
      `/equipos/${id}`,
      equipoData
    );
    return response.data;
  },

  deleteEquipo: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/equipos/${id}`
    );
    return response.data;
  },

  reactivateEquipo: async (id: number): Promise<ApiResponse<Equipo>> => {
    const response = await apiClient.patch<ApiResponse<Equipo>>(
      `/equipos/${id}/reactivate`
    );
    return response.data;
  },

  deleteEquipoPermanent: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/equipos/${id}/permanent`
    );
    return response.data;
  },

  // ========== Gestión de Jugadores del Equipo ========== //
  getJugadoresDelEquipo: async (equipoId: number): Promise<ApiResponse<Jugador[]>> => {
    const response = await apiClient.get<ApiResponse<Jugador[]>>(`/equipos/${equipoId}/jugadores`);
    return response.data;
  },
  /**
   * Agrega un jugador existente al equipo
   */
  agregarJugadorAlEquipo: async (
    equipoId: number,
    jugadorId: number
  ): Promise<ApiResponse<Jugador>> => {
    const response = await apiClient.post<ApiResponse<Jugador>>(
      `/equipos/${equipoId}/jugadores`,
      { jugadorId }
    );
    return response.data;
  },

  /**
   * Quita un jugador del equipo (no lo elimina, solo lo desvincula)
   */
  quitarJugadorDelEquipo: async (
    equipoId: number,
    jugadorId: number
  ): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/equipos/${equipoId}/jugadores/${jugadorId}`
    );
    return response.data;
  },

  /**
   * Obtiene jugadores que NO tienen equipo asignado (disponibles para agregar)
   */
  async getJugadoresDisponibles(): Promise<ApiResponse<Jugador[]>> {
    try {
      const response = await apiClient.get<ApiResponse<Jugador[]>>('/equipos/jugadores-disponibles');
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener jugadores disponibles:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message 
      };
    }
  },
};
