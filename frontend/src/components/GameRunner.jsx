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

const CardCheckModal = ({ cardData, calledNumbers, onClose }) => {
  if (!cardData) return null;
  const headers = ['B', 'I', 'N', 'G', 'O'];
  const rows = Array.from({ length: 5 }).map((_, r) => Array.from({ length: 5 }, (_, c) => cardData.board[c][r]));
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[#2d3748] p-6 rounded-lg shadow-xl relative w-auto max-w-md">
        <h2 className="text-3xl font-bold text-center mb-4 text-white">Card #{cardData.card_number}</h2>
        <table className="w-full border-separate border-spacing-1">
          <thead>
            <tr>{headers.map(h => <th key={h} className="w-1/5 text-center text-2xl font-bold p-2 text-white bg-[#1a202c] rounded-md">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cellValue, colIndex) => {
                  const isCalled = cellValue !== "FREE" && calledNumbers.has(cellValue);
                  return <td key={`${colIndex}-${rowIndex}`} className={`text-center font-bold text-3xl h-20 rounded-md transition-colors ${isCalled ? 'bg-green-500 text-white' : 'bg-white text-black'}`}>{cellValue}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-center mt-6"><button onClick={onClose} className="px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">Close</button></div>
      </div>
    </div>
  );
};

// --- THIS IS THE CORRECTED 5x15 NUMBER GRID ---
const NumberGrid = ({ calledNumbers }) => {
  const headers = ['B', 'I', 'N', 'G', 'O'];
  const numbers = Array.from({ length: 75 }, (_, i) => i + 1);

  return (
    <div className="bg-[#1e2b3a] p-4 rounded-lg flex-1">
      <div className="grid grid-cols-16 gap-2 h-full">
        {/* Headers Column */}
        <div className="grid grid-rows-5 gap-2">
          {headers.map(h => <div key={h} className="bg-blue-600 text-yellow-400 font-bold text-xl flex items-center justify-center rounded-md">{h}</div>)}
        </div>
        
        {/* Numbers Grid */}
        <div className="col-span-15 grid grid-cols-15 grid-rows-5 gap-2">
          {numbers.map(num => {
            const isCalled = calledNumbers.has(num);
            return (
              <div key={num} className={`text-center font-semibold text-sm flex items-center justify-center rounded-md transition-colors ${isCalled ? 'text-white font-bold' : 'text-gray-600'}`}>
                {num}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
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
        setCalledNumbers(prev => new Set(prev).add(newNumber));
        setCurrentNumber(prev => { if (prev) { setCallHistory(h => [prev, ...h].slice(0, 4)); } return newNumber; });
        speakText(String(newNumber), audioLanguage);
        setCountdown(callSpeed);
      }
    };

    socketRef.current.onopen = () => {
        speakText("ጨዋታው ጀምሯል", audioLanguage);
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

  function speakText(text, lang) {
    if (!('speechSynthesis' in window)) return;
    const msg = new SpeechSynthesisUtterance(text);
    if (lang === 'Amharic Male' || lang === 'Amharic Female') msg.lang = 'am-ET';
    window.speechSynthesis.speak(msg);
  }

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
    speakText("ጨዋታው ቋሞል", audioLanguage);
    setTimeout(() => { onNav('create'); }, 1000);
  };

  return (
    <>
      {isModalVisible && <CardCheckModal checkResult={checkResult} calledNumbers={calledNumbers} onClose={() => setIsModalVisible(false)} />}
      <div className="bg-[#0f172a] text-white h-screen p-4 flex flex-col gap-4">
        <div className="h-[35%]"> 
          <NumberGrid calledNumbers={calledNumbers} />
        </div>
        <div className="h-[65%] grid grid-cols-[300px_1fr] gap-4">
          <div className="flex flex-col gap-4">
            <div className="bg-[#1e2b3a] p-4 rounded-lg text-center">
              <div className="text-gray-400 font-semibold">Next Number</div>
              <div className="text-8xl font-bold">{isPaused ? '-' : countdown}</div>
            </div>
            <button onClick={() => setIsPaused(prev => !prev)} className={`w-full py-3 rounded-lg font-bold text-xl ${isPaused ? 'bg-blue-600' : 'bg-orange-500'}`}>{isPaused ? 'Resume' : 'Pause'}</button>
            <div className="flex gap-2 mb-2">
              <input type="number" placeholder="Card #" value={cardNumberToCheck} onChange={(e) => setCardNumberToCheck(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-lg" />
              <button onClick={handleCheckCard} className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-md">Check</button>
            </div>
            <button onClick={handleEndGame} className="w-full py-3 rounded-lg font-bold bg-red-600">End game</button>
            <div className="bg-[#1e2b3a] p-4 rounded-lg text-center mt-auto">
              <div className="text-gray-400 font-semibold">Total Calls</div>
              <div className="text-7xl font-bold">{calledNumbers.size}</div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-2xl font-bold text-green-400 text-center">
              {prizeAmount} Birr ደራሽ
            </div>
            <div className="bg-[#1e2b3a] p-4 rounded-lg flex-1 flex items-center justify-center">
              <div className="flex items-center justify-center gap-3">
                {callHistory.length > 0 ? (
                  callHistory.map((num, index) => (
                    <div key={index} className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${index === 0 ? 'border-green-400' : 'border-yellow-400'}`}>
                      <span className="text-4xl font-bold text-white">{getBingoLetter(num)}{num}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">Previous numbers will appear here</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}