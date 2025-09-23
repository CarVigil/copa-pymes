import { useState, useEffect } from "react";
import { torneoService } from "../services/torneoService";
import { Torneo, ApiResponse } from "../types";

export const useTorneos = () => {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

    const fetchTorneos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response: ApiResponse<Torneo[]> = await torneoService.getTorneos();
        if (response.success && response.data) {
        setTorneos(response.data);
      } else {
        setError(response.message || "Error al cargar torneos");
      }
    } catch (err) {
      setError("No se pudieron cargar los torneos");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
    };

    useEffect(() => {
    fetchTorneos();
  }, []);

  return {
    torneos,
    loading,
    error,
    refetch: fetchTorneos,
  };
}