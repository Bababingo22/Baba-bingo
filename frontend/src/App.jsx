import React, { useEffect, useState } from 'react';
// ... all other imports ...
import api, { setToken } from './services/api';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // ... other state ...

  const refreshData = () => {
    Promise.all([
      api.get('/me/'),
      api.get('/games/history/')
    ]).then(([userRes, historyRes]) => {
      setUser(userRes.data);
      setGameHistory(historyRes.data);
    }).catch(() => {
      // Handle logout on error
      localStorage.removeItem('token');
      setToken(null);
      setAuthed(false);
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
      api.get('/me/')
        .then(userResponse => {
          setUser(userResponse.data);
          setAuthed(true);
          // Fetch history only after confirming user is valid
          api.get('/games/history/').then(historyResponse => {
            setGameHistory(historyResponse.data);
          });
        })
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
          setAuthed(false);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  function handleLogin({ token, user: loggedInUser }) {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(loggedInUser);
    setAuthed(true);
    refreshData();
  }

  function handleGameCreated(game, settings) {
    setCurrentGame(game);
    setGameSettings(settings);
    setView('runner');
    refreshData(); // Refresh all data after creating a game
  }

  // ... rest of the App component is the same ...
  // Make sure to pass `user` and `gameHistory` to the Sidebar component
}