import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import CreateGameWizard from './components/CreateGameWizard';
import GameRunner from './components/GameRunner';
import Sidebar from './components/Sidebar';
import TransactionHistory from './components/TransactionHistory';
import MainLayout from './components/MainLayout';
import api, { setToken } from './services/api';

// Helper function to safely get data from localStorage
const getInitialGameState = () => {
  try {
    const savedState = localStorage.getItem('yabaBingoGameState');
    return savedState ? JSON.parse(savedState) : { game: null, settings: { callSpeed: 10, audioLanguage: 'Amharic Male' } };
  } catch (e) {
    return { game: null, settings: { callSpeed: 10, audioLanguage: 'Amharic Male' } };
  }
};

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(localStorage.getItem('token'));
  
  // --- THIS IS THE FIX ---
  // Initialize state from localStorage
  const [gameState, setGameState] = useState(getInitialGameState());
  const [view, setView] = useState(gameState.game ? 'runner' : 'create');

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [gameHistory, setGameHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      setTokenState(t);
      api.get('/me/').then(userResponse => {
        setUser(userResponse.data);
        setAuthed(true);
        // If a game was loaded from localStorage, re-fetch its latest state
        if (gameState.game) {
          api.get(`/games/${gameState.game.id}/`).then(gameResponse => {
            setGameState(prevState => ({ ...prevState, game: gameResponse.data }));
          });
        }
        api.get('/games/history/').then(historyResponse => {
          setGameHistory(historyResponse.data);
        });
      }).catch(() => {
        localStorage.clear(); // Clear all game data on auth failure
        setToken(null);
        setAuthed(false);
      }).finally(() => setIsLoading(false));
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

  // --- THIS IS THE CORRECTED FUNCTION ---
  function handleGameCreated(game, settings) {
    const newGameState = { game, settings };
    localStorage.setItem('yabaBingoGameState', JSON.stringify(newGameState));
    setGameState(newGameState);
    setView('runner');
    refreshDashboardData();
  }
  
  const handleNav = (newView) => {
    // When navigating away, clear the saved game from memory
    if (newView !== 'runner') {
      localStorage.removeItem('yabaBingoGameState');
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
              key={gameState.game.id} // Add key to force re-mount on new game
              game={gameState.game} 
              token={token} 
              user={user}
              callSpeed={gameState.settings.callSpeed} 
              audioLanguage={gameState.settings.audioLanguage}
              onNav={handleNav}
           />;
  }

  let mainContent;
  if (view === 'report') {
    mainContent = <TransactionHistory />;
  } else {
    mainContent = <CreateGameWizard onCreated={handleGameCreated} />;
  }

  return (
    <MainLayout
      user={user}
      gameHistory={gameHistory}
      onNav={handleNav}
      isExpanded={isSidebarExpanded}
      onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
    >
      {mainContent}
    </MainLayout>
  );
}