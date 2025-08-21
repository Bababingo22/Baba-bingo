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

  // ... (All functions like useEffect, refreshDashboardData, handleLogin, etc. remain the same) ...
  const refreshDashboardData = () => { /* ... */ };
  useEffect(() => { /* ... */ }, []);
  function handleLogin({ token, user: loggedInUser }) { /* ... */ }
  function handleGameCreated(game, settings) {
    setCurrentGame(game);
    setGameSettings(settings);
    setView('runner'); // This is the key: change the view to 'runner'
    refreshDashboardData();
  }
  const handleNav = (newView) => setView(newView);

  if (isLoading) { return <div className="bg-[#0f172a] min-h-screen flex items-center justify-center text-white">Verifying Session...</div>; }
  if (!authed || !user) { return <Login onLogin={handleLogin} />; }
  
  // --- THIS IS THE FINAL RENDER LOGIC ---
  if (view === 'runner' && currentGame) {
    // If the view is 'runner', render the GameRunner as a full-screen component WITHOUT the sidebar.
    return <GameRunner 
              game={currentGame} 
              token={token} 
              user={user}
              callSpeed={gameSettings.callSpeed} 
              audioLanguage={gameSettings.audioLanguage}
              onNav={handleNav}
           />;
  }

  // For all other views ('create', 'report'), render them with the main sidebar layout.
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