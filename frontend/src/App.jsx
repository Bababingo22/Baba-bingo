import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import CreateGameWizard from './components/CreateGameWizard';
import GameRunner from './components/GameRunner';
import Sidebar from './components/Sidebar';
import TransactionHistory from './components/TransactionHistory';
import MainLayout from './components/MainLayout';
import api, { setToken } from './services/api';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(localStorage.getItem('token'));
  const [view, setView] = useState('create');

  // --- INJECTED CHANGE ---
  // The initial state for currentGame is now read from localStorage.
  const [currentGame, setCurrentGame] = useState(() => {
    try {
      const savedGame = localStorage.getItem('currentGame');
      return savedGame ? JSON.parse(savedGame) : null;
    } catch (e) {
      return null;
    }
  });

  const [gameSettings, setGameSettings] = useState({ callSpeed: 10, audioLanguage: 'Amharic Male' });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [gameHistory, setGameHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- INJECTED CHANGE ---
  // This useEffect now checks if a game was loaded from localStorage
  // and automatically switches to the 'runner' view if one was found.
  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      setTokenState(t);
      api.get('/me/').then(userResponse => {
        setUser(userResponse.data);
        setAuthed(true);
        // If we loaded a game from localStorage, go to the runner.
        if (localStorage.getItem('currentGame')) {
          setView('runner');
        }
        api.get('/games/history/').then(historyResponse => {
          setGameHistory(historyResponse.data);
        });
      }).catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentGame'); // Clean up on auth failure
        setToken(null);
        setAuthed(false);
      }).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshDashboardData = () => {
    Promise.all([
      api.get('/me/'),
      api.get('/games/history/')
    ]).then(([userResponse, historyResponse]) => {
      setUser(userResponse.data);
      setGameHistory(historyResponse.data);
    }).catch(error => {
      console.error("Failed to refresh dashboard data:", error);
    });
  };
  
  function handleLogin({ token, user: loggedInUser }) {
    localStorage.setItem('token', token);
    setToken(token);
    setTokenState(token);
    setUser(loggedInUser);
    setAuthed(true);
    refreshDashboardData();
  }

  // --- INJECTED CHANGE ---
  // This function now saves the created game to localStorage.
  function handleGameCreated(game, settings) {
    localStorage.setItem('currentGame', JSON.stringify(game));
    setCurrentGame(game);
    setGameSettings(settings);
    setView('runner');
    refreshDashboardData();
  }
  
  // --- INJECTED CHANGE ---
  // This function now clears the saved game when navigating away.
  const handleNav = (newView) => {
    if (newView !== 'runner') {
      localStorage.removeItem('currentGame');
      setCurrentGame(null);
    }
    setView(newView);
  };
  
  if (isLoading) {
    return <div className="bg-[#0f172a] min-h-screen flex items-center justify-center text-white">Verifying Session...</div>;
  }

  if (!authed || !user) {
    return <Login onLogin={handleLogin} />;
  }
  
  if (view === 'runner' && currentGame) {
    return <GameRunner 
              game={currentGame} 
              token={token} 
              user={user}
              callSpeed={gameSettings.callSpeed} 
              audioLanguage={gameSettings.audioLanguage}
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