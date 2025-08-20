import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import CreateGameWizard from './components/CreateGameWizard';
import GameRunner from './components/GameRunner';
import Sidebar from './components/Sidebar';
import BoardView from './components/BoardView'; // Assuming you still want this feature
import api, { setToken } from './services/api';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(localStorage.getItem('token'));
  const [view, setView] = useState('create');
  const [currentGame, setCurrentGame] = useState(null);
  const [gameSettings, setGameSettings] = useState({ callSpeed: 10, audioLanguage: 'Amharic Male' });
  
  // --- NEW STATE to control the sidebar ---
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  useEffect(() => {
    // ... (no changes here) ...
  }, []);

  function handleLogin({ token, user }) {
    // ... (no changes here) ...
  }

  function handleGameCreated(game, settings) {
    // ... (no changes here) ...
  }
  
  const handleNav = (newView) => {
    setView(newView);
    // When navigating, it's good practice to expand the sidebar to show the new selection
    setIsSidebarExpanded(true);
  };

  if (!authed) {
    return <Login onLogin={handleLogin} />;
  }
  
  const renderMainApp = (mainContent) => (
    <div className="flex bg-[#0f172a] text-white min-h-screen">
      <Sidebar 
        user={user} 
        onNav={handleNav}
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)} // Pass the toggle function
      />
      <div className="flex-1">
        {mainContent}
      </div>
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
    case 'board':
      mainContent = <BoardView />;
      break;
    default:
      mainContent = <CreateGameWizard onCreated={handleGameCreated} />;
  }

  return renderMainApp(mainContent);
}