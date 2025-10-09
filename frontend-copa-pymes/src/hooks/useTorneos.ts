// hooks/useTorneos.ts
import { useState, useEffect, useCallback } from 'react';
import { torneosService } from '../services/torneoService';
import { Torneo, CreateTorneoRequest } from '../types';

interface UseTorneosReturn {
  torneos: Torneo[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  crearTorneo: (datos: CreateTorneoRequest) => Promise<Torneo>;
  actualizarTorneo: (id: number, datos: Partial<CreateTorneoRequest>) => Promise<Torneo>;
  eliminarTorneo: (id: number) => Promise<void>;
  isCreating: boolean;
}

export const useTorneos = (): UseTorneosReturn => {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await torneosService.getTorneos();
      
      if (response.success && response.data) {
        setTorneos(response.data);
      } else {
        setError(response.message || 'Error al obtener torneos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar torneos al montar el componente
  useEffect(() => {
    refetch();
  }, [refetch]);

  const crearTorneo = useCallback(async (datos: CreateTorneoRequest): Promise<Torneo> => {
    try {
      setIsCreating(true);
      setError(null);
      const response = await torneosService.createTorneo(datos);
      
      if (response.success && response.data) {
        const nuevoTorneo = response.data as Torneo;
        setTorneos((prev) => [...prev, nuevoTorneo]);
        return nuevoTorneo;
      } else {
        throw new Error(response.message || 'Error al crear torneo');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const actualizarTorneo = useCallback(async (id: number, datos: Partial<CreateTorneoRequest>): Promise<Torneo> => {
    try {
      setError(null);
      const response = await torneosService.updateTorneo(id, datos);
      
      if (response.success && response.data) {
        const torneoActualizado = response.data as Torneo;
        setTorneos((prev) =>
          prev.map((t) => (t.id === id ? torneoActualizado : t))
        );
        return torneoActualizado;
      } else {
        throw new Error(response.message || 'Error al actualizar torneo');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      throw err;
    }
  }, []);

  const eliminarTorneo = useCallback(async (id: number): Promise<void> => {
    try {
      setError(null);
      const response = await torneosService.deleteTorneo(id);
      
      if (response.success) {
        setTorneos((prev) => prev.filter((t) => t.id !== id));
      } else {
        throw new Error(response.message || 'Error al eliminar torneo');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMsg);
      throw err;
    }
  }, []);

  return {
    torneos,
    loading,
    error,
    refetch,
    crearTorneo,
    actualizarTorneo,
    eliminarTorneo,
    isCreating,
  };
};