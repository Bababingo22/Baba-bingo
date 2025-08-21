import React, { useEffect, useState } from "react";
import Login from "./components/Login";
import CreateGameWizard from "./components/CreateGameWizard";
import GameRunner from "./components/GameRunner";
import Sidebar from "./components/Sidebar";
import TransactionHistory from "./components/TransactionHistory";
import api, { setToken } from "./services/api";

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(localStorage.getItem('token'));
  const [view, setView] = useState("dashboard"); // Default to dashboard
  const [currentGame, setCurrentGame] = useState(null);
  const [gameSettings, setGameSettings] = useState({});
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // This effect runs once to check for an existing token
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      api.get("/me/").then(r => {
        setUser(r.data);
        setAuthed(true);
      }).catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      });
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
  
  if (!authed || !user) {
    return <Login onLogin={handleLogin} />;
  }
  
  // --- FINAL RENDER LOGIC ---
  if (view === 'runner' && currentGame) {
    // GameRunner is a full-page component
    return <GameRunner 
              game={currentGame} 
              token={token} 
              user={user}
              callSpeed={gameSettings.callSpeed} 
              audioLanguage={gameSettings.audioLanguage}
              onNav={handleNav}
           />;
  }

  // All other views use the main sidebar layout
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