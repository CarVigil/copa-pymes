// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { HomePage } from './pages/HomePage';
import { JugadoresPage } from './pages/JugadoresPage';
import { TorneosPage } from './pages/TorneosPage';
import { EquiposPage } from './pages/EquiposPage';
import { EquipoDetallePage } from './pages/EquipoDetallePage';
import TorneoDetallePage from './pages/TorneoDetallePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import { Loading } from './components/common/Loading';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const path = location.pathname;
  let currentPage = 'home';
  if (path.startsWith('/jugadores')) currentPage = 'jugadores';
  else if (path.startsWith('/torneos/')) currentPage = 'torneo-detalle';
  else if (path.startsWith('/torneos')) currentPage = 'torneos';
  else if (path === '/equipos') currentPage = 'equipos';
  else if (path.startsWith('/equipos/')) currentPage = 'equipo-detalle';
  else if (path.startsWith('/perfil')) currentPage = 'profile';

  return (
    <div className="app">
      <Header
        title="🏆 Copa Pymes"
        currentPage={currentPage}
        onNavigateHome={() => navigate('/')}
        onNavigateJugadores={() => navigate('/jugadores')}
        onNavigateTorneos={() => navigate('/torneos')}
        onNavigateEquipos={() => navigate('/equipos')}
        onNavigateProfile={() => navigate('/perfil')}
      />

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage onNavigateTorneos={() => navigate("/torneos")} />
            }
          />
          <Route path="/jugadores" element={<JugadoresPage />} />
          <Route path="/torneos" element={<TorneosPage />} />
          <Route path="/torneos/:id" element={<TorneoDetallePage />} />
          <Route path="/equipos" element={<EquiposPage />} />
          <Route path="/equipos/:id" element={<EquipoDetallePage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
