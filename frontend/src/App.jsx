import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import CreateGameWizard from './components/CreateGameWizard';
import GameRunner from './components/GameRunner';
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
      api.get('/me/').then(r => { setUser(r.data); setAuthed(true); }).catch(() => {
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
  
  if (view === 'create') {
    return <CreateGameWizard onCreated={handleGameCreated} />;
  }
  
  if (view === 'runner' && currentGame) {
    return <GameRunner game={currentGame} token={token} callSpeed={gameSettings.callSpeed} audioLanguage={gameSettings.audioLanguage} />;
  }

  return <div><button onClick={() => setView('create')}>Start Over</button></div>;
}