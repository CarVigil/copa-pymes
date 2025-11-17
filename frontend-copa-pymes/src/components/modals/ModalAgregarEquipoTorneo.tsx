import React, { useState, useEffect } from 'react';
import { torneosService } from '../../services/torneoService';

interface ModalAgregarEquipoTorneoProps {
  torneoId: number;
  onClose: () => void;
  onSubmit: (equipoId: number) => Promise<void>;
}

interface EquipoDisponible {
  id: number;
  nombre: string;
  jugadoresCount: number;
  cumpleRequisito: boolean;
}

const ModalAgregarEquipoTorneo: React.FC<ModalAgregarEquipoTorneoProps> = ({
  torneoId,
  onClose,
  onSubmit,
}) => {
  const [equiposDisponibles, setEquiposDisponibles] = useState<EquipoDisponible[]>([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchEquiposDisponibles();
  }, [torneoId]);

  const fetchEquiposDisponibles = async () => {
    try {
      setLoading(true);
      const response = await torneosService.getEquiposDisponibles(torneoId);
      if (response.success && response.data) {
        setEquiposDisponibles(response.data);
      } else {
        setError(response.message || 'Error al cargar equipos disponibles');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar equipos disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!equipoSeleccionado) {
      setError('Debe seleccionar un equipo');
      return;
    }

    const equipoElegido = equiposDisponibles.find(e => e.id === equipoSeleccionado);
    if (equipoElegido && !equipoElegido.cumpleRequisito) {
      setError('El equipo seleccionado no cumple con el requisito mínimo de 14 jugadores');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(equipoSeleccionado);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al agregar equipo');
    } finally {
      setLoading(false);
    }
  };

  const equiposValidos = equiposDisponibles.filter(e => e.cumpleRequisito);
  const equiposInvalidos = equiposDisponibles.filter(e => !e.cumpleRequisito);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Agregar Equipo al Torneo</h2>

        {loading && <p className="loading-text">Cargando...</p>}

        {error && <div className="error-message">{error}</div>}

        {success && (
          <div className="success-message">
            ✅ Equipo agregado al torneo exitosamente
          </div>
        )}

        {!loading && !success && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="equipo">Seleccionar Equipo *</label>
              
              {equiposValidos.length === 0 && equiposInvalidos.length === 0 && (
                <p className="info-message">
                  No hay equipos disponibles para agregar a este torneo
                </p>
              )}

              {equiposValidos.length > 0 && (
                <>
                  <label className="section-label">Equipos disponibles ({equiposValidos.length})</label>
                  <select
                    id="equipo"
                    value={equipoSeleccionado || ''}
                    onChange={(e) => setEquipoSeleccionado(Number(e.target.value))}
                    required
                    className="form-control"
                  >
                    <option value="">-- Seleccione un equipo --</option>
                    {equiposValidos.map((equipo) => (
                      <option key={equipo.id} value={equipo.id}>
                        {equipo.nombre} ({equipo.jugadoresCount} jugadores) ✓
                      </option>
                    ))}
                  </select>
                </>
              )}

              {equiposInvalidos.length > 0 && (
                <>
                  <label className="section-label warning-label">
                    Equipos con menos de 14 jugadores ({equiposInvalidos.length})
                  </label>
                  <select disabled className="form-control disabled-select">
                    <option value="">-- No disponibles --</option>
                    {equiposInvalidos.map((equipo) => (
                      <option key={equipo.id} value={equipo.id}>
                        {equipo.nombre} ({equipo.jugadoresCount} jugadores) ✗
                      </option>
                    ))}
                  </select>
                  <small className="warning-text">
                    ⚠️ Estos equipos necesitan al menos 14 jugadores para participar
                  </small>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !equipoSeleccionado || equiposValidos.length === 0}
              >
                {loading ? 'Agregando...' : 'Agregar Equipo'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModalAgregarEquipoTorneo;
