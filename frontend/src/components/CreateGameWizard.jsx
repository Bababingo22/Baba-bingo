import React, { useState, useEffect } from 'react';
import api from '../services/api';

const STORAGE_KEYS = {
  CALL_SPEED: 'yaba:lastCallSpeed',
  SELECTED_CARDS: 'yaba:lastSelectedCards'
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

export default function CreateGameWizard({ onCreated, sidebarExpanded = false }) {
  const [gameSpeed, setGameSpeed] = useState('Regular');
  const [betAmount, setBetAmount] = useState(10);
  const [audioLanguage, setAudioLanguage] = useState('Amharic Male');

  // Default call speed is 6 seconds; load persisted value if present
  const [callSpeed, setCallSpeed] = useState(() => loadNumber(STORAGE_KEYS.CALL_SPEED, 6));

  // selectedCards persisted across refreshes; stored as array of numbers in localStorage
  const initialSelected = loadArray(STORAGE_KEYS.SELECTED_CARDS, []);
  const [selectedCards, setSelectedCards] = useState(() => new Set(initialSelected));

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSpeedButtonClass = (speed) =>
    gameSpeed === speed ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300';

  // Increase available card numbers from 100 to 200
  const totalCards = 200;
  const cardNumbers = Array.from({ length: totalCards }, (_, i) => i + 1);

  // Pagination (page-turn) setup: page size kept at 100 so UI remains similar,
  // but now we have multiple pages. This implements a simple slide animation.
  const pageSize = 100;
  const totalPages = Math.ceil(totalCards / pageSize);
  const [currentPage, setCurrentPage] = useState(0);
  const pages = Array.from({ length: totalPages }, (_, p) =>
    cardNumbers.slice(p * pageSize, (p + 1) * pageSize)
  );

  // persist selected cards and call speed to localStorage so nothing changes after refresh
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_CARDS, JSON.stringify(Array.from(selectedCards)));
    } catch (e) {
      console.warn('Unable to persist selected cards', e);
    }
  }, [selectedCards]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CALL_SPEED, JSON.stringify(Number(callSpeed)));
    } catch (e) {
      console.warn('Unable to persist call speed', e);
    }
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
        call_speed_seconds: Number(callSpeed)
      });
      // save selection as "last used" (already saved via effect, but keep explicit)
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

  // Keep layout in sync with sidebar:
  const marginClass = sidebarExpanded ? 'md:ml-80 ml-16' : 'md:ml-16 ml-16';

  // winningPattern state moved here (was referenced in submit previously)
  const [winningPattern, setWinningPattern] = useState('All Common Patterns');

  // Page turn helpers
  const goPrev = () => setCurrentPage((p) => Math.max(0, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <div className={`${marginClass} transition-all duration-300`}>
      <div className="p-6 bg-[#0f172a] min-h-screen">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto text-white">
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              type="button"
              onClick={() => setGameSpeed('Regular')}
              className={`px-4 py-2 rounded-md font-semibold ${getSpeedButtonClass('Regular')}`}
            >
              Regular Bingo
            </button>
            <button
              type="button"
              onClick={() => setGameSpeed('Fast')}
              className={`px-4 py-2 rounded-md font-semibold ${getSpeedButtonClass('Fast')}`}
            >
              Fast Bingo
            </button>
            <button
              type="button"
              onClick={() => setGameSpeed('Super Fast')}
              className={`px-4 py-2 rounded-md font-semibold ${getSpeedButtonClass('Super Fast')}`}
            >
              Super Fast Bingo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Bet Amount</label>
              <input
                type="number"
                value={betAmount}
                min={1}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Winning Pattern</label>
              <select
                value={winningPattern}
                onChange={(e) => setWinningPattern(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300"
              >
                <option>All Common Patterns</option>
                <option>Full House</option>
                <option>L Shape</option>
                <option>Both Diagonal Line</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Audio Language</label>
              <select
                value={audioLanguage}
                onChange={(e) => setAudioLanguage(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-gray-300"
              >
                <option>Amharic Male</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Call Speed</label>

              {/* Selected indicator: gray background with white text for the value */}
              <div className="text-sm text-gray-300 mb-2">
                Selected:
                <span className="ml-2 inline-block bg-gray-600 text-white font-medium px-2 py-1 rounded">
                  {callSpeed} seconds
                </span>
              </div>

              {/* Keep the interactive select, but make the displayed value gray to match the page */}
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
          </div>

          <div className="bg-[#1e2b3a] p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Select Active Cards</h3>
                <p className="text-sm text-gray-400">{selectedCards.size} of {totalCards} selected</p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex space-x-2 mr-2">
                  <button type="button" onClick={selectAll} className="px-3 py-1 bg-blue-600 rounded-md text-sm text-white">Select All</button>
                  <button type="button" onClick={deselectAll} className="px-3 py-1 bg-gray-600 rounded-md text-sm text-white">Deselect All</button>
                </div>

                {/* Page controls */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={currentPage === 0}
                    className={`px-3 py-1 rounded-md text-sm ${currentPage === 0 ? 'bg-gray-700 text-gray-400' : 'bg-gray-600 text-white'}`}
                  >
                    Prev
                  </button>
                  <div className="text-sm text-gray-300 px-2">Page {currentPage + 1} / {totalPages}</div>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={currentPage === totalPages - 1}
                    className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages - 1 ? 'bg-gray-700 text-gray-400' : 'bg-gray-600 text-white'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Page turn carousel: overflow hidden + sliding inner wrapper */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-400 ease-in-out"
                style={{
                  width: `${totalPages * 100}%`,
                  transform: `translateX(-${currentPage * (100 / totalPages)}%)`
                }}
              >
                {pages.map((pageNums, pageIdx) => (
                  // THIS IS THE CORRECTED LINE:
                  <div key={pageIdx} className="flex-shrink-0" style={{ width: `${100 / totalPages}%` }}>
                    <div className="grid grid-cols-10 md:grid-cols-20 gap-2">
                      {pageNums.map((num) => (
                        <button
                          type="button"
                          key={num}
                          onClick={() => toggleCardSelection(num)}
                          className={`w-12 h-12 flex items-center justify-center rounded-md font-semibold transition-colors ${selectedCards.has(num) ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'}`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
    </div>
  );
}