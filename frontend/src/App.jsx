import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import CreateGameWizard from './components/CreateGameWizard';
import GameRunner from './components/GameRunner';
import Sidebar from './components/Sidebar';
import TransactionHistory from './components/TransactionHistory';
import api, { setToken } from './services/api';

// Helper function to safely get data from localStorage
const getInitialGameState = () => {
  try {
    const savedState = localStorage.getItem('vladBingoGameState');
    return savedState ? JSON.parse(savedState) : { game: null, settings: { callSpeed: 6, audioLanguage: 'Amharic Male' } };
  } catch (e) {
    return { game: null, settings: { callSpeed: 6, audioLanguage: 'Amharic Male' } };
  }
};

export default function App() {
  const [auth, setAuth] = useState({
    isLoading: true, // Start in a loading state
    isAuthenticated: false,
    user: null,
    token: null,
  });
  
  const [gameState, setGameState] = useState(getInitialGameState());
  const [view, setView] = useState(gameState.game ? 'runner' : 'create');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);

  // This is the main effect that runs once to check for a session
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken); // Set token for API calls
        try {
          // Verify token by fetching user data and game history
          const [userResponse, historyResponse] = await Promise.all([
            api.get('/me/'),
            api.get('/games/history/')
          ]);

          setAuth({
            isLoading: false,
            isAuthenticated: true,
            user: userResponse.data,
            token: storedToken,
          });
          setGameHistory(historyResponse.data);
        } catch (error) {
          // If token is invalid/expired, clear it and log out
          localStorage.removeItem('token');
          setToken(null);
          setAuth({ isLoading: false, isAuthenticated: false, user: null, token: null });
        }
      } else {
        // No token found, just finish loading
        setAuth({ isLoading: false, isAuthenticated: false, user: null, token: null });
      }
    };
    
    verifyToken();
  }, []);

  const refreshDashboardData = async () => {
    try {
      const [userResponse, historyResponse] = await Promise.all([
        api.get('/me/'),
        api.get('/games/history/')
      ]);
      setAuth(prev => ({ ...prev, user: userResponse.data }));
      setGameHistory(historyResponse.data);
    } catch (error) {
      console.error("Failed to refresh dashboard data", error);
    }
  };
  
  function handleLogin({ token, user: loggedInUser }) {
    localStorage.setItem('token', token);
    setToken(token);
    setAuth({
      isLoading: false,
      isAuthenticated: true,
      user: loggedInUser,
      token: token,
    });
    refreshDashboardData();
  }

  function handleGameCreated(game, settings) {
    const newGameState = { game, settings };
    localStorage.setItem('vladBingoGameState', JSON.stringify(newGameState));
    setGameState(newGameState);
    setView('runner');
    refreshDashboardData();
  }
  
  const handleNav = (newView) => {
    if (newView !== 'runner') {
      localStorage.removeItem('vladBingoGameState');
      setGameState({ game: null, settings: { callSpeed: 6, audioLanguage: 'Amharic Male' } });
    }
    setView(newView);
  };
  
  if (auth.isLoading) {
    return <div className="bg-[#0f172a] min-h-screen flex items-center justify-center text-white">Verifying Session...</div>;
  }

  if (!auth.isAuthenticated || !auth.user) {
    return <Login onLogin={handleLogin} />;
  }
  
  if (view === 'runner' && gameState.game) {
    return <GameRunner 
              key={gameState.game.id}
              game={gameState.game} 
              token={auth.token} 
              user={auth.user}
              callSpeed={gameState.settings.callSpeed} 
              audioLanguage={gameState.settings.audioLanguage}
              onNav={handleNav}
           />;
  }
  
  const marginClass = isSidebarExpanded ? 'ml-80' : 'ml-16';

  return (
    <div className="flex bg-[#0f172a] text-white min-h-screen">
      <Sidebar 
        user={auth.user} 
        gameHistory={gameHistory}
        onNav={handleNav}
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
        activeView={view}
      />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${marginClass}`}>
        {view === 'create' && <CreateGameWizard onCreated={handleGameCreated} />}
        {view === 'report' && <TransactionHistory />}
      </main>
    </div>
  );
}