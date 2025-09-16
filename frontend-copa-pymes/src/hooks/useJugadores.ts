import { useState, useEffect } from 'react';
import { jugadorService } from '../services/jugadorService';
import { Jugador, ApiResponse } from '../types';

export const useJugadores = () => {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchJugadores = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await jugadorService.getJugadores();
      if (response.success && response.data) {
        setJugadores(response.data);
      } else {
        setError(response.message || 'Error al cargar jugadores');
      }
    } catch (err) {
      setError('❌ No se pudieron cargar los jugadores');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createJugador = async (jugadorData: any) => {
    try {
      setError('');
      const response = await jugadorService.createJugador(jugadorData);
      if (response.success && response.data) {
        setJugadores(prev => [...prev, response.data!]);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Error al crear jugador');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = 'Error al crear jugador';
      setError(errorMsg);
      console.error('Error:', err);
      return { success: false, error: errorMsg };
    }
  };

  useEffect(() => {
    fetchJugadores();
  }, []);

  return {
    jugadores,
    loading,
    error,
    refetch: fetchJugadores,
    createJugador,
  };
};
