import React, { useState } from 'react';
import api from '../services/api';

export default function CreateGameWizard({ onCreated }) {
  const [gameSpeed, setGameSpeed] = useState('Regular');
  const [betAmount, setBetAmount] = useState(10);
  const [audioLanguage, setAudioLanguage] = useState('Amharic Male');
  const [callSpeed, setCallSpeed] = useState(10);
  const [winningPattern, setWinningPattern] = useState('All Common Patterns');
  const [error, setError] = useState(null);

  const getSpeedButtonClass = (speed) => gameSpeed === speed ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300';

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const resp = await api.post('/games/create/', {
        amount: betAmount,
        game_type: gameSpeed,
        winning_pattern: winningPattern,
      });
      // Pass both the created game and the settings to the App component
      onCreated(resp.data, { callSpeed, audioLanguage });
    } catch (err) {
      setError(err.response?.data?.detail || 'Error creating game');
    }
  }

  return (
    <div className="p-6 bg-[#1e293b] text-white min-h-screen">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-2 mb-6">
          <button type="button" onClick={() => setGameSpeed('Regular')} className={`px-4 py-2 rounded-md font-semibold ${getSpeedButtonClass('Regular')}`}>Regular Bingo</button>
          <button type="button" onClick={() => setGameSpeed('Fast')} className={`px-4 py-2 rounded-md font-semibold ${getSpeedButtonClass('Fast')}`}>Fast Bingo</button>
          <button type="button" onClick={() => setGameSpeed('Super Fast')} className={`px-4 py-2 rounded-md font-semibold ${getSpeedButtonClass('Super Fast')}`}>Super Fast Bingo</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Bet Amount</label>
            <select value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Winning Pattern</label>
            <select value={winningPattern} onChange={(e) => setWinningPattern(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md">
              <option>All Common Patterns</option>
              <option>Full House</option>
              <option>L Shape</option>
              <option>Both Diagonal Line</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Audio Language</label>
            <select value={audioLanguage} onChange={(e) => setAudioLanguage(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md">
              <option>Amharic Male</option>
              <option>Amharic Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Call Speed</label>
            <select value={callSpeed} onChange={(e) => setCallSpeed(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md">
              <option value={5}>5 seconds</option>
              <option value={6}>6 seconds</option>
              <option value={7}>7 seconds</option>
              <option value={10}>10 seconds</option>
              <option value={15}>15 seconds</option>
            </select>
          </div>
        </div>
        {error && <div className="text-red-400 mt-4">{error}</div>}
        <div className="mt-8 text-center">
            <button type="submit" className="px-10 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600">
                Create Game
            </button>
        </div>
      </form>
    </div>
  );
}