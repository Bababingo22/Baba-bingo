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
  const [isLoading, setIsLoading] = useState(true); // Add a loading state

  // --- CORRECTED: This effect now ONLY runs when the `token` changes ---
  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      setTokenState(t);
      
      // Fetch all initial data at once
      Promise.all([
        api.get('/me/'),
        api.get('/games/history/')
      ]).then(([userResponse, historyResponse]) => {
        setUser(userResponse.data);
        setGameHistory(historyResponse.data);
        setAuthed(true);
      }).catch(() => {
        // If anything fails, log the user out
        localStorage.removeItem('token');
        setToken(null);
        setAuthed(false);
      }).finally(() => {
        setIsLoading(false); // Stop loading when done
      });
    } else {
      setIsLoading(false); // Not logged in, stop loading
    }
  }, []); // This still only runs once on initial load

  // --- NEW: A separate function to refresh data AFTER an action ---
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
    refreshDashboardData(); // Refresh data after logging in
  }

  function handleGameCreated(game, settings) {
    setCurrentGame(game);
    setGameSettings(settings);
    setView('runner');
    refreshDashboardData(); // Refresh data after creating a game
  }
  
  const handleNav = (newView) => {
    setView(newView);
    if (!isSidebarExpanded) setIsSidebarExpanded(true);
  };
  
  // --- Show a loading screen while we verify the token ---
  if (isLoading) {
    return <div className="bg-[#0f172a] min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  if (!authed) {
    return <Login onLogin={handleLogin} />;
  }
  
  const renderMainApp = (mainContent) => (
    <div className="flex bg-[#0f172a] text-white min-h-screen">
      <Sidebar 
        user={user} 
        gameHistory={gameHistory}
        onNav={handleNav}
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />
      <div className="flex-1 overflow-y-auto">{mainContent}</div>
    </div>
  );

  let mainContent;
  switch (view) {
    case 'create':
      mainContent = <CreateGameWizard onCreated={handleGameCreated} />;
      break;
    case 'runner':
      mainContent = currentGame ? <GameR