import React, { useState } from "react";
import api, { setToken } from "../services/api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    try {
      const resp = await api.post("/token/", { username, password });
      const token = resp.data.access;
      setToken(token);
      localStorage.setItem("token", token);
      const me = await api.get("/me/");
      onLogin({ token, user: me.data });
    } catch (err) {
      setError("Invalid credentials");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="bg-[#171717] p-8 rounded w-96">
        <h1 className="text-2xl font-bold mb-4">Vlad Bingo</h1>
        {error && <div className="text-red-400 mb-2">{error}</div>}
        <label className="block mb-2 text-sm">Username</label>
        <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full p-2 mb-3 bg-[#111] rounded" />
        <label className="block mb-2 text-sm">Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full p-2 mb-3 bg-[#111] rounded" />
        <button className="w-full py-2 bg-[#F59E0B] text-black rounded">Sign in</button>
      </form>
    </div>
  );
}