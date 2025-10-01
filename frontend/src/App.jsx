import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import CreateGameWizard from './components/CreateGameWizard';
import GameRunner from './components/GameRunner';
import Sidebar from './components/Sidebar';
import TransactionHistory from './components/TransactionHistory';
import api, { setToken } from './services/api';

const getInitialGameState = () => {
  try {
    const savedState = localStorage.getItem('vladBingoGameState');
    return savedState ? JSON.parse(savedState) : { game: null, settings: { callSpeed: 10, audioLanguage: 'Amharic Male' } };
  } catch (e) {
    return { game: null, settings: { callSpeed: 10, audioLanguage: 'Amharic Male' } };
  }
};

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(localStorage.getItem('token'));
  const [gameState, setGameState] = useState(getInitialGameState());
  const [view, setView] = useState(gameState.game ? 'runner' : 'create');
  // THIS STATE IS IMPORTANT FOR THE LAYOUT
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // Default to collapsed
  const [gameHistory, setGameHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      setTokenState(t);
      
      Promise.all([
        api.get('/me/'),
        api.get('/games/history/'),
        gameState.game ? api.get(`/games/${gameState.game.id}/`) : Promise.resolve(null)
      ]).then(([userResponse, historyResponse, gameResponse]) => {
        setUser(userResponse.data);
        setGameHistory(historyResponse.data);
        if (gameResponse) {
          const updatedGameState = { ...gameState, game: gameResponse.data };
          setGameState(updatedGameState);
          localStorage.setItem('vladBingoGameState', JSON.stringify(updatedGameState));
        }
        setAuthed(true);
      }).catch(() => {
        localStorage.clear();
        setToken(null);
        setAuthed(false);
      }).finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshDashboardData = () => {
    api.get('/me/').then(r => setUser(r.data));
    api.get('/games/history/').then(r => setGameHistory(r.data));
  };
  
  function handleLogin({ token, user: loggedInUser }) {
    localStorage.setItem('token', token);
    setToken(token);
    setTokenState(token);
    setUser(loggedInUser);
    setAuthed(true);
    refreshDashboardData();
  }

  function handleGameCreated(game, settings) {
    const newGameState = { game, settings };
    localStorage.setItem('vladBingoGameState', JSON.stringify(newGameState));
    setGameState(newGameState);
    setView('runner');
    refreshDashboardData();
  }
  
  const handleNav = (newView) => {
    if (newView !== 'runner') {
      localStorage.removeItem('vladBingoGameState');
      setGameState({ game: null, settings: { callSpeed: 10, audioLanguage: 'Amharic Male' } });
    }
    setView(newView);
  };
  
  if (isLoading) {
    return <div className="bg-[#0f172a] min-h-screen flex items-center justify-center text-white">Verifying Session...</div>;
  }

  if (!authed || !user) {
    return <Login onLogin={handleLogin} />;
  }
  
  if (view === 'runner' && gameState.game) {
    return <GameRunner 
              key={gameState.game.id}
              game={gameState.game} 
              token={token} 
              user={user}
              callSpeed={gameState.settings.callSpeed} 
              audioLanguage={gameState.settings.audioLanguage}
              onNav={handleNav}
           />;
  }
  
  // *** THIS IS THE NEW CODE THAT ADDS THE MARGIN ***
  const marginClass = isSidebarExpanded ? 'ml-80' : 'ml-16';

  return (
    <div className="flex bg-[#0f172a] text-white min-h-screen">
      <Sidebar 
        user={user} 
        gameHistory={gameHistory}
        onNav={handleNav}
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />
      {/* *** THE MARGIN CLASS IS ADDED HERE *** */}
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${marginClass}`}>
        {/* The CreateGameWizard no longer needs the sidebar prop */}
        {view === 'create' && <CreateGameWizard onCreated={handleGameCreated} />}
        {view === 'report' && <TransactionHistory />}
      </main>
    </div>
  );
}