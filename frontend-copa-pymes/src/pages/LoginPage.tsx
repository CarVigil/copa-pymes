import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@copapymes.com'); // Pre-llenar con admin
  const [password, setPassword] = useState('admin123'); // Pre-llenar con contraseña
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">⚽</div>
          <h1 className="login-title">Copa Pymes</h1>
          <p className="login-subtitle">Inicia sesión en tu cuenta</p>
        </div>

        <div className="login-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="usuario@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading || !email || !password}
            >
              <div className="button-content">
                {isLoading && <div className="loading-spinner"></div>}
                <span>{isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
              </div>
            </button>

            {/* Botones de acceso rápido para pruebas */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
                onClick={() => {
                  setEmail('admin@copapymes.com');
                  setPassword('admin123');
                }}
                disabled={isLoading}
              >
                👨‍💼 Admin
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
                onClick={() => {
                  setEmail('jugador@test.com');
                  setPassword('123456');
                }}
                disabled={isLoading}
              >
                ⚽ Jugador
              </button>
            </div>
          </form>
        </div>

        <div className="login-footer">
          <p>
            <strong>Usuarios de prueba:</strong><br />
            Admin: admin@copapymes.com / admin123<br />
            Jugador: jugador@test.com / 123456
          </p>
          <p style={{ marginTop: '1rem' }}>
            ¿Olvidaste tu contraseña?{' '}
            <a href="#" className="forgot-password">
              Recuperar contraseña
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;