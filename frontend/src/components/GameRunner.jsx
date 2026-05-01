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
  return s === 'true' || s === '1' || s === 'yes' || s === 'win' || s === 'won' || s === 'winner';
};

const playAudio = (src, onEndedCallback) => {
  try {
    const audio = new Audio(src);
    if (onEndedCallback) audio.onended = onEndedCallback;
    audio.play().catch(() => { if (onEndedCallback) onEndedCallback(); });
  } catch (error) {
    if (onEndedCallback) onEndedCallback();
  }
};

const CardCheckModal = ({ checkResult, calledNumbers, onClose, voiceFolder }) => {
  if (!checkResult || !checkResult.card_data) return null;
  const isWinner = parseBooleanLike(checkResult.is_winner) || parseBooleanLike(checkResult.winner) || (typeof checkResult.result === 'string' && checkResult.result.toLowerCase().includes('win'));
  const { card_number, board } = checkResult.card_data;
  const rows = Array.from({ length: 5 }).map((_, r) => Array.from({ length: 5 }, (_, c) => board[c][r]));
  
  const isCellCalled = (col, row, val) => {
    if (val === 'FREE' || val === '★') return true;
    return calledNumbers.has(Number(val));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] p-6 rounded-xl w-full max-w-lg border border-gray-700">
        <h2 className="text-white text-xl font-bold mb-4">Card #{card_number}</h2>
        <div className={"p-4 rounded-lg mb-4 text-center font-black " + (isWinner ? 'bg-green-600 text-white' : 'bg-red-600 text-white')}>
          {isWinner ? 'WINNER!' : 'NO WIN'}
        </div>
        <table className="w-full border-separate border-spacing-1">
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>{row.map((val, c) => (
                <td key={c} className={"h-12 w-12 text-center font-bold rounded " + (isCellCalled(c,r,val) ? (isWinner ? 'bg-green-500 text-white' : 'bg-red-600 text-white') : 'bg-gray-800 text-gray-400')}>
                  {val === "FREE" ? '★' : val}
                </td>
              ))}</tr>
            ))}
          </tbody>
        </table>
        <button onClick={onClose} className="mt-6 w-full py-3 bg-gray-600 rounded-lg text-white font-bold">Close</button>
      </div>
    </div>
  );
};

export default function GameRunner({ game, token, onNav, callSpeed, audioLanguage }) {
  const [calledNumbers, setCalledNumbers] = useState(new Set(game.called_numbers || []));
  const [countdown, setCountdown] = useState(callSpeed);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [cardNumberToCheck, setCardNumberToCheck] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const socketRef = useRef(null);

  const voiceFolder = 'male';

  useEffect(() => {
    const url = "ws://127.0.0.1:8000/ws/game/" + game.id + "/?token=" + token;
    socketRef.current = new WebSocket(url);
    socketRef.current.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.action === "call_number") {
        const n = data.number;
        setCalledNumbers(prev => new Set(prev).add(n));
        setIsAudioPlaying(true);
        const file = "/audio/" + voiceFolder + "/" + getBingoLetter(n) + (n < 10 ? "0" + n : n) + ".mp3";
        playAudio(file, () => setIsAudioPlaying(false));
        setCountdown(callSpeed);
      }
    };
    socketRef.current.onopen = () => playAudio("/audio/" + voiceFolder + "/game_start.mp3", () => setIsPaused(false));
    return () => socketRef.current?.close();
  }, [game.id, token, callSpeed]);

  useEffect(() => {
    if (isPaused || isAudioPlaying) return;
    const timer = setInterval(() => {
      setCountdown(p => {
        if (p <= 1) {
          socketRef.current?.send(JSON.stringify({ action: 'call_next' }));
          return callSpeed;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, isAudioPlaying, callSpeed]);

  const handleShuffle = () => playAudio("/audio/" + voiceFolder + "/shuffle.mp3");
  const handleEndGame = () => { setIsPaused(true); playAudio("/audio/" + voiceFolder + "/game_end.mp3", () => onNav('create')); };

  return (
    <div className="bg-[#081226] min-h-screen p-6 text-white font-sans">
      {isModalVisible && <CardCheckModal checkResult={checkResult} calledNumbers={calledNumbers} onClose={() => setIsModalVisible(false)} voiceFolder={voiceFolder} />}
      <div className="flex gap-4 mb-6">
        <button onClick={handleShuffle} className="bg-teal-600 px-6 py-3 rounded-lg font-black text-xl">🎲 SHUFFLE</button>
        <div className="text-5xl font-black">{isPaused ? '--' : isAudioPlaying ? '🔊' : countdown}</div>
      </div>
      <input type="number" value={cardNumberToCheck} onChange={e => setCardNumberToCheck(e.target.value)} className="p-3 text-black rounded-lg" placeholder="Card #" />
      <button onClick={async () => {
        try { const res = await api.get("/check_win/" + game.id + "/" + cardNumberToCheck + "/"); setCheckResult(res.data); setIsModalVisible(true); } 
        catch { alert("Card not found"); }
      }} className="bg-yellow-500 p-3 ml-2 text-black font-bold rounded-lg">CHECK</button>
      <button onClick={handleEndGame} className="bg-red-600 p-3 ml-2 text-white font-bold rounded-lg">END GAME</button>
    </div>
  );
}
