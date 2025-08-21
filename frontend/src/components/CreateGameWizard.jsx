import React, { useState } from 'react';
import api from '../services/api';

export default function CreateGameWizard({ onCreated }) {
  const [gameSpeed, setGameSpeed] = useState('Regular');
  const [betAmount, setBetAmount] = useState(10);
  const [audioLanguage, setAudioLanguage] = useState('Amharic Male');
  const [callSpeed, setCallSpeed] = useState(10);
  const [winningPattern, setWinningPattern] = useState('All Common Patterns');
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSpeedButtonClass = (speed) => gameSpeed === speed ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300';
  const cardNumbers = Array.from({ length: 100 }, (_, i) => i + 1);

  const toggleCardSelection = (cardNumber) => {
    setSelectedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardNumber)) next.delete(cardNumber);
      else next.add(cardNumber);
      return next;
    });
  };

  const selectAll = () => setSelectedCards(new Set(cardNumbers));
  const deselectAll = () => setSelectedCards(new Set());

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const resp = await api.post('/games/create/', {
        amount: betAmount,
        game_type: gameSpeed,
        winning_pattern: winningPattern,
        active_cards: Array.from(selectedCards),
      });
      onCreated(resp.data, { callSpeed, audioLanguage });
    } catch (err) {
      setError(err.response?.data?.detail || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-6 bg-[#0f172a] text-white min-h-screen">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-2 mb-6">
          <button type="button" onClick={() => setGameSpeed('Regular')} className={`px-4 py-2 rounded-md font-semibold ${getSpeedButtonClass('Regular')}`}>Regular Bingo</button>
          <button type="button" onClick={() => setGameSpeed('Fast')} className={`px-4 py-2 rounded-md font-semibold ${getSpeedButtonClass('Fast')}`}>Fast Bingo</button>
          <button type="button" onClick={() => setGameSpeed('Super Fast')} className={`px-4 py-2 rounded-md font-semibold ${getSpeedButtonClass('Super Fast')}`}>Super Fast Bingo</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Bet Amount</label>
            <input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md" placeholder="Enter amount" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Winning Pattern</label>
            <select value={winningPattern} onChange={(e) => setWinningPattern(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md">
              <option>All Common Patterns</option><option>Full House</option><option>L Shape</option><option>Both Diagonal Line</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Audio Language</label>
            <select value={audioLanguage} onChange={(e) => setAudioLanguage(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md">
              <option>Amharic Male</option><option>Amharic Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Call Speed</label>
            <select value={callSpeed} onChange={(e) => setCallSpeed(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md">
              <option value={5}>5 seconds</option><option value={6}>6 seconds</option><option value={7}>7 seconds</option><option value={10}>10 seconds</option><option value={15}>15 seconds</option>
            </select>
          </div>
        </div>
        
        <div className="bg-[#1e2b3a] p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold">Select Active Cards</h3>
              <p className="text-sm text-gray-400">{selectedCards.size} of 100 selected</p>
            </div>
            <div className="flex space-x-2">
              <button type="button" onClick={selectAll} className="px-3 py-1 bg-blue-600 rounded-md text-sm">Select All</button>
              <button type="button" onClick={deselectAll} className="px-3 py-1 bg-gray-600 rounded-md text-sm">Deselect All</button>
            </div>
          </div>
          <div className="grid grid-cols-10 md:grid-cols-20 gap-2">
            {cardNumbers.map(num => (
              <button type="button" key={num} onClick={() => toggleCardSelection(num)} className={`w-12 h-12 flex items-center justify-center rounded-md font-semibold transition-colors ${selectedCards.has(num) ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'}`}>
                {num}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="text-red-400 mt-4 text-center font-semibold">{error}</div>}
        <div className="mt-8 text-center">
            <button 
              type="submit" 
              className="px-10 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 disabled:bg-gray-500"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Game'}
            </button>
        </div>
      </form>
    </div>
  );
}