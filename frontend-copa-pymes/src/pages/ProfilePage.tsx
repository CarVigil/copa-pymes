import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import './ProfilePage.css';
import { UpdateProfileRequest } from '../types/auth';

const ProfilePage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Estado para cambio de contraseña
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Estado del formulario de perfil
    const [formData, setFormData] = useState({
        nombre: user?.nombre || '',
        apellido: user?.apellido || '',
        documento: user?.documento || '',
        telefono: user?.telefono || '',
        fecha_nacimiento: user?.fecha_nacimiento ? user.fecha_nacimiento.split('T')[0] : '',

        // Campos específicos según rol
        posicion: user?.posicion || '',
        numero_camiseta: user?.numero_camiseta || '',
        departamento: user?.departamento || '',
        turno: user?.turno || '',
        categoria: user?.categoria || '',
        numero_licencia: user?.numero_licencia || '',
        especialidad: user?.especialidad || ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            const updateData: UpdateProfileRequest = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                documento: formData.documento || undefined,
                telefono: formData.telefono || undefined,
                fecha_nacimiento: formData.fecha_nacimiento || undefined
            };

            // Agregar campos específicos según el rol
            if (user?.role === 'jugador') {
                if (formData.posicion) updateData.posicion = formData.posicion;
                if (formData.numero_camiseta) {
                    updateData.numero_camiseta = typeof formData.numero_camiseta === 'string'
                        ? parseInt(formData.numero_camiseta)
                        : formData.numero_camiseta;
                }
            } else if (user?.role === 'gestor') {
                if (formData.departamento) updateData.departamento = formData.departamento;
            } else if (user?.role === 'recepcionista') {
                if (formData.turno) updateData.turno = formData.turno;
            } else if (user?.role === 'arbitro') {
                if (formData.categoria) updateData.categoria = formData.categoria;
                if (formData.numero_licencia) updateData.numero_licencia = formData.numero_licencia;
                if (formData.especialidad) updateData.especialidad = formData.especialidad;
            }

            const updatedUser = await authService.updateProfile(updateData);
            updateUser(updatedUser);
            setSuccess('Perfil actualizado exitosamente');
            setIsEditing(false);
        } catch (err: any) {
            setError(err.message || 'Error al actualizar el perfil');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setIsLoading(true);

        try {
            await authService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setSuccess('Contraseña actualizada exitosamente');
            setShowPasswordForm(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err: any) {
            setError(err.message || 'Error al cambiar la contraseña');
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleLabel = (role: string): string => {
        const roles: { [key: string]: string } = {
            'administrador': 'Administrador',
            'gestor': 'Gestor',
            'recepcionista': 'Recepcionista',
            'arbitro': 'Árbitro',
            'jugador': 'Jugador'
        };
        return roles[role] || role;
    };

    const getRoleBadgeClass = (role: string): string => {
        return `role-badge role-badge-${role}`;
    };

    if (!user) {
        return <div className="profile-container">Cargando...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    <div className="avatar-circle">
                        <span className="avatar-initials">
                            {user.nombre.charAt(0)}{user.apellido.charAt(0)}
                        </span>
                    </div>
                </div>
                <div className="profile-title">
                    <h1>{user.nombre} {user.apellido}</h1>
                    <span className={getRoleBadgeClass(user.role)}>
                        {getRoleLabel(user.role)}
                    </span>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="profile-content">
                {/* Información básica */}
                <div className="profile-card">
                    <div className="card-header">
                        <h2>Información Personal</h2>
                        {!isEditing && (
                            <button
                                className="btn btn-secondary"
                                onClick={() => setIsEditing(true)}
                            >
                                <i className="icon-edit"></i> Editar
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="nombre">Nombre *</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="apellido">Apellido *</label>
                                    <input
                                        type="text"
                                        id="apellido"
                                        name="apellido"
                                        value={formData.apellido}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="documento">Documento</label>
                                    <input
                                        type="text"
                                        id="documento"
                                        name="documento"
                                        value={formData.documento}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="telefono">Teléfono</label>
                                    <input
                                        type="tel"
                                        id="telefono"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    id="fecha_nacimiento"
                                    name="fecha_nacimiento"
                                    value={formData.fecha_nacimiento}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Campos específicos de Jugador */}
                            {user.role === 'jugador' && (
                                <>
                                    <div className="form-section-title">Información de Jugador</div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="posicion">Posición</label>
                                            <select
                                                id="posicion"
                                                name="posicion"
                                                value={formData.posicion}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Seleccionar...</option>
                                                <option value="arquero">Arquero</option>
                                                <option value="defensor">Defensor</option>
                                                <option value="mediocampista">Mediocampista</option>
                                                <option value="delantero">Delantero</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="numero_camiseta">Número de Camiseta</label>
                                            <input
                                                type="number"
                                                id="numero_camiseta"
                                                name="numero_camiseta"
                                                value={formData.numero_camiseta}
                                                onChange={handleInputChange}
                                                min="1"
                                                max="99"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Campos específicos de Gestor */}
                            {user.role === 'gestor' && (
                                <>
                                    <div className="form-section-title">Información de Gestor</div>
                                    <div className="form-group">
                                        <label htmlFor="departamento">Departamento</label>
                                        <select
                                            id="departamento"
                                            name="departamento"
                                            value={formData.departamento}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="primera_division">Primera División</option>
                                            <option value="segunda_division">Segunda División</option>
                                            <option value="juveniles">Juveniles</option>
                                            <option value="femenino">Femenino</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Campos específicos de Recepcionista */}
                            {user.role === 'recepcionista' && (
                                <>
                                    <div className="form-section-title">Información de Recepcionista</div>
                                    <div className="form-group">
                                        <label htmlFor="turno">Turno</label>
                                        <select
                                            id="turno"
                                            name="turno"
                                            value={formData.turno}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="mañana">Mañana</option>
                                            <option value="tarde">Tarde</option>
                                            <option value="noche">Noche</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Campos específicos de Árbitro */}
                            {user.role === 'arbitro' && (
                                <>
                                    <div className="form-section-title">Información de Árbitro</div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="categoria">Categoría</label>
                                            <select
                                                id="categoria"
                                                name="categoria"
                                                value={formData.categoria}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Seleccionar...</option>
                                                <option value="local">Local</option>
                                                <option value="regional">Regional</option>
                                                <option value="nacional">Nacional</option>
                                                <option value="internacional">Internacional</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="numero_licencia">Número de Licencia</label>
                                            <input
                                                type="text"
                                                id="numero_licencia"
                                                name="numero_licencia"
                                                value={formData.numero_licencia}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="especialidad">Especialidad</label>
                                        <select
                                            id="especialidad"
                                            name="especialidad"
                                            value={formData.especialidad}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="principal">Principal</option>
                                            <option value="asistente">Asistente</option>
                                            <option value="cuarto_arbitro">Cuarto Árbitro</option>
                                            <option value="var">VAR</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setError(null);
                                    }}
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-info">
                            <div className="info-row">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{user.email}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Nombre:</span>
                                <span className="info-value">{user.nombre} {user.apellido}</span>
                            </div>
                            {user.documento && (
                                <div className="info-row">
                                    <span className="info-label">Documento:</span>
                                    <span className="info-value">{user.documento}</span>
                                </div>
                            )}
                            {user.telefono && (
                                <div className="info-row">
                                    <span className="info-label">Teléfono:</span>
                                    <span className="info-value">{user.telefono}</span>
                                </div>
                            )}
                            {user.fecha_nacimiento && (
                                <div className="info-row">
                                    <span className="info-label">Fecha de Nacimiento:</span>
                                    <span className="info-value">
                                        {new Date(user.fecha_nacimiento).toLocaleDateString('es-ES')}
                                    </span>
                                </div>
                            )}

                            {/* Info específica de Jugador */}
                            {user.role === 'jugador' && (
                                <>
                                    {(user.posicion || user.numero_camiseta) && (
                                        <div className="info-section">
                                            <h3>Información de Jugador</h3>
                                            {user.posicion && (
                                                <div className="info-row">
                                                    <span className="info-label">Posición:</span>
                                                    <span className="info-value">{user.posicion}</span>
                                                </div>
                                            )}
                                            {user.numero_camiseta && (
                                                <div className="info-row">
                                                    <span className="info-label">Número:</span>
                                                    <span className="info-value">{user.numero_camiseta}</span>
                                                </div>
                                            )}
                                            {user.goles_marcados !== undefined && (
                                                <div className="info-row">
                                                    <span className="info-label">Goles:</span>
                                                    <span className="info-value">{user.goles_marcados}</span>
                                                </div>
                                            )}
                                            {user.partidos_jugados !== undefined && (
                                                <div className="info-row">
                                                    <span className="info-label">Partidos Jugados:</span>
                                                    <span className="info-value">{user.partidos_jugados}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Info específica de Árbitro */}
                            {user.role === 'arbitro' && (
                                <>
                                    {(user.categoria || user.numero_licencia || user.especialidad) && (
                                        <div className="info-section">
                                            <h3>Información de Árbitro</h3>
                                            {user.categoria && (
                                                <div className="info-row">
                                                    <span className="info-label">Categoría:</span>
                                                    <span className="info-value">{user.categoria}</span>
                                                </div>
                                            )}
                                            {user.numero_licencia && (
                                                <div className="info-row">
                                                    <span className="info-label">Licencia:</span>
                                                    <span className="info-value">{user.numero_licencia}</span>
                                                </div>
                                            )}
                                            {user.especialidad && (
                                                <div className="info-row">
                                                    <span className="info-label">Especialidad:</span>
                                                    <span className="info-value">{user.especialidad}</span>
                                                </div>
                                            )}
                                            {user.partidos_arbitrados !== undefined && (
                                                <div className="info-row">
                                                    <span className="info-label">Partidos Arbitrados:</span>
                                                    <span className="info-value">{user.partidos_arbitrados}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Info específica de Gestor */}
                            {user.role === 'gestor' && user.departamento && (
                                <div className="info-section">
                                    <h3>Información de Gestor</h3>
                                    <div className="info-row">
                                        <span className="info-label">Departamento:</span>
                                        <span className="info-value">{user.departamento}</span>
                                    </div>
                                </div>
                            )}

                            {/* Info específica de Recepcionista */}
                            {user.role === 'recepcionista' && user.turno && (
                                <div className="info-section">
                                    <h3>Información de Recepcionista</h3>
                                    <div className="info-row">
                                        <span className="info-label">Turno:</span>
                                        <span className="info-value">{user.turno}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Seguridad - Cambiar contraseña */}
                <div className="profile-card">
                    <div className="card-header">
                        <h2>Seguridad</h2>
                        {!showPasswordForm && (
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowPasswordForm(true)}
                            >
                                Cambiar Contraseña
                            </button>
                        )}
                    </div>

                    {showPasswordForm ? (
                        <form onSubmit={handlePasswordSubmit} className="profile-form">
                            <div className="form-group">
                                <label htmlFor="currentPassword">Contraseña Actual *</label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="newPassword">Nueva Contraseña *</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        setPasswordData({
                                            currentPassword: '',
                                            newPassword: '',
                                            confirmPassword: ''
                                        });
                                        setError(null);
                                    }}
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-info">
                            <div className="info-row">
                                <span className="info-label">Contraseña:</span>
                                <span className="info-value">••••••••</span>
                            </div>
                            <p className="info-hint">
                                Mantén tu contraseña segura y actualízala regularmente.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
