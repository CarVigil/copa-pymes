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
      console.log('🔍 Obteniendo jugadores disponibles (sin equipo)...');
      
      const res = await equipoService.getJugadoresDisponibles();
      console.log('📥 Respuesta de jugadores disponibles:', res);
      
      if (res.success && res.data) {
        console.log(`✅ ${res.data.length} jugadores disponibles encontrados`);
        setJugadoresSinEquipo(res.data);
      } else {
        console.warn('⚠️ No se pudieron cargar jugadores:', res.message);
        alert(res.message || 'No se pudieron cargar los jugadores disponibles');
      }
    } catch (error) {
      console.error('❌ Error al cargar jugadores disponibles:', error);
      alert('Error al cargar la lista de jugadores disponibles');
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
      
      // Si llegamos aquí, fue exitoso
      alert('✅ Jugador agregado al equipo exitosamente');
      
      // Limpiar estado y cerrar modal
      setJugadorSeleccionado(null);
      setSearchTerm('');
      onClose();
    } catch (error: any) {
      console.error('Error al agregar jugador:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al agregar el jugador al equipo';
      alert(`❌ ${errorMessage}`);
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
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px 20px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px dashed #dee2e6'
                    }}>
                      <p style={{ color: '#666', marginBottom: '10px', fontSize: '1.1em' }}>
                        {searchTerm 
                          ? '🔍 No se encontraron jugadores con ese criterio de búsqueda'
                          : '👥 No hay jugadores disponibles sin equipo'}
                      </p>
                      {!searchTerm && (
                        <p style={{ color: '#999', fontSize: '0.9em' }}>
                          Todos los jugadores activos ya están asignados a un equipo
                        </p>
                      )}
                    </div>
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