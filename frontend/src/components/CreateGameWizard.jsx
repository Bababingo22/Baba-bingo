import React, { useState } from "react";
import api from "../services/api";

export default function CreateGameWizard({ onCreated }) {
  const [gameType, setGameType] = useState("Regular");
  const [speed, setSpeed] = useState("Regular");
  const [winningPattern, setWinningPattern] = useState("Line");
  const [amount, setAmount] = useState(1000);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    try {
      const resp = await api.post("/games/create/", {
        amount,
        game_type: gameType,
        winning_pattern: winningPattern
      });
      onCreated(resp.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Error creating game");
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Create Game (የጨዋታ ፍጥነት)</h2>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <div className="mb-1 text-sm">Game Type</div>
          <select value={gameType} onChange={e=>setGameType(e.target.value)} className="p-2 bg-[#111] rounded">
            <option>Regular</option>
            <option>Fast</option>
            <option>Super Fast</option>
          </select>
        </div>
        <div>
          <div className="mb-1 text-sm">Winning Pattern</div>
          <select value={winningPattern} onChange={e=>setWinningPattern(e.target.value)} className="p-2 bg-[#111] rounded">
            <option>Line</option>
            <option>Full House</option>
            <option>X</option>
          </select>
        </div>
        <div>
          <div className="mb-1 text-sm">Amount (ሚስጥር)</div>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="p-2 bg-[#111] rounded" />
        </div>
        <div>
          <button className="py-2 px-4 bg-[#F59E0B] rounded">Launch Game</button>
        </div>
      </form>
    </div>
  );
}