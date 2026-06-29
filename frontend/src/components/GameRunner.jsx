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
  if (v === true) return true;
  if (v === 1) return true;
  const s = String(v).trim().toLowerCase();
  if (s === 'true') return true;
  if (s === '1') return true;
  if (s === 'yes') return true;
  if (s === 'win') return true;
  if (s === 'won') return true;
  if (s === 'winner') return true;
  return false;
};

const playAudio = (src, onEndedCallback) => {
  try {
    const audio = new Audio(src);
    if (onEndedCallback) audio.onended = onEndedCallback;
    audio.play().catch((err) => {
      console.warn("Audio blocked:", src);
      if (onEndedCallback) onEndedCallback(); 
    });
  } catch (error) {
    console.error("Failed to play audio: " + src, error);
    if (onEndedCallback) onEndedCallback();
  }
};

const CardCheckModal = ({ checkResult, calledNumbers, onClose, voiceFolder }) => {
  if (!checkResult || !checkResult.card_data) return null;
  const isWinner = parseBooleanLike(checkResult.is_winner);
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

  const handleBad = () => { playAudio("/audio/" + voiceFolder + "/bad.mp3"); onClose(); };
  const handleGood = () => { playAudio("/audio/" + voiceFolder + "/good.mp3"); onClose(); };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#111827] p-6 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-800">
        <header className="flex justify-between mb-4">
          <div><h2 className="text-xl font-bold text-white">WIN CHECKER</h2><p className="text-sm text-gray-400">Card: {card_number}</p></div>
          <button onClick={onClose} className="text-white text-3xl">✕</button>
        </header>
        <div className={"p-4 text-center text-2xl font-black rounded mb-4 " + (isWinner ? 'bg-green-600' : 'bg-red-600')}>
            {isWinner ? 'WINNER!' : 'NO WIN'}
        </div>
        <div className="mt-8 flex gap-4">
          <button onClick={handleBad} className="flex-1 py-4 bg-red-600 rounded-xl font-black text-xl">BAD CALL</button>
          <button onClick={handleGood} className="flex-1 py-4 bg-green-600 rounded-xl font-black text-xl">GOOD WIN</button>
        </div>
      </div>
    </div>
  );
};

const NumberGrid = ({ calledNumbers }) => {
  return (
    <section className="bg-[#0b1220] p-4 rounded-lg h-full">
      <h4 className="text-white font-bold mb-2">Called Numbers</h4>
      <div className="grid grid-cols-5 gap-1">
        {Array.from({ length: 75 }).map((_, i) => {
          const num = i + 1;
          const isCalled = calledNumbers.has(num);
          return (
            <div key={num} className={`p-1 text-center rounded text-xs ${isCalled ? 'bg-yellow-500 text-black font-black' : 'bg-gray-800 text-gray-500'}`}>
              {num}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default function GameRunner({ game, token, user, callSpeed, audioLanguage, onNav }) {
  // START EMPTY: Do not load game.called_numbers here
  const [calledNumbers, setCalledNumbers] = useState(new Set());
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [countdown, setCountdown] = useState(callSpeed);
  const [cardNumberToCheck, setCardNumberToCheck] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [gameSequence, setGameSequence] = useState([]);
  const sequenceIndexRef = useRef(0);

  const voiceFolder = audioLanguage === 'Amharic Male 2' ? 'male2' : 'male';
  const prizeAmount = game ? (game.amount * game.active_card_numbers.length * (1 - game.commission_percentage / 100)).toFixed(2) : '0.00';

  useEffect(() => {
    const storedSeq = localStorage.getItem('vlad:activeGameSequence');
    if (storedSeq) setGameSequence(JSON.parse(storedSeq));
    else if (game.calling_sequence) setGameSequence(game.calling_sequence);
  }, [game]);

  useEffect(() => {
    if (!hasStarted || isPaused || isAudioPlaying) return;
    const timerId = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          const idx = sequenceIndexRef.current;
          if (idx < gameSequence.length) {
            const num = gameSequence[idx];
            setCalledNumbers(s => new Set(s).add(num));
            setCurrentNumber(prevNum => { if (prevNum) setCallHistory(h => [prevNum, ...h]); return num; });
            sequenceIndexRef.current = idx + 1;
            setIsAudioPlaying(true);
            playAudio(`/audio/${voiceFolder}/${getBingoLetter(num)}${num < 10 ? '0'+num : num}.mp3`, () => setIsAudioPlaying(false));
          } else setIsPaused(true);
          return callSpeed;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [hasStarted, isPaused, isAudioPlaying, callSpeed, gameSequence, voiceFolder]);

  const handleStartGame = () => {
    setHasStarted(true);
    setIsAudioPlaying(true);
    playAudio(`/audio/${voiceFolder}/game_start.mp3`, () => { setIsAudioPlaying(false); setIsPaused(false); });
  };

  async function handleCheckCard() {
    try {
      const res = await api.get(`/check_win/${game.id}/${cardNumberToCheck}/?balls_called=${sequenceIndexRef.current}`);
      setCheckResult(res.data);
      setIsModalVisible(true);
    } catch { alert("Connection Error"); }
  }

  return (
    <>
      {isModalVisible && <CardCheckModal checkResult={checkResult} calledNumbers={calledNumbers} onClose={() => setIsModalVisible(false)} voiceFolder={voiceFolder} />}
      <main className="bg-[#081226] text-white min-h-screen p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <NumberGrid calledNumbers={calledNumbers} />
          <div className="bg-[#0f172a] p-4 rounded-xl flex flex-col gap-4">
            <div className="text-center text-7xl font-black py-4 bg-gray-900 rounded">{countdown}</div>
            {!hasStarted ? (
              <button onClick={handleStartGame} className="w-full py-6 bg-green-600 font-black text-2xl rounded-xl">▶ START GAME</button>
            ) : (
              <button onClick={() => setIsPaused(!isPaused)} className="w-full py-6 bg-indigo-600 font-black text-2xl rounded-xl">{isPaused ? '▶ RESUME' : '⏸ PAUSE'}</button>
            )}
            <button onClick={() => playAudio(`/audio/${voiceFolder}/shuffle.mp3`)} className="w-full py-4 bg-teal-600 font-black rounded-xl">🎲 SHUFFLE</button>
            <div className="flex gap-2">
              <input type="number" placeholder="Card #" onChange={(e) => setCardNumberToCheck(e.target.value)} className="flex-1 bg-gray-900 p-4 rounded-xl"/>
              <button onClick={handleCheckCard} className="px-6 bg-yellow-500 text-black font-black rounded-xl">CHECK</button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}