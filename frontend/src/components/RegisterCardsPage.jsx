import React, { useState } from 'react';
import api from '../services/api';

export default function RegisterCardsPage({ game, onStartGame }) {
  const [activeGame, setActiveGame] = useState(game);
  const [newCard, setNewCard] = useState('');
  const [loading, setLoading] = useState(false);

  const prizeAmount = ((activeGame.amount || 0) * (activeGame.active_card_numbers?.length || 0) * (1 - (activeGame.commission_percentage || 0)/100)).toFixed(2);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCard) return;
    setLoading(true);
    try {
      const res = await api.post(`/games/${activeGame.id}/add_card/`, { card_number: newCard });
      setActiveGame(res.data); // Updates the card count and prize!
      setNewCard('');
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add card");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#081226] min-h-screen flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl text-center">
        <h2 className="text-3xl font-black text-yellow-500 mb-2">GAME #{activeGame.id}</h2>
        <p className="text-gray-400 mb-8 font-bold tracking-widest uppercase">Registration Phase</p>

        <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl mb-8 border border-gray-800">
          <div className="text-left">
            <div className="text-xs text-gray-500 font-bold uppercase">Registered Cards</div>
            <div className="text-4xl font-black">{activeGame.active_card_numbers?.length || 0}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 font-bold uppercase">Total Prize</div>
            <div className="text-3xl font-black text-green-500">{prizeAmount} ETB</div>
          </div>
        </div>

        <form onSubmit={handleAddCard} className="flex gap-2 mb-8">
          <input 
            type="number" 
            value={newCard} 
            onChange={(e) => setNewCard(e.target.value)} 
            placeholder="Enter Card #" 
            className="flex-1 bg-gray-950 border-2 border-gray-700 p-4 rounded-xl text-xl font-bold text-white focus:border-yellow-500 outline-none"
          />
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-6 font-black rounded-xl text-lg transition-transform active:scale-95 disabled:opacity-50">
            + ADD
          </button>
        </form>

        <button onClick={() => onStartGame(activeGame)} className="w-full bg-green-600 hover:bg-green-700 py-5 rounded-xl font-black text-2xl tracking-widest uppercase shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-transform active:scale-95">
          START CALLING ▶
        </button>
      </div>
    </div>
  );
}