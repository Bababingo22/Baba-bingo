import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import CreateGameWizard from './components/CreateGameWizard';
import GameRunner from './components/GameRunner';
import Sidebar from './components/Sidebar';
import TransactionHistory from './components/TransactionHistory';
import api, { setToken } from './services/api';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [view, setView] = useState('create');
  const [currentGame, setCurrentGame] = useState(null);
  const [gameSettings, setGameSettings] = useState({ callSpeed: 10, audioLanguage: 'Amharic Male' });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  // --- CENTRALIZED STATE ---
  const [dashboardData, setDashboardData] = useState({ user: null, gameHistory: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // This single function fetches all necessary data
  const refreshData = () => {
    setIsLoading(true);
    setError(null);
    Promise.all([
      api.get('/me/'),
      api.get('/games/history/')
    ]).then(([userRes, historyRes]) => {
      setDashboardData({
        user: userRes.data,
        gameHistory: historyRes.data
      });
      setAuthed(true);
    }).catch(err => {
      console.error("Data fetch error:", err);
      setError("Failed to load dashboard data. Please try refreshing.");
      setAuthed(false);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
      refreshData();
    } else {
      setIsLoading(false);
    }
  }, []);

  function handleLogin({ token, user }) {
    localStorage.setItem('token', token);
    setToken(token);
    setDashboardData({ user, gameHistory: [] }); // Set user immediately
    setAuthed(true);
    refreshData(); // Fetch the rest of the data
  }

  function handleGameCreated(game, settings) {
    setCurrentGame(game);
    setGameSettings(settings);
    setView('runner');
    refreshData(); // Refresh all data after creating a game
  }
  
  const handleNav = (newView) => {
    setView(newView);
    if (!isSidebarExpanded) setIsSidebarExpanded(true);
  };
  
  if (isLoading) {
    return <div className="bg-[#0f172a] min-h-screen flex items-center justify-center text-white">Loading Session...</div>;
  }

  if (!authed || !dashboardData.user) {
    return <Login onLogin={handleLogin} />;
  }
  
  const renderMainApp = (mainContent) => (
    <div className="flex bg-[#0f172a] text-white min-h-screen">
      <Sidebar 
        data={dashboardData}
        error={error}
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
      mainContent = currentGame ? <GameRunner game={currentGame} token={localStorage.getItem('token')} callSpeed={gameSettings.callSpeed} audioLanguage={gameSettings.audioLanguage} /> : <CreateGameWizard onCreated={handleGameCreated} />;
      break;
    case 'report':
      mainContent = <TransactionHistory />;
      break;
    default:
      mainContent = <CreateGameWizard onCreated={handleGameCreated} />;
  }

  return renderMainApp(mainContent);
}