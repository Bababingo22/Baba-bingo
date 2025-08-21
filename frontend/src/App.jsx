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
  const [view, setView] = useState('dashboard');
  const [currentGame, setCurrentGame] = useState(null);
  const [gameSettings, setGameSettings] = useState({});
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  // This is the key to fixing the flicker
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      setTokenState(t);
      api.get("/me/")
        .then(r => {
          // SUCCESS: The token is valid
          setUser(r.data);
          setAuthed(true);
        })
        .catch(() => {
          // FAILURE: The token is invalid
          localStorage.removeItem("token");
          setToken(null);
          setAuthed(false);
        })
        .finally(() => {
          // ALWAYS RUNS: The check is complete
          setIsLoading(false);
        });
    } else {
      // No token exists, so we are done loading
      setIsLoading(false);
    }
  }, []);

  function handleLogin({ token, user }) {
    localStorage.setItem("token", token);
    setToken(token);
    setTokenState(token);
    setUser(user);
    setAuthed(true);
  }

  function handleGameCreated(game, settings) {
    setCurrentGame(game);
    setGameSettings(settings);
    setView("runner");
  }

  const handleNav = (newView) => {
    setView(newView);
  };

  // --- THIS IS THE NEW RENDER LOGIC ---
  
  // 1. If we are still checking the token, show a loading screen.
  if (isLoading) {
    return <div className="bg-[#0f172a] min-h-screen flex items-center justify-center text-white">Verifying Session...</div>;
  }

  // 2. After loading, if we are not authenticated, show the login page.
  if (!authed) {
    return <Login onLogin={handleLogin} />;
  }

  // 3. If we are authenticated, show the correct application view.
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

  return (
    <div className="flex bg-[#0f172a] text-white min-h-screen">
      <Sidebar 
        user={user} 
        onNav={handleNav}
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />
      <main className="flex-1 overflow-y-auto">
        {view === 'dashboard' && <CreateGameWizard onCreated={handleGameCreated} />}
        {view === 'report' && <TransactionHistory />}
      </main>
    </div>
  );
}