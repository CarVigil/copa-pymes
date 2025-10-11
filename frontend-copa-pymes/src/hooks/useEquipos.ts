import { useState, useEffect } from "react";
import { apiClient } from "../services/api";
import { Equipo } from "../types";

export const useEquipos = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/equipos");
      console.log("✓ Equipos cargados:", response.data);
      setEquipos(response.data.data || response.data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Error al cargar equipos";
      console.error("✗ Error:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const crearEquipo = async (equipo: Omit<Equipo, "id">) => {
    setIsCreating(true);
    setError(null);
    try {
      console.log("📤 Enviando nuevo equipo:", equipo);
      const response = await apiClient.post("/equipos", equipo);
      console.log("✓ Equipo creado:", response.data);
      await refetch();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Error al crear equipo";
      console.error("✗ Error:", errorMsg);
      setError(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const actualizarEquipo = async (id: number, data: Partial<Equipo>) => {
    setError(null);
    try {
      console.log("📤 Actualizando equipo:", id, data);
      const response = await apiClient.put(`/equipos/${id}`, data);
      console.log("✓ Equipo actualizado:", response.data);
      await refetch();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Error al actualizar equipo";
      console.error("✗ Error:", errorMsg);
      setError(errorMsg);
    }
  };

  const eliminarEquipo = async (id: number) => {
    setError(null);
    try {
      console.log("📤 Eliminando equipo:", id);
      const response = await apiClient.delete(`/equipos/${id}`);
      console.log("✓ Equipo eliminado:", response.data);
      await refetch();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Error al eliminar equipo";
      console.error("✗ Error:", errorMsg);
      setError(errorMsg);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    equipos,
    loading,
    error,
    refetch,
    crearEquipo,
    actualizarEquipo,
    eliminarEquipo,
    isCreating,
  };
};