import React, { useState, useEffect } from 'react';
import api from '../services/api';

const STORAGE_KEYS = {
  CALL_SPEED: 'vlad:lastCallSpeed',
  SELECTED_CARDS: 'vlad:lastSelectedCards'
};

function loadNumber(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const n = JSON.parse(raw);
    return typeof n === 'number' ? n : fallback;
  } catch {
    return fallback;
  }
}

function loadArray(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : fallback;
  } catch {
    return fallback;
  }
}

export default function CreateGameWizard({ onCreated }) {
  const [gameSpeed, setGameSpeed] = useState('Regular');
  // *** START WITH AN EMPTY STRING OR A NUMBER, NOT JUST A NUMBER ***
  const [betAmount, setBetAmount] = useState(10); 
  const [audioLanguage, setAudioLanguage] = useState('Amharic Male');
  const [callSpeed, setCallSpeed] = useState(() => loadNumber(STORAGE_KEYS.CALL_SPEED, 6));
  const initialSelected = loadArray(STORAGE_KEYS.SELECTED_CARDS, []);
  const [selectedCards, setSelectedCards] = useState(() => new Set(initialSelected));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [winningPattern, setWinningPattern] = useState('All Common Patterns');
  const [commissionPercentage, setCommissionPercentage] = useState(20);

  const getSpeedButtonClass = (speed) =>
    gameSpeed === speed ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300';

  const totalCards = 200;
  const cardNumbers = Array.from({ length: totalCards }, (_, i) => i + 1);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_CARDS, JSON.stringify(Array.from(selectedCards)));
    } catch (e) { console.warn('Unable to persist selected cards', e); }
  }, [selectedCards]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CALL_SPEED, JSON.stringify(Number(callSpeed)));
    } catch (e) { console.warn('Unable to persist call speed', e); }
  }, [callSpeed]);

  const toggleCardSelection = (cardNumber) => {
    setSelectedCards((prev) => {
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
        amount: Number(betAmount),
        game_type: gameSpeed,
        winning_pattern: winningPattern,
        active_cards: Array.from(selectedCards),
        call_speed_seconds: Number(callSpeed),
        commission_percentage: Number(commissionPercentage)
      });
      try {
        localStorage.setItem(STORAGE_KEYS.SELECTED_CARDS, JSON.stringify(Array.from(selectedCards)));
        localStorage.setItem(STORAGE_KEYS.CALL_SPEED, JSON.stringify(Number(callSpeed)));
      } catch (e) {
        console.warn('Unable to persist after submit', e);
      }
      onCreated(resp.data, { callSpeed: Number(callSpeed), audioLanguage });
    } catch (err) {
      setError(err.response?.data?.detail || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }

  const commissionOptions = Array.from({ length: 16 }, (_, i) => 20 + i);

  return (
    <div className="p-6 bg-[#0f172a] min-h-screen">
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto text-white">
        <div className="flex flex-wrap gap-2 mb-6">
          <button type="button" onClick={() => setGameSpeed('Regular')} className={`px-4 py-2 rounded-md font-semibold ${getSpeedButtonClass('Regular')}`}>Regular Bingo</button>
          <button type="button" onClick={() => setGameSpeed('Fast')} className={`px-4 py-2 rounded-md font-semibold ${getSpeedButtonClass('Fast')}`}>Fast Bingo</button>
          <button type="button" onClick={() => setGameSpeed('Super Fast')} className={`px-4 py-2 rounded-md font-semibold ${getSpeedButtonClass('Super Fast')}`}>Super Fast Bingo</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Bet Amount</label>
            <input 
              type="number" 
              value={betAmount} 
              min={1} 
              // *** THIS IS THE LINE THAT WAS FIXED ***
              onChange={(e) => setBetAmount(e.target.value)} 
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300" 
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Commission</label>
            <select
              value={commissionPercentage}
              onChange={(e) => setCommissionPercentage(Number(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300"
            >
              {commissionOptions.map(percent => (
                <option key={percent} value={percent}>{percent}%</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Winning Pattern</label>
            <select value={winningPattern} onChange={(e) => setWinningPattern(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300">
              <option>All Common Patterns</option>
              <option>Full House</option>
              <option>L Shape</option>
              <option>Both Diagonal Line</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Call Speed</label>
            <select
              value={callSpeed}
              onChange={(e) => setCallSpeed(Number(e.target.value))}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300"
              aria-label="Call speed (seconds)"
            >
              <option value={3}>3 seconds</option>
              <option value={4}>4 seconds</option>
              <option value={5}>5 seconds</option>
              <option value={6}>6 seconds (default)</option>
              <option value={7}>7 seconds</option>
              <option value={10}>10 seconds</option>
              <option value={15}>15 seconds</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Audio Language</label>
            <select value={audioLanguage} onChange={(e) => setAudioLanguage(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300">
              <option>Amharic Male</option>
            </select>
          </div>

        </div>

        <div className="bg-[#1e2b3a] p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Select Active Cards</h3>
              <p className="text-sm text-gray-400">{selectedCards.size} of {totalCards} selected</p>
            </div>
            <div className="flex space-x-2">
              <button type="button" onClick={selectAll} className="px-3 py-1 bg-blue-600 rounded-md text-sm text-white">Select All</button>
              <button type="button" onClick={deselectAll} className="px-3 py-1 bg-gray-600 rounded-md text-sm text-white">Deselect All</button>
            </div>
          </div>
          <div className="grid grid-cols-10 md:grid-cols-20 gap-2">
            {cardNumbers.map((num) => (
              <button type="button" key={num} onClick={() => toggleCardSelection(num)} className={`w-12 h-12 flex items-center justify-center rounded-md font-semibold transition-colors ${selectedCards.has(num) ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'}`}>
                {num}
              </button>
            ))}
          </div>
        </div>
        {error && <div className="text-red-400 mt-4 text-center font-semibold">{error}</div>}
        <div className="mt-8 text-center">
          <button type="submit" className="px-10 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 disabled:bg-gray-500" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Game'}
          </button>
        </div>
      </form>
    </div>
  );
}