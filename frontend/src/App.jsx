import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import CreateGameWizard from './components/CreateGameWizard';
import GameRunner from './components/GameRunner';
import Sidebar from './components/Sidebar';
import TransactionHistory from './components/TransactionHistory';
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
    setCurrentGame(game);
    setGameSettings(settings);
    setView('runner');
    refreshDashboardData();
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
  
  // --- THIS IS THE CORRECTED RENDER LOGIC ---
  if (view === 'runner' && currentGame) {
    // If we are in the 'runner' view, render it as a full-screen component.
    return <GameRunner 
              game={currentGame} 
              token={token} 
              user={user}
              callSpeed={gameSettings.callSpeed} 
              audioLanguage={gameSettings.audioLanguage}
              onNav={handleNav} // Pass the navigation function
           />;
  }

  // For all other views ('create', 'report', etc.), render them with the main sidebar layout.
  return (
    <div className="flex bg-[#0f172a] text-white min-h-screen">
      <Sidebar 
        user={user} 
        gameHistory={gameHistory}
        onNav={handleNav}
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />
      <div className="flex-1 overflow-y-auto">
        {view === 'create' && <CreateGameWizard onCreated={handleGameCreated} />}
        {view === 'report' && <TransactionHistory />}
      </div>
    </div>
  );
}