import React, { useState } from 'react';
import { Partido } from '../../types';
import './Modal.css';

interface ModalEditarResultadoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (golesEquipo1: number, golesEquipo2: number) => Promise<void>;
  partido: Partido;
}

export const ModalEditarResultado: React.FC<ModalEditarResultadoProps> = ({
  isOpen,
  onClose,
  onSubmit,
  partido,
}) => {
  const [golesEquipo1, setGolesEquipo1] = useState(partido.golesEquipo1 ?? 0);
  const [golesEquipo2, setGolesEquipo2] = useState(partido.golesEquipo2 ?? 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (golesEquipo1 < 0 || golesEquipo2 < 0) {
      setError('Los goles no pueden ser negativos');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(golesEquipo1, golesEquipo2);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al actualizar resultado');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚽ Editar Resultado del Partido</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="partido-info" style={{
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
              {partido.fase?.toUpperCase()} - Partido {partido.numeroPartido}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
              {partido.equipo1?.nombre || 'Por definir'} vs {partido.equipo2?.nombre || 'Por definir'}
            </div>
          </div>

          {error && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr auto 1fr', 
            gap: '1rem',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div className="form-group">
              <label htmlFor="golesEquipo1">
                {partido.equipo1?.nombre || 'Equipo 1'}
              </label>
              <input
                type="number"
                id="golesEquipo1"
                className="form-control"
                value={golesEquipo1}
                onChange={(e) => setGolesEquipo1(parseInt(e.target.value) || 0)}
                min="0"
                required
                disabled={!partido.equipo1}
                style={{ fontSize: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}
              />
            </div>

            <div style={{ fontSize: '2rem', color: '#666', paddingTop: '1.5rem' }}>
              -
            </div>

            <div className="form-group">
              <label htmlFor="golesEquipo2">
                {partido.equipo2?.nombre || 'Equipo 2'}
              </label>
              <input
                type="number"
                id="golesEquipo2"
                className="form-control"
                value={golesEquipo2}
                onChange={(e) => setGolesEquipo2(parseInt(e.target.value) || 0)}
                min="0"
                required
                disabled={!partido.equipo2}
                style={{ fontSize: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}
              />
            </div>
          </div>

          {!partido.equipo1 || !partido.equipo2 ? (
            <div className="warning-message" style={{ marginBottom: '1rem' }}>
              ⚠️ Este partido aún no tiene ambos equipos definidos
            </div>
          ) : null}

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSubmitting || !partido.equipo1 || !partido.equipo2}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Resultado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
