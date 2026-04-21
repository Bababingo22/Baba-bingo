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

const CardCheckModal = ({ checkResult, calledNumbers, onClose, voiceFolder }) => {
  if (!checkResult || !checkResult.card_data) return null;
  
  const isWinner = parseBooleanLike(checkResult.is_winner) || 
                   parseBooleanLike(checkResult.winner) || 
                   (typeof checkResult.result === 'string' && checkResult.result.toLowerCase().includes('win'));

  const { card_data } = checkResult;
  const { card_number, board } = card_data;
  const headers = ['B', 'I', 'N', 'G', 'O'];
  const colors = ['bg-blue-500', 'bg-red-500', 'bg-orange-400', 'bg-green-500', 'bg-purple-500'];
  const rows = Array.from({ length: 5 }).map((_, r) => Array.from({ length: 5 }, (_, c) => board[c][r]));
  
  const isCellCalled = (colIndex, rowIndex, cellValue) => {
    if (cellValue === 'FREE' || cellValue === '★') return true;
    const numeric = Number(cellValue);
    return !Number.isNaN(numeric) ? calledNumbers.has(numeric) : calledNumbers.has(cellValue);
  };

  // --- SMART WIN PATTERN CHECKER ---
  const getWinningCells = () => {
    const winningSet = new Set();
    if (!isWinner) return winningSet;

    // 1. Check Horizontal Rows
    for (let r = 0; r < 5; r++) {
      let isRowWin = true;
      for (let c = 0; c < 5; c++) {
        if (!isCellCalled(c, r, board[c][r])) isRowWin = false;
      }
      if (isRowWin) {
        for (let c = 0; c < 5; c++) winningSet.add(`${c}-${r}`);
      }
    }

    // 2. Check Vertical Columns
    for (let c = 0; c < 5; c++) {
      let isColWin = true;
      for (let r = 0; r < 5; r++) {
        if (!isCellCalled(c, r, board[c][r])) isColWin = false;
      }
      if (isColWin) {
        for (let r = 0; r < 5; r++) winningSet.add(`${c}-${r}`);
      }
    }

    // 3. Check Diagonals
    let diag1Win = true, diag2Win = true;
    for (let i = 0; i < 5; i++) {
      if (!isCellCalled(i, i, board[i][i])) diag1Win = false;
      if (!isCellCalled(i, 4 - i, board[i][4 - i])) diag2Win = false;
    }
    if (diag1Win) {
      for (let i = 0; i < 5; i++) winningSet.add(`${i}-${i}`);
    }
    if (diag2Win) {
      for (let i = 0; i < 5; i++) winningSet.add(`${i}-${4 - i}`);
    }

    // 4. Check 4 Corners
    if (
      isCellCalled(0, 0, board[0][0]) &&
      isCellCalled(4, 0, board[4][0]) &&
      isCellCalled(0, 4, board[0][4]) &&
      isCellCalled(4, 4, board[4][4])
    ) {
      winningSet.add("0-0");
      winningSet.add("4-0");
      winningSet.add("0-4");
      winningSet.add("4-4");
    }

    return winningSet;
  };

  const winningCells = getWinningCells();

  const handleBad = () => { playAudio(`/audio/${voiceFolder}/bad.mp3`); onClose(); };
  const handleGood = () => { playAudio(`/audio/${voiceFolder}/good.mp3`); onClose(); };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#111827] p-6 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-800">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">WIN CHECKER</h2>
            <p className="text-sm text-gray-400">Card Number: <span className="text-yellow-500 font-mono font-bold">{card_number}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl transition-colors">✕</button>
        </header>

        <div className={`p-4 rounded-lg mb-6 border-2 ${isWinner ? 'bg-green-900/40 border-green-500 text-green-400 animate-pulse' : 'bg-red-900/40 border-red-500 text-red-400'}`}>
          <h3 className="text-center text-3xl font-black italic uppercase tracking-widest">
            {isWinner ? 'WINNER! — ዘግቷል' : 'NO WIN — አልዘጋም'}
          </h3>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-800 bg-[#030712] shadow-inner">
          <table className="w-full border-separate" style={{ borderSpacing: '4px' }}>
            <thead>
              <tr>{headers.map((h, i) => (<th key={h} className={`w-1/5 text-center text-xl font-black p-2 text-white rounded-t-md ${colors[i]}`}>{h}</th>))}</tr>
            </thead>
            <tbody className="bg-gray-900/50">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cellValue, colIndex) => {
                    const isFreeSpace = cellValue === "FREE" || cellValue === "★";
                    const called = isCellCalled(colIndex, rowIndex, cellValue);
                    const isWinningCell = winningCells.has(`${colIndex}-${rowIndex}`);
                    
                    let cellStyle = "bg-gray-800 text-gray-500 border border-gray-700"; // Default
                    
                    if (called) {
                      if (isWinningCell) {
                        // GREEN GLOW FOR WINNING LINES
                        cellStyle = 'bg-green-500 text-white font-black shadow-[0_0_25px_rgba(34,197,94,1)] scale-105 border-2 border-white z-10';
                      } else {
                        // RED FOR USELESS CALLED NUMBERS
                        cellStyle = 'bg-red-600/90 text-white font-bold border border-red-400';
                      }
                    } else if (isFreeSpace) {
                        cellStyle = 'bg-blue-600 text-white font-black'; // Free space style
                    }

                    return (
                      <td key={`${colIndex}-${rowIndex}`} className={`text-center text-2xl h-16 rounded-md transition-all duration-300 ${cellStyle}`}>
                        {isFreeSpace ? '★' : cellValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <button onClick={handleBad} className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xl shadow-lg transform active:scale-95 transition-all uppercase tracking-widest">Bad Call</button>
          <button onClick={handleGood} className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-xl shadow-lg transform active:scale-95 transition-all uppercase tracking-widest">Good Win</button>
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
        <h4 className="text-lg font-semibold text-white uppercase tracking-tighter">Called Numbers</h4>
        <span className="text-xs font-mono text-gray-500">1–75</span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-separate" style={{ borderSpacing: '4px' }}>
          <thead>
            <tr>{headers.map((letter, index) => (<th key={letter} className={`text-white font-bold text-sm text-center rounded ${headerColors[index]} py-1`}>{letter}</th>))}</tr>
          </thead>
          <tbody>
            {Array.from({ length: 15 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: 5 }).map((_, colIndex) => {
                  const num = colIndex * 15 + rowIndex + 1;
                  const isCalled = calledNumbers.has(num);
                  const cellClass = isCalled ? 'bg-yellow-500 text-black font-black shadow-[0_0_8px_rgba(250,204,21,0.6)] scale-105' : 'bg-transparent text-gray-600';
                  return (<td key={num} className={`text-center text-sm py-1.5 rounded transition-all ${cellClass}`}>{num}</td>);
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

const playAudio = (src) => {
  try {
    const audio = new Audio(src);
    audio.play().catch(() => {});
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

  // THE AUDIO FIX: Route exactly to the right folder!
  let voiceFolder = 'male';
  if (audioLanguage === 'Amharic Male 2') voiceFolder = 'male2';
  if (audioLanguage === 'Amharic Male 3') voiceFolder = 'male3';

  const prizeAmount = (() => {
    if (!game || !game.active_card_numbers) return '0.00';
    const totalPot = game.amount * game.active_card_numbers.length;
    const commissionAmount = totalPot * (game.commission_percentage / 100);
    return (totalPot - commissionAmount).toFixed(2);
  })();

  useEffect(() => {
    const wsProto = window.location.protocol === "https:" ? "wss" : "ws";
    const apiHost = (import.meta.env.VITE_API_BASE || "").replace(/^https?:\/\//, "").replace(/\/api$/, "");
    const url = `${wsProto}://${apiHost}/ws/game/${game.id}/?token=${token}`;
    socketRef.current = new WebSocket(url);

    socketRef.current.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.action === "call_number") {
        const newNumber = data.number;
        setCalledNumbers(prev => { const next = new Set(prev); next.add(newNumber); return next; });
        setCurrentNumber(prev => { if (prev) { setCallHistory(h => [prev, ...h]); } return newNumber; });
        const formattedNum = newNumber < 10 ? `0${newNumber}` : newNumber;
        playAudio(`/audio/${voiceFolder}/${getBingoLetter(newNumber)}${formattedNum}.mp3`);
        setCountdown(callSpeed);
      }
    };

    socketRef.current.onopen = () => {
      playAudio(`/audio/${voiceFolder}/game_start.mp3`);
      setIsPaused(false);
    };

    return () => { if (socketRef.current) socketRef.current.close(); };
  }, [game.id, token, callSpeed, voiceFolder]);

  useEffect(() => {
    if (isPaused) return;
    const timerId = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ action: 'call_next' }));
          }
          return callSpeed;
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
      alert(`Error: Card not found or not active.`);
    }
  }

  const handleEndGame = () => {
    setIsPaused(true);
    playAudio(`/audio/${voiceFolder}/game_end.mp3`);
    setTimeout(() => { onNav('create'); }, 1500);
  };

  const handleShuffle = () => {
    playAudio(`/audio/${voiceFolder}/shuffle.mp3`);
  };

  return (
    <>
      {isModalVisible && <CardCheckModal voiceFolder={voiceFolder} checkResult={checkResult} calledNumbers={calledNumbers} onClose={() => setIsModalVisible(false)} />}
      <main className="bg-[#081226] text-white min-h-screen p-6 font-sans">
        <div className="max-w-[1200px] mx-auto">
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">GAME #{game?.id}</h1>
              <p className="text-xs text-gray-500 font-bold tracking-wider">LIVE RUNNER</p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <div className="text-[10px] text-gray-500 font-black uppercase">TOTAL PRIZE</div>
                <div className="text-3xl font-black text-green-500 tracking-tighter">{prizeAmount} <span className="text-xs text-gray-400">ETB</span></div>
              </div>
              <div className="bg-[#0f172a] px-4 py-2 rounded-lg border border-gray-800">
                <div className="text-[10px] text-gray-500 font-black uppercase">CARDS</div>
                <div className="text-xl font-black">{game?.active_card_numbers?.length || 0}</div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-8">
            <div className="flex flex-col gap-6">
              <NumberGrid calledNumbers={calledNumbers} />
              <div className="bg-[#0f172a] p-5 rounded-xl border border-gray-800 flex items-center justify-between shadow-xl">
                <div>
                  <div className="text-[10px] text-gray-500 font-black uppercase">Balls Called</div>
                  <div className="text-5xl font-black text-white">{calledNumbers.size}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 font-black uppercase mb-1">Live Status</div>
                  <div className={`px-4 py-1 rounded-full text-xs font-black uppercase ${isPaused ? 'bg-yellow-500 text-black' : 'bg-green-600 text-white animate-pulse'}`}>
                    {isPaused ? 'Paused' : 'Running'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-[#0f172a] p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
                <div className="flex-0 md:w-48 w-full">
                  <div className="text-[10px] text-gray-500 font-black uppercase mb-2">Next Ball In</div>
                  <div className="bg-gray-900 border-2 border-gray-800 text-green-500 rounded-2xl py-8 text-center text-7xl font-black shadow-inner">
                    <span>{isPaused ? '--' : countdown}</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-4 w-full">
                  <button onClick={handleShuffle} className="w-full py-4 rounded-xl font-black text-xl bg-teal-600 hover:bg-teal-700 border-b-4 border-teal-900 transition-all active:border-b-0 active:translate-y-1">
                    🎲 SHUFFLE (መቀላቀያ)
                  </button>

                  <button onClick={() => setIsPaused(prev => !prev)} className={`w-full py-4 rounded-xl font-black text-xl ${isPaused ? 'bg-indigo-600 hover:bg-indigo-700 border-indigo-900' : 'bg-orange-500 hover:bg-orange-600 border-orange-900'} border-b-4 transition-all active:border-b-0 active:translate-y-1`}>
                    {isPaused ? '▶ RESUME CALLS' : '⏸ PAUSE CALLS'}
                  </button>

                  <div className="flex gap-2">
                    <input type="number" placeholder="Enter Card #" value={cardNumberToCheck} onChange={(e) => setCardNumberToCheck(e.target.value)} className="flex-1 bg-gray-900 border-2 border-gray-800 rounded-xl px-5 py-4 text-2xl font-black focus:border-yellow-500 outline-none transition-colors"/>
                    <button onClick={handleCheckCard} className="px-8 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl font-black text-xl border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1">CHECK</button>
                  </div>
                  <button onClick={handleEndGame} className="w-full py-3 rounded-xl bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white font-black transition-all">END GAME</button>
                </div>
              </div>

              <div className="bg-[#0f172a] p-5 rounded-xl border border-gray-800 shadow-xl flex-1">
                <h3 className="text-xs text-gray-500 font-black uppercase mb-4 tracking-widest">Recent Calls</h3>
                <div className="flex flex-wrap gap-4 items-start">
                  {currentNumber && (
                    <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${getLetterColorClass(getBingoLetter(currentNumber))} bg-gray-900 shadow-[0_0_20px_rgba(255,255,255,0.1)]`}>
                      <span className="text-3xl font-black text-white">{getBingoLetter(currentNumber)}{currentNumber}</span>
                    </div>
                  )}
                  {callHistory.length > 0 ? callHistory.slice(0, 8).map((num, i) => (
                    <div key={i} className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${getLetterColorClass(getBingoLetter(num))} bg-gray-900 opacity-60`}>
                      <span className="text-lg font-black text-white">{getBingoLetter(num)}{num}</span>
                    </div>
                  )) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}