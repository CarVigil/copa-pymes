import { apiClient } from "./api";
import { Torneo, ApiResponse, CreateTorneoRequest } from "../types";

export const torneoService = {
  getTorneos: async (): Promise<ApiResponse<Torneo[]>> => {
    const response = await apiClient.get<ApiResponse<Torneo[]>>("/torneos");
    return response.data;
  },
  createTorneo: async (
    torneoData: CreateTorneoRequest
  ): Promise<ApiResponse<Torneo>> => {
    const response = await apiClient.post<ApiResponse<Torneo>>(
      "/torneos",
      torneoData
    );
    return response.data;
  },
  getTorneoById: async (id: number): Promise<ApiResponse<Torneo>> => {
    const response = await apiClient.get<ApiResponse<Torneo>>(`/torneos/${id}`);
    return response.data;
  },
  updateTorneo: async (
    id: number,
    torneoData: Partial<CreateTorneoRequest>
  ): Promise<ApiResponse<Torneo>> => {
    const response = await apiClient.put<ApiResponse<Torneo>>(
      `/torneos/${id}`,
      torneoData
    );
    return response.data;
  },
  deleteTorneo: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(
      `/torneos/${id}`
    );
    return response.data;
  },
};
