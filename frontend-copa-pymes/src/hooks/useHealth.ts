import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';

interface HealthStatus {
  status: string;
  timestamp: string;
  version?: string;
}

export const useHealth = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/health');
      setHealth(response.data);
    } catch (err) {
      console.error('Error al obtener el estado del servidor:', err);
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const refetch = useCallback(() => {
    fetchHealth();
  }, [fetchHealth]);

  return {
    health,
    loading,
    error,
    refetch
  };
};
