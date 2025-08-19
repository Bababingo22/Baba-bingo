import React, { useEffect, useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import CreateGameWizard from "./components/CreateGameWizard";
import TransactionHistory from "./components/TransactionHistory";
import BoardActivationCenter from "./components/BoardActivationCenter";
import GameRunner from "./components/GameRunner";
import Sidebar from "./components/Sidebar";
import api, { setToken } from "./services/api";

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [currentGame, setCurrentGame] = useState(null);
  const [token, setTokState] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      api.get("/me/").then(r => {
        setUser(r.data);
        setAuthed(true);
      }).catch(()=> {
        setAuthed(false);
        setToken(null);
        localStorage.removeItem("token");
      });
    }
  }, []);

  function onLogin({ token, user }) {
    setToken(token);
    setTokState(token);
    setUser(user);
    setAuthed(true);
  }

  function onStartGame() {
    setView("create");
  }

  function onCreated(game) {
    setCurrentGame(game);
    setView("runner");
  }

  if (!authed) return <Login onLogin={onLogin} />;

  return (
    <div className="flex">
      <Sidebar onNav={setView} profile={user} />
      <div className="flex-1 min-h-screen">
        {view === "dashboard" && <Dashboard user={user} onStartGame={onStartGame} />}
        {view === "create" && <CreateGameWizard onCreated={onCreated} />}
        {view === "transactions" && <TransactionHistory />}
        {view === "runner" && currentGame && <GameRunner game={currentGame} token={token} />}
        {view === "online" && <div className="p-6">Online games list (coming soon)</div>}
      </div>
    </div>
  );
}