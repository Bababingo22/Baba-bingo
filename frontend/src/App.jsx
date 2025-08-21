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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); // Start expanded

  // --- NEW: State for shared data ---
  const [gameHistory, setGameHistory] = useState([]);

  // --- NEW: Function to refresh all shared data ---
  const refreshDashboardData = () => {
    // Re-fetch the user data to get the latest credit
    api.get('/me/').then(r => setUser(r.data));
    // Re-fetch the game history to get the latest list of games
    api.get('/games/history/').then(r => setGameHistory(r.data));
  };

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      setTokenState(t);
      // When the app loads, fetch the initial data
      refreshDashboardData();
      setAuthed(true);
    }
  }, []);

  function handleLogin({ token, user }) {
    localStorage.setItem('token', token);
    setToken(token);
    setTokenState(token);
    setUser(user);
    refreshDashboardData(); // Fetch data after logging in
    setAuthed(true);
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

  if (!authed) {
    return <Login onLogin={handleLogin} />;
  }
  
  const renderMainApp = (mainContent) => (
    <div className="flex bg-[#0f172a] text-white min-h-screen">
      {/* Pass the fresh data down to the Sidebar */}
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
      // Pass the fresh game history to the report page as well
      mainContent = <TransactionHistory gameHistory={gameHistory} />;
      break;
    default:
      mainContent = <CreateGameWizard onCreated={handleGameCreated} />;
  }

  return renderMainApp(mainContent);
}