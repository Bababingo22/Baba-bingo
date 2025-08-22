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
  const [currentGame, setCurrentGame] = useState(null);
  const [gameSettings, setGameSettings] = useState({ callSpeed: 10, audioLanguage: 'Amharic Male' });
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
        api.get('/games/history/').then(historyResponse => {
          setGameHistory(historyResponse.data);
        });
      }).catch(() => {
        localStorage.removeItem('token');
        setToken(null);
        setAuthed(false);
      }).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  function handleLogin({ token, user: loggedInUser }) {
    localStorage.setItem('token', token);
    setToken(token);
    setTokenState(token);
    setUser(loggedInUser);
    setAuthed(true);
    // Fetch initial game history after login
    api.get('/games/history/').then(r => setGameHistory(r.data));
  }

  // --- THIS IS THE CORRECTED FUNCTION ---
  function handleGameCreated(game, settings) {
    // This function now ensures all data is fresh before changing the view.
    // 1. First, fetch the latest user data (to get the new credit balance)
    //    and the latest game history (to include the new game).
    Promise.all([
      api.get('/me/'),
      api.get('/games/history/')
    ]).then(([userResponse, historyResponse]) => {
      // 2. Update the state with the fresh data.
      setUser(userResponse.data);
      setGameHistory(historyResponse.data);
      
      // 3. ONLY NOW, set the current game and switch to the runner view.
      setCurrentGame(game);
      setGameSettings(settings);
      setView('runner');
    }).catch(error => {
      console.error("Failed to refresh data after game creation:", error);
      // If something goes wrong, at least go back to the dashboard
      setView('create');
    });
  }
  
  const handleNav = (newView) => {
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