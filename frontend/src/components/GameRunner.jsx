import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';

const getBingoLetter = (number) => {
  if (number >= 1 && number <= 15) return 'B';
  if (number >= 16 && number <= 30) return 'I';
  if (number >= 31 && number <= 45) return 'N';
  if (number >= 46 && number <= 60) return 'G';
  if (number >= 61 && number <= 75) return 'O';
  return '';
};

const getLetterColorClass = (letter) => {
  switch (letter) {
    case 'B': return 'border-blue-500';
    case 'I': return 'border-green-500';
    case 'N': return 'border-yellow-500';
    case 'G': return 'border-red-500';
    case 'O': return 'border-purple-500';
    default: return 'border-gray-500';
  }
};

/* Helper to coerce various truthy/falsey winner signals into a boolean */
const parseBooleanLike = (v) => {
  if (v === undefined || v === null) return false;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes' || s === 'win' || s === 'won' || s === 'winner';
  }
  return false;
};

const CardCheckModal = ({ checkResult, calledNumbers, onClose }) => {
  if (!checkResult || !checkResult.card_data) return null;

  const isWinner =
    parseBooleanLike(checkResult.is_winner) ||
    parseBooleanLike(checkResult.winner) ||
    parseBooleanLike(checkResult.card_data?.is_winner) ||
    (typeof checkResult.result === 'string' && checkResult.result.toLowerCase().includes('win'));

  const { card_data } = checkResult;
  const { card_number, board } = card_data;
  const headers = ['B', 'I', 'N', 'G', 'O'];
  const colors = ['bg-blue-500', 'bg-red-500', 'bg-orange-400', 'bg-green-500', 'bg-purple-500'];
  const rows = Array.from({ length: 5 }).map((_, r) => Array.from({ length: 5 }, (_, c) => board[c][r]));

  const isCellCalled = (cellValue) => {
    if (cellValue === 'FREE') return false;
    const numeric = Number(cellValue);
    if (!Number.isNaN(numeric)) {
      return calledNumbers.has(numeric);
    }
    return calledNumbers.has(cellValue);
  };

  // Handlers for Good/Bad buttons: play audio then close modal
  const handleBad = () => {
    playAudio('/audio/bad.mp3');
    onClose();
  };

  const handleGood = () => {
    playAudio('/audio/Good.mp3');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Card check result">
      <div className="bg-[#1f2937] p-6 rounded-lg shadow-2xl w-full max-w-2xl">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Yaba Bingo</h2>
            <p className="text-sm text-gray-300">Card Number: <span className="font-medium">{card_number}</span></p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-300 hover:text-white">✕</button>
        </header>

        <div className={`p-3 rounded-md mb-4 ${isWinner ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <h3 className="text-center text-2xl font-bold">{isWinner ? 'ዘግቷል' : 'አልዘጋም'}</h3>
        </div>

        <div className="overflow-auto">
          <table className="w-full border-separate" style={{ borderSpacing: '6px' }}>
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={h} className={`w-1/5 text-center text-lg font-semibold p-2 text-white rounded-md ${colors[i]}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cellValue, colIndex) => {
                    const isFreeSpace = cellValue === "FREE";
                    const called = isCellCalled(cellValue);
                    // Called numbers: no yellow background, only yellow text + glow/shadow
                    const cellClass = called
                      ? 'bg-transparent text-yellow-400 font-bold shadow-[0_0_12px_rgba(250,204,21,0.9)] scale-105 transition-all duration-200'
                      : isFreeSpace
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-black';
                    return (
                      <td
                        key={`${colIndex}-${rowIndex}`}
                        className={`text-center font-semibold text-lg h-14 rounded-md ${cellClass}`}
                      >
                        {isFreeSpace ? '★' : cellValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleBad}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium"
          >
            Bad
          </button>

          <button
            onClick={handleGood}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
          >
            Good
          </button>
        </div>
      </div>
    </div>
  );
};

const NumberGrid = ({ calledNumbers }) => {
  const headers = ['B', 'I', 'N', 'G', 'O'];
  const headerColors = ['bg-blue-600', 'bg-green-600', 'bg-yellow-500', 'bg-red-600', 'bg-purple-600'];

  return (
    <section className="bg-[#0b1220] p-4 rounded-lg shadow-inner h-full min-h-[260px] flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">Called Numbers</h4>
        <span className="text-sm text-gray-300">Grid 1–75</span>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-separate" style={{ borderSpacing: '6px' }}>
          <thead>
            <tr>
              {headers.map((letter, index) => (
                <th key={letter} className={`text-white font-semibold text-lg text-center rounded-md ${headerColors[index]} py-2`}>{letter}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 15 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: 5 }).map((_, colIndex) => {
                  const num = colIndex * 15 + rowIndex + 1;
                  const isCalled = calledNumbers.has(num);
                  // Only the number glows (yellow text + shadow), no yellow background
                  const cellClass = isCalled
                    ? 'bg-transparent text-yellow-400 font-bold shadow-[0_0_12px_rgba(250,204,21,0.9)] transform scale-105 transition-all duration-200'
                    : 'bg-transparent text-gray-300';
                  return (
                    <td
                      key={num}
                      className={`text-center font-semibold text-base py-2 rounded ${cellClass}`}
                      aria-pressed={isCalled}
                    >
                      {num}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// Robust audio play helper
const playAudio = (src) => {
  try {
    const audio = new Audio(src);
    audio.play().catch(() => {
      // play may fail silently if user hasn't interacted — ignore
    });
  } catch (error) {
    console.error(`Failed to play audio: ${src}`, error);
  }
};

export default function GameRunner({ game, token, user, callSpeed, audioLanguage, onNav }) {
  const [calledNumbers, setCalledNumbers] = useState(new Set(game.called_numbers || []));
  const [isPaused, setIsPaused] = useState(true);
  const [cardNumberToCheck, setCardNumberToCheck] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [countdown, setCountdown] = useState(callSpeed);
  const [checkResult, setCheckResult] = useState(null);
  const socketRef = useRef(null);

  const prizeAmount = (() => {
    if (!game || !user || !game.active_card_numbers) return '0.00';
    const totalPot = game.amount * game.active_card_numbers.length;
    const commissionAmount = totalPot * (user.commission_percentage / 100);
    const prize = totalPot - commissionAmount;
    return prize.toFixed(2);
  })();

  useEffect(() => {
    const wsProto = window.location.protocol === "https:" ? "wss" : "ws";
    const apiHost = (import.meta.env.VITE_API_BASE || "http://localhost:8000").replace(/^https?:\/\//, "").replace(/\/api$/, "");
    const url = `${wsProto}://${apiHost}/ws/game/${game.id}/?token=${token}`;
    socketRef.current = new WebSocket(url);

    socketRef.current.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.action === "call_number") {
        const newNumber = data.number;
        setCalledNumbers(prev => {
          const next = new Set(prev);
          next.add(newNumber);
          return next;
        });
        setCurrentNumber(prev => { if (prev) { setCallHistory(h => [prev, ...h]); } return newNumber; });

        const voiceFolder = audioLanguage === 'Amharic Male' ? 'male' : 'female';
        const numberFile = `${getBingoLetter(newNumber)}${newNumber}.mp3`;
        playAudio(`/audio/${voiceFolder}/${numberFile}`);

        setCountdown(callSpeed);
      }
    };

    socketRef.current.onopen = () => {
      const voiceFolder = audioLanguage === 'Amharic Male' ? 'male' : 'female';
      playAudio(`/audio/${voiceFolder}/game_start.mp3`);
      setIsPaused(false);
    };

    return () => { if (socketRef.current) socketRef.current.close(); };
  }, [game.id, token, audioLanguage, callSpeed]);

  useEffect(() => {
    if (isPaused) return;
    const timerId = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ action: 'call_next' }));
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [isPaused, callSpeed]);

  async function handleCheckCard() {
    if (!cardNumberToCheck) return alert("Please enter a card number.");
    try {
      const response = await api.get(`/check_win/${game.id}/${cardNumberToCheck}/`);
      setCheckResult(response.data);
      setIsModalVisible(true);
    } catch (error) {
      alert(`Error: ${error.response?.data?.detail || 'Card not found.'}`);
    }
  }

  const handleEndGame = () => {
    setIsPaused(true);
    const voiceFolder = audioLanguage === 'Amharic Male' ? 'male' : 'female';
    playAudio(`/audio/${voiceFolder}/game_end.mp3`);
    setTimeout(() => { onNav('create'); }, 1500);
  };

  return (
    <>
      {isModalVisible && <CardCheckModal checkResult={checkResult} calledNumbers={calledNumbers} onClose={() => setIsModalVisible(false)} />}

      <main className="bg-[#081226] text-white min-h-screen p-6">
        <div className="max-w-[1200px] mx-auto">
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Game #{game?.id} — Live Runner</h1>
              <p className="text-sm text-gray-300 mt-1">Manage calls, check cards and end the game.</p>
            </div>
            <div className="flex gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-300">Prize Pool</div>
                <div className="text-lg font-semibold text-emerald-400">{prizeAmount} Birr</div>
              </div>
              <div className="bg-[#0f172a] px-3 py-2 rounded-md shadow-sm text-sm">
                <div className="text-gray-300">Active Cards</div>
                <div className="font-semibold">{game?.active_card_numbers?.length || 0}</div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-[420px_1fr] gap-6">
            <div className="flex flex-col gap-4">
              <NumberGrid calledNumbers={calledNumbers} />

              <div className="bg-[#0f172a] p-4 rounded-lg shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-300">Total Calls</div>
                  <div className="text-4xl font-bold">{calledNumbers.size}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-300">Status</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${isPaused ? 'bg-yellow-500 text-black' : 'bg-green-600 text-white'}`}>
                    {isPaused ? 'Paused' : 'Running'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-[#0f172a] p-4 rounded-lg shadow-sm flex flex-col md:flex-row items-center md:items-stretch gap-4">
                <div className="flex-0 md:w-44 w-full">
                  <div className="text-sm text-gray-300 mb-2">Next Number</div>
                  <div className="bg-gradient-to-br from-[#0ea5a4] to-[#065f46] text-white rounded-lg py-6 text-center text-5xl font-extrabold shadow-inner">
                    <span aria-live="polite">{isPaused ? '-' : countdown}</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <button
                    onClick={() => setIsPaused(prev => !prev)}
                    className={`w-full py-3 rounded-md font-semibold ${isPaused ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-orange-500 hover:bg-orange-600'} transition-colors`}
                    aria-pressed={!isPaused}
                  >
                    {isPaused ? 'Resume Calls' : 'Pause Calls'}
                  </button>

                  <div className="flex gap-2">
                    <label htmlFor="card-check" className="sr-only">Card Number</label>
                    <input
                      id="card-check"
                      type="number"
                      placeholder="Card #"
                      value={cardNumberToCheck}
                      onChange={(e) => setCardNumberToCheck(e.target.value)}
                      className="flex-1 bg-[#071122] border border-gray-700 rounded-md px-3 py-2 placeholder:text-gray-400 text-white"
                    />
                    <button onClick={handleCheckCard} className="px-4 py-2 bg-yellow-500 text-black rounded-md font-medium">Check</button>
                  </div>

                  <button onClick={handleEndGame} className="w-full py-3 rounded-md bg-red-600 hover:bg-red-700 font-semibold">End Game</button>
                </div>
              </div>

              <div className="bg-[#0f172a] p-4 rounded-lg shadow-sm flex-1">
                <h3 className="text-lg font-semibold mb-3">Current & Recent Calls</h3>
                <div className="flex flex-wrap gap-3 items-start">
                  {currentNumber && (
                    <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${getLetterColorClass(getBingoLetter(currentNumber))} bg-[#051322]`}>
                      <span className="text-lg font-bold text-white">{getBingoLetter(currentNumber)}{currentNumber}</span>
                    </div>
                  )}

                  {callHistory.length > 0 ? callHistory.slice(0, 12).map((num, i) => (
                    <div key={i} className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${getLetterColorClass(getBingoLetter(num))} bg-[#071423]`}>
                      <span className="text-base font-semibold text-white">{getBingoLetter(num)}{num}</span>
                    </div>
                  )) : (
                    <div className="text-sm text-gray-400">No calls yet. Recent numbers will appear here.</div>
                  )}
                </div>
              </div>

              <footer className="text-xs text-gray-400">
                Tip: Use "Check" to validate a card quickly. This interface is read-only for game-critical actions.
              </footer>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}