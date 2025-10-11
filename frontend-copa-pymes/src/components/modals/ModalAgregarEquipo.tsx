import React, { useEffect, useState } from 'react';
import { Equipo } from '../../types';
import './Modal.css';

interface ModalAgregarEquipoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (equipo: Partial<Equipo>) => Promise<void>;
  isLoading?: boolean;
  equipo?: Equipo | null;
}

export const ModalAgregarEquipo: React.FC<ModalAgregarEquipoProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  equipo,
}) => {
  const [formData, setFormData] = useState<Partial<Equipo>>({
    nombre: '',
    sigla: '',
    escudo: '',
    estado: true,
  });

  useEffect(() => {
    if (equipo) {
      setFormData(equipo);
    } else {
      setFormData({ nombre: '', sigla: '', escudo: '', estado: true });
    }
  }, [equipo]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{equipo ? 'Editar Equipo' : 'Agregar Equipo'}</h2>

        <form onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input name="nombre" value={formData.nombre || ''} onChange={handleChange} required />

          <label>Sigla</label>
          <input name="sigla" value={formData.sigla || ''} onChange={handleChange} required />

          <label>Escudo (URL)</label>
          <input name="escudo" value={formData.escudo || ''} onChange={handleChange} />

          <label>
            <input
              type="checkbox"
              name="estado"
              checked={!!formData.estado}
              onChange={handleChange}
            />
            Activo
          </label>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
