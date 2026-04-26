import React, { useEffect, useState } from 'react';
import { Equipo } from '../../types';
import './Modal.css';

interface ModalAgregarEquipoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (equipo: Partial<Equipo>) => Promise<void>;
  isLoading?: boolean;
  equipo?: Equipo | null;
  errorMessage?: string;
}

export const ModalAgregarEquipo: React.FC<ModalAgregarEquipoProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  equipo,
  errorMessage,
}) => {
  const [formData, setFormData] = useState<Partial<Equipo>>({
    nombre: '',
    sigla: '',
    escudo: '',
    estado: true,
  });
  const [previewEscudo, setPreviewEscudo] = useState<string>('');

  useEffect(() => {
    if (equipo) {
      setFormData(equipo);
      setPreviewEscudo(equipo.escudo || '');
    } else {
      setFormData({ nombre: '', sigla: '', escudo: '', estado: true });
      setPreviewEscudo('');
    }
  }, [equipo, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          escudo: base64String,
        }));
        setPreviewEscudo(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{equipo ? 'Editar Equipo' : 'Agregar Equipo'}</h2>
          <button 
            type="button"
            className="modal-close" 
            onClick={onClose}
            disabled={isLoading}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {errorMessage && <div className="form-error">{errorMessage}</div>}
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input 
              id="nombre"
              name="nombre" 
              value={formData.nombre || ''} 
              onChange={handleChange} 
              disabled={isLoading}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="sigla">Sigla</label>
            <input 
              id="sigla"
              name="sigla" 
              value={formData.sigla || ''} 
              onChange={handleChange} 
              disabled={isLoading}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="escudo">Escudo (Imagen)</label>
            <div className="file-input-wrapper">
              <input 
                id="escudo"
                name="escudo" 
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              {previewEscudo && (
                <div className="preview-container">
                  <img src={previewEscudo} alt="Preview escudo" className="preview-image" />
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="estado">
              <input
                id="estado"
                type="checkbox"
                name="estado"
                checked={!!formData.estado}
                onChange={handleChange}
                disabled={isLoading}
              />
              Activo
            </label>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-success" 
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
