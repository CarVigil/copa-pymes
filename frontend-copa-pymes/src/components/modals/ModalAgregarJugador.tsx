import React, { useEffect, useState } from 'react';

interface JugadorFormData {
  id?: number;
  email: string;
  password?: string;
  nombre: string;
  apellido: string;
  documento?: string;
  telefono?: string;
  fecha_nacimiento?: Date | string;
  posicion?: string;
  numero_camiseta?: number;
  activo: boolean;
}

interface Jugador {
  id?: number;
  email: string;
  password?: string;
  nombre: string;
  apellido: string;
  activo: boolean;
  documento?: string;
  telefono?: string;
  fecha_nacimiento?: Date | string;
  posicion?: string;
  numero_camiseta?: number;
  equipo?: any;
}

interface ModalAgregarJugadorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jugador: JugadorFormData) => Promise<void>;
  isLoading?: boolean;
  jugador?: Jugador | null;
}

export const ModalAgregarJugador: React.FC<ModalAgregarJugadorProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  jugador,
}) => {
  // Usamos un tipo específico para el formulario donde fecha_nacimiento es siempre string
  const [formData, setFormData] = useState<{
    nombre: string;
    apellido: string;
    email: string;
    password?: string;
    documento?: string;
    telefono?: string;
    fecha_nacimiento?: string; // Siempre string en el form
    posicion?: string;
    numero_camiseta?: number;
    activo: boolean;
  }>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    documento: '',
    telefono: '',
    fecha_nacimiento: '',
    posicion: '',
    numero_camiseta: undefined,
    activo: true,
  });

  useEffect(() => {
    if (jugador) {
      // Convertir fecha a string en formato YYYY-MM-DD para el input
      const fechaStr = jugador.fecha_nacimiento 
        ? (jugador.fecha_nacimiento instanceof Date 
          ? jugador.fecha_nacimiento.toISOString().split('T')[0]
          : new Date(jugador.fecha_nacimiento).toISOString().split('T')[0])
        : '';
      
      setFormData({
        ...jugador,
        password: '', // No mostramos la contraseña al editar
        fecha_nacimiento: fechaStr,
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        documento: '',
        telefono: '',
        fecha_nacimiento: '',
        posicion: '',
        numero_camiseta: undefined,
        activo: true,
      });
    }
  }, [jugador, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : type === 'number' 
        ? (value === '' ? undefined : Number(value))
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar datos para enviar, convirtiendo fecha de string a Date si existe
    const dataToSubmit: JugadorFormData = {
      email: formData.email,
      nombre: formData.nombre,
      apellido: formData.apellido,
      activo: formData.activo,
      documento: formData.documento,
      telefono: formData.telefono,
      posicion: formData.posicion,
      numero_camiseta: formData.numero_camiseta,
      fecha_nacimiento: formData.fecha_nacimiento 
        ? new Date(formData.fecha_nacimiento) 
        : undefined,
      password: formData.password || undefined,
    };
    
    await onSubmit(dataToSubmit);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
            {jugador ? 'Editar Jugador' : 'Agregar Jugador'}
          </h2>
          <button 
            type="button"
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
            }}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Nombre *
              </label>
              <input 
                id="nombre"
                name="nombre" 
                value={formData.nombre || ''} 
                onChange={handleChange} 
                disabled={isLoading}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              />
            </div>

            {/* Apellido */}
            <div>
              <label htmlFor="apellido" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Apellido *
              </label>
              <input 
                id="apellido"
                name="apellido" 
                value={formData.apellido || ''} 
                onChange={handleChange} 
                disabled={isLoading}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Email *
              </label>
              <input 
                id="email"
                name="email"
                type="email"
                value={formData.email || ''} 
                onChange={handleChange} 
                disabled={isLoading}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Contraseña {!jugador && '*'}
              </label>
              <input 
                id="password"
                name="password"
                type="password"
                value={formData.password || ''} 
                onChange={handleChange} 
                disabled={isLoading}
                required={!jugador}
                placeholder={jugador ? 'Dejar vacío para no cambiar' : ''}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              />
            </div>

            {/* Documento */}
            <div>
              <label htmlFor="documento" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Documento
              </label>
              <input 
                id="documento"
                name="documento"
                value={formData.documento || ''} 
                onChange={handleChange} 
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              />
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Teléfono
              </label>
              <input 
                id="telefono"
                name="telefono"
                value={formData.telefono || ''} 
                onChange={handleChange} 
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              />
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label htmlFor="fecha_nacimiento" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Fecha de Nacimiento
              </label>
              <input 
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento || ''} 
                onChange={handleChange} 
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              />
            </div>

            {/* Posición */}
            <div>
              <label htmlFor="posicion" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Posición
              </label>
              <input 
                id="posicion"
                name="posicion"
                value={formData.posicion || ''} 
                onChange={handleChange} 
                disabled={isLoading}
                placeholder="ej: Delantero, Defensa, etc."
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              />
            </div>

            {/* Número de Camiseta */}
            <div>
              <label htmlFor="numero_camiseta" style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Número de Camiseta
              </label>
              <input 
                id="numero_camiseta"
                name="numero_camiseta"
                type="number"
                min="0"
                max="99"
                value={formData.numero_camiseta || ''} 
                onChange={handleChange} 
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>

          {/* Activo */}
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                id="activo"
                type="checkbox"
                name="activo"
                checked={!!formData.activo}
                onChange={handleChange}
                disabled={isLoading}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: '500' }}>Jugador Activo</span>
            </label>
          </div>

          {/* Botones */}
          <div style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
          }}>
            <button 
              type="button" 
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#10b981',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAgregarJugador;