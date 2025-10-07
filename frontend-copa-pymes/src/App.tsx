import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { HomePage } from './pages/HomePage';
import { JugadoresPage } from './pages/JugadoresPage';
import { TorneosPage } from './pages/TorneosPage';
import LoginPage from './pages/LoginPage';
import { Loading } from './components/common/Loading';
import './styles/global.css';

type PageType = 'home' | 'jugadores' | 'torneos' | 'login';

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      setCurrentPage('login');
    } else if (isAuthenticated && currentPage === 'login') {
      setCurrentPage('home');
    }
  }, [isAuthenticated, isLoading, currentPage]);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setCurrentPage('home')} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigateToJugadores={() => setCurrentPage('jugadores')} />;
      case 'jugadores':
        return <JugadoresPage />;
      case 'torneos':
        return <TorneosPage />;
      default:
        return <HomePage onNavigateToJugadores={() => setCurrentPage('jugadores')} />;
    }
  };

  return (
    <div className="app">
      <Header 
        title="🏆 Copa Pymes" 
        onNavigateHome={() => setCurrentPage('home')}
        onNavigateJugadores={() => setCurrentPage('jugadores')}
        onNavigateTorneos={() => setCurrentPage('torneos')}
        currentPage={currentPage}
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;