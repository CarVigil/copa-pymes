import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { HomePage } from './pages/HomePage';
import { JugadoresPage } from './pages/JugadoresPage';
import './styles/global.css';

type PageType = 'home' | 'jugadores';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigateToJugadores={() => setCurrentPage('jugadores')} />;
      case 'jugadores':
        return <JugadoresPage />;
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
        currentPage={currentPage}
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;