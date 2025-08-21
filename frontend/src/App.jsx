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
    });
  };

  // --- THIS IS THE CORRECTED AUTHENTICATION LOGIC ---
  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      setTokenState(t);
      
      // First, verify the token by fetching the user.
      api.get('/me/')
        .then(userResponse => {
          // --- SUCCESS ---
          // The token is valid. Now we are truly authenticated.
          setUser(userResponse.data);
          setAuthed(true); 
          // Now, fetch the rest of the data.
          api.get('/games/history/').then(historyResponse => {
            setGameHistory(historyResponse.data);
          });
        })
        .catch(() => {
          // --- FAILURE ---
          // The token is invalid (expired, etc.). Log the user out.
          localStorage.removeItem('token');
          setToken(null);
          setAuthed(false);
        })
        .finally(() => {
          // --- ALWAYS RUNS ---
          // No matter if it succeeded or failed, the loading process is over.
          setIsLoading(false);
        });
    } else {
      // If there's no token, we are not logged in and we are done loading.
      setIsLoading(false);
    }
  }, []); // The empty array ensures this effect only runs ONCE on app start

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

  // All other views use the main sidebar layout
  return (
    <div className="flex bg-[#0f172a] text-white min-h-screen">
      <Sidebar 
        user={user} 
        gameHistory={gameHistory}
        onNav={handleNav}
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />
      <main className="flex-1 overflow-y-auto">
        {view === 'create' && <CreateGameWizard onCreated={handleGameCreated} />}
        {view === 'report' && <TransactionHistory />}
      </main>
    </div>
  );
}