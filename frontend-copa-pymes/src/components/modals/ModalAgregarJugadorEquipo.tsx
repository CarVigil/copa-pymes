import React, { useState, useEffect } from 'react';
import { Jugador } from '../../types';
import '../modals/Modal.css';
import { equipoService } from '../../services/equipoService';

interface ModalAgregarJugadorEquipoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jugadorId: number) => Promise<void>;
  equipoId: number;
}

export const ModalAgregarJugadorEquipo: React.FC<ModalAgregarJugadorEquipoProps> = ({
  isOpen,
  onClose,
  onSubmit,
  equipoId,
}) => {
  const [jugadoresSinEquipo, setJugadoresSinEquipo] = useState<Jugador[]>([]);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchJugadoresSinEquipo();
    }
  }, [isOpen]);

  const fetchJugadoresSinEquipo = async () => {
  try {
    setLoading(true);
    const res = await equipoService.getJugadoresDisponibles(equipoId);
    console.log(res);
    if (res.success && res.data) {
      setJugadoresSinEquipo(res.data);
    } else {
      alert(res.message || 'No se pudieron cargar los jugadores');
    }
  } catch (error) {
    console.error('Error al cargar jugadores:', error);
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jugadorSeleccionado) {
      alert('Debes seleccionar un jugador');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(jugadorSeleccionado);
      setJugadorSeleccionado(null);
      setSearchTerm('');
    } catch (error) {
      console.error('Error al agregar jugador:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setJugadorSeleccionado(null);
    setSearchTerm('');
    onClose();
  };

  const jugadoresFiltrados = jugadoresSinEquipo.filter(jugador => {
    const nombreCompleto = `${jugador.nombre} ${jugador.apellido}`.toLowerCase();
    const documento = jugador.documento?.toLowerCase() || '';
    const email = jugador.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return nombreCompleto.includes(search) || 
           documento.includes(search) || 
           email.includes(search);
  });

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Agregar Jugador al Equipo</h2>
          <button className="modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
            {loading ? (
              <p>Cargando jugadores disponibles...</p>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="search">🔍 Buscar Jugador</label>
                  <input
                    type="text"
                    id="search"
                    className="form-control"
                    placeholder="Buscar por nombre, documento o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Selecciona un Jugador</label>
                  {jugadoresFiltrados.length > 0 ? (
                    <div className="jugadores-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {jugadoresFiltrados.map((jugador) => (
                        <div
                          key={jugador.id}
                          className={`jugador-item ${jugadorSeleccionado === jugador.id ? 'selected' : ''}`}
                          onClick={() => setJugadorSeleccionado(jugador.id!)}
                          style={{
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            marginBottom: '8px',
                            cursor: 'pointer',
                            backgroundColor: jugadorSeleccionado === jugador.id ? '#e3f2fd' : 'white',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong>{jugador.nombre} {jugador.apellido}</strong>
                              <div style={{ fontSize: '0.9em', color: '#666' }}>
                                {jugador.documento && `DNI: ${jugador.documento} | `}
                                {jugador.email}
                              </div>
                              {jugador.posicion && (
                                <div style={{ fontSize: '0.85em', color: '#888' }}>
                                  Posición: {jugador.posicion}
                                  {jugador.numero_camiseta && ` | Nº ${jugador.numero_camiseta}`}
                                </div>
                              )}
                            </div>
                            {jugadorSeleccionado === jugador.id && (
                              <span style={{ color: '#2196f3', fontSize: '1.2em' }}>✓</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
                      {searchTerm 
                        ? 'No se encontraron jugadores con ese criterio de búsqueda'
                        : 'No hay jugadores disponibles sin equipo'}
                    </p>
                  )}
                </div>
              </>
            )}

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={isSubmitting || !jugadorSeleccionado || loading}
            >
              {isSubmitting ? 'Agregando...' : 'Agregar al Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};