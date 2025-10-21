import { useState, useEffect } from 'react';
import { Jugador, CreateJugadorRequest, UpdateJugadorRequest } from '../types';
import { jugadorService } from '../services/jugadorService';

export const useJugadores = () => {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJugadores = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await jugadorService.getJugadores();
      if (response.success && response.data) {
        setJugadores(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar jugadores');
      console.error('Error fetching jugadores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJugadores();
  }, []);

  const createJugador = async (jugadorData: CreateJugadorRequest) => {
    try {
      const response = await jugadorService.createJugador(jugadorData);
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message || 'Error al crear jugador' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al crear jugador' };
    }
  };

  const updateJugador = async (id: number, jugadorData: UpdateJugadorRequest) => {
    try {
      const response = await jugadorService.updateJugador(id, jugadorData);
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message || 'Error al actualizar jugador' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al actualizar jugador' };
    }
  };

  const deleteJugador = async (id: number) => {
    try {
      const response = await jugadorService.deleteJugador(id);
      if (response.success) {
        return { success: true };
      }
      return { success: false, error: response.message || 'Error al eliminar jugador' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al eliminar jugador' };
    }
  };

  const refetch = async () => {
    await fetchJugadores();
  };

  return {
    jugadores,
    loading,
    error,
    refetch,
    createJugador,
    updateJugador,
    deleteJugador,
  };
};