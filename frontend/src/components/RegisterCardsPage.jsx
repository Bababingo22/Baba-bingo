import React, { useState } from 'react';
import api from '../services/api';

export default function RegisterCardsPage({ game, onStartGame }) {
  const [activeGame, setActiveGame] = useState(game);
  const [newCard, setNewCard] = useState('');
  const [loading, setLoading] = useState(false);
  
  // NEW: State for our custom error popup
  const [errorPopup, setErrorPopup] = useState({ show: false, message: '' });

  const prizeAmount = ((activeGame.amount || 0) * (activeGame.active_card_numbers?.length || 0) * (1 - (activeGame.commission_percentage || 0)/100)).toFixed(2);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCard) return;
    setLoading(true);
    try {
      const res = await api.post(`/games/${activeGame.id}/add_card/`, { card_number: newCard });
      setActiveGame(res.data);
      setNewCard('');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Failed to add card";
      
      // If the backend says it's already in the game, show our custom Amharic message
      if (errorMsg.includes("already in this game")) {
        setErrorPopup({ show: true, message: `Card #${newCard} ተይዟል (Already Taken)` });
      } else {
        setErrorPopup({ show: true, message: errorMsg });
      }
      setNewCard(''); // Clear the input so they can type the next one quickly
    } finally {
      setLoading(false);
    }
  };

  const sortedCards = [...(activeGame.active_card_numbers || [])].sort((a, b) => a - b);

  return (
    <div className="bg-[#081226] min-h-screen flex flex-col items-center justify-center p-6 text-white font-sans relative">
      
      {/* NEW: Custom Error Popup Modal */}
      {errorPopup.show && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#111827] p-8 rounded-2xl border-2 border-red-600 w-full max-w-sm shadow-[0_0_30px_rgba(220,38,38,0.4)] text-center transform transition-all scale-105">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-black text-white mb-6">{errorPopup.message}</h3>
            <button 
              onClick={() => setErrorPopup({ show: false, message: '' })}
              className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-xl font-bold text-xl transition-transform active:scale-95"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#111827] p-8 rounded-2xl border border-gray-800 w-full max-w-2xl shadow-2xl">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-yellow-500 mb-2">GAME #{activeGame.id}</h2>
          <p className="text-gray-400 font-bold tracking-widest uppercase">Registration Phase</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 text-center">
            <div className="text-xs text-gray-500 font-bold uppercase mb-1">Registered Cards</div>
            <div className="text-4xl font-black">{activeGame.active_card_numbers?.length || 0}</div>
          </div>
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 text-center">
            <div className="text-xs text-gray-500 font-bold uppercase mb-1">Total Prize</div>
            <div className="text-3xl font-black text-green-500 mt-1">{prizeAmount} ETB</div>
          </div>
        </div>

        <form onSubmit={handleAddCard} className="flex gap-2 mb-8">
          <input 
            type="number" 
            value={newCard} 
            onChange={(e) => setNewCard(e.target.value)} 
            placeholder="Enter Card #" 
            className="flex-1 bg-gray-950 border-2 border-gray-700 p-4 rounded-xl text-xl font-bold text-white focus:border-yellow-500 outline-none transition-colors"
          />
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-8 font-black rounded-xl text-xl transition-transform active:scale-95 disabled:opacity-50 shadow-lg">
            + ADD
          </button>
        </form>

        <div className="mb-8">
          <h3 className="text-xs text-gray-500 font-bold uppercase mb-3 tracking-widest">Active Card List</h3>
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 max-h-48 overflow-y-auto">
            {sortedCards.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {sortedCards.map(num => (
                  <div key={num} className="bg-gray-800 text-yellow-500 font-black px-3 py-1.5 rounded-md border border-gray-700 text-sm">
                    #{num}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 font-bold py-4 italic">No cards registered yet.</div>
            )}
          </div>
        </div>

        <button onClick={() => onStartGame(activeGame)} className="w-full bg-green-600 hover:bg-green-500 py-5 rounded-xl font-black text-2xl tracking-widest uppercase shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all active:scale-95 border-b-4 border-green-800 active:border-b-0 active:translate-y-1">
          START CALLING ▶
        </button>
      </div>
    </div>
  );
}