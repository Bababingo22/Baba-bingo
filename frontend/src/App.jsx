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

  // This is a robust function to fetch all dashboard data
  const refreshDashboardData = () => {
    // We fetch both user and history at the same time
    Promise.all([
      api.get('/me/'),
      api.get('/games/history/')
    ]).then(([userResponse, historyResponse]) => {
      setUser(userResponse.data);
      setGameHistory(historyResponse.data);
    }).catch(error => {
      console.error("Failed to refresh dashboard data:", error);
      // If fetching fails, it might be an auth issue, so log out
      localStorage.removeItem('token');
      setToken(null);
      setAuthed(false);
    });
  };

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      setTokenState(t);
      setAuthed(true); // Assume authenticated for now
      refreshDashboardData(); // Fetch initial data
    }
    setIsLoading(false); // We can stop loading immediately
  }, []);

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
    refreshDashboardData(); // --- CRITICAL: Refresh data after creating a game ---
  }
  
  const handleNav = (newView) => {
    setView(newView);
    if (!isSidebarExpanded) setIsSidebarExpanded(true);
  };
  
  if (isLoading) {
    return <div className="bg-[#0f172a] min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  if (!authed || !user) { // Added !user check for robustness
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
      mainContent = currentGame ? <GameRunner game={currentGame} token={token} callSpeed={gameSettings.callSpeed} audioLanguage={gameSettings.audioLanguage} /> : <CreateGameWizard onCreated={handleGameCreated} />;
      break;
    case 'report':
      mainContent = <TransactionHistory />;
      break;
    default:
      mainContent = <CreateGameWizard onCreated={handleGameCreated} />;
  }

  return renderMainApp(mainContent);
}