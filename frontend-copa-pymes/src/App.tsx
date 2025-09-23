import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { HomePage } from './pages/HomePage';
import { JugadoresPage } from './pages/JugadoresPage';
import { TorneosPage } from './pages/TorneosPage';
import './styles/global.css';

type PageType = 'home' | 'jugadores' | 'torneos';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

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