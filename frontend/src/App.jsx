import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import CreateGameWizard from './components/CreateGameWizard';
import GameRunner from './components/GameRunner';
// --- CORRECTED: Imports the redesigned Sidebar.jsx ---
import Sidebar from './components/Sidebar'; 
import api, { setToken } from './services/api';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(localStorage.getItem('token'));
  const [view, setView] = useState('create');
  const [currentGame, setCurrentGame] = useState(null);
  const [gameSettings, setGameSettings] = useState({ callSpeed: 10, audioLanguage: 'Amharic Male' });

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      setTokenState(t);
      api.get('/me/').then(r => { 
        setUser(r.data); 
        setAuthed(true); 
      }).catch(() => {
        localStorage.removeItem('token');
        setToken(null);
        setAuthed(false);
      });
    }
  }, []);

  function handleLogin({ token, user }) {
    localStorage.setItem('token', token);
    setToken(token);
    setTokenState(token);
    setUser(user);
    setAuthed(true);
  }

  function handleGameCreated(game, settings) {
    setCurrentGame(game);
    setGameSettings(settings);
    setView('runner');
  }

  if (!authed) {
    return <Login onLogin={handleLogin} />;
  }
  
  // This is the main layout function.
  // It takes the main content (like the GameRunner) and wraps it with the Sidebar.
  const renderMainApp = (mainContent) => (
    <div className="flex bg-[#0f172a] text-white min-h-screen">
      {/* --- CORRECTED: Renders the Sidebar component with the logged-in user's info --- */}
      <Sidebar user={user} /> 
      
      {/* This is where the main content will go */}
      <div className="flex-1">
        {mainContent}
      </div>
    </div>
  );

  // Conditional logic to decide what main content to show
  if (view === 'create') {
    return renderMainApp(<CreateGameWizard onCreated={handleGameCreated} />);
  }
  
  if (view === 'runner' && currentGame) {
    return renderMainApp(<GameRunner 
      game={currentGame} 
      token={token} 
      callSpeed={gameSettings.callSpeed} 
      audioLanguage={gameSettings.audioLanguage} 
    />);
  }

  // By default, show the game creation screen
  return renderMainApp(<CreateGameWizard onCreated={handleGameCreated} />);
}