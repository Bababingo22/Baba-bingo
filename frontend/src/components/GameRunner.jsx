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

const CardCheckModal = ({ checkResult, calledNumbers, onClose }) => {
  if (!checkResult || !checkResult.card_data) return null;
  const { is_winner, card_data } = checkResult;
  const { board } = card_data;
  const headers = ['B', 'I', 'N', 'G', 'O'];
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];
  const rows = Array.from({ length: 5 }).map((_, r) => Array.from({ length: 5 }, (_, c) => board[c][r]));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[#2d3748] p-6 rounded-lg shadow-xl relative w-auto max-w-md">
        <div className={`text-center mb-4 p-3 rounded-lg ${is_winner ? 'bg-green-500' : 'bg-red-500'}`}>
          <h2 className="text-3xl font-bold text-white">{is_winner ? 'ዘግቷል' : 'አልዘጋም'}</h2>
        </div>
        <table className="w-full border-separate border-spacing-1">
          <thead>
            <tr>{headers.map((h, i) => <th key={h} className={`w-1/5 text-center text-lg font-bold p-1 text-white rounded-md ${colors[i]}`}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cellValue, colIndex) => {
                  const isCalled = cellValue !== "FREE" && calledNumbers.has(cellValue);
                  const isFreeSpace = cellValue === "FREE";
                  return <td key={`${colIndex}-${rowIndex}`} className={`text-center font-bold text-lg h-12 rounded-md ${isCalled ? 'bg-yellow-400 text-black' : isFreeSpace ? 'bg-blue-600 text-white' : 'bg-gray-300 text-black'}`}>{isFreeSpace ? '★' : cellValue}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-center mt-6">
          <button onClick={onClose} className="px-8 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  );
};

const NumberGrid = ({ calledNumbers }) => {
  const headers = ['B', 'I', 'N', 'G', 'O'];
  return (
    <div className="bg-[#1e2b3a] p-4 rounded-lg h-full">
      <table className="w-full h-full border-separate" style={{ borderSpacing: '4px' }}>
        <tbody>
          {headers.map((letter, rowIndex) => (
            <tr key={letter}>
              <td className="w-12 bg-blue-600 text-yellow-400 font-bold text-2xl text-center rounded-md">{letter}</td>
              {Array.from({ length: 15 }).map((_, colIndex) => {
                const num = rowIndex * 15 + colIndex + 1;
                const isCalled = calledNumbers.has(num);
                return <td key={num} className={`text-center font-semibold text-lg transition-colors duration-300 ${isCalled ? 'text-white font-bold' : 'text-gray-600'}`}>{num}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function GameRunner({ game, token, user, callSpeed, audioLanguage, onNav }) {
  const [socket, setSocket] = useState(null);
  const [calledNumbers, setCalledNumbers] = useState(new Set(game.called_numbers || []));
  const [isPaused, setIsPaused] = useState(true);
  const [cardNumberToCheck, setCardNumberToCheck] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [countdown, setCountdown] = useState(callSpeed);
  
  // This state now holds the full result from the backend
  const [checkResult, setCheckResult] = useState(null);

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
    const url = `${wsProto}/${apiHost}/ws/game/${game.id}/?token=${token}`;
    const s = new WebSocket(url);
    
    s.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.action === "call_number") {
        const newNumber = data.number;
        setCalledNumbers(prev => new Set(prev).add(newNumber));
        setCurrentNumber(prev => { if (prev) { setCallHistory(h => [prev, ...h].slice(0, 4)); } return newNumber; });
        speakNumber(newNumber, audioLanguage);
        setCountdown(callSpeed);
      }
    };
    setSocket(s);
    
    return () => { s.close(); };
  }, [game.id, token, audioLanguage, callSpeed]);

  useEffect(() => {
    if (isPaused || !socket) return;
    
    const timerId = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ action: 'call_next' }));
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isPaused, socket]);

  function speakNumber(number, lang) {
    if (!('speechSynthesis' in window)) return;
    const msg = new SpeechSynthesisUtterance(String(number));
    if (lang === 'Amharic Male' || lang === 'Amharic Female') msg.lang = 'am-ET';
    window.speechSynthesis.speak(msg);
  }

  // --- THIS IS THE CORRECTED FUNCTION ---
  async function handleCheckCard() {
    if (!cardNumberToCheck) return alert("Please enter a card number.");
    try {
      // It now calls the correct endpoint with the game ID
      const response = await api.get(`/check_win/${game.id}/${cardNumberToCheck}/`);
      setCheckResult(response.data); // Store the full result
      setIsModalVisible(true);
    } catch (error) {
      alert(`Error: ${error.response?.data?.detail || 'Card not found.'}`);
    }
  }

  return (
    <>
      {isModalVisible && <CardCheckModal checkResult={checkResult} calledNumbers={calledNumbers} onClose={() => setIsModalVisible(false)} />}
      <div className="bg-[#0f172a] text-white h-screen p-4 flex flex-col gap-4">
        <div className="flex-grow min-h-0"> 
          <NumberGrid calledNumbers={calledNumbers} />
        </div>
        <div className="flex-grow-[2] min-h-0 grid grid-cols-[300px_1fr] gap-4">
          <div className="flex flex-col gap-4">
            <div className="bg-[#1e2b3a] p-4 rounded-lg text-center">
              <div className="text-gray-400 font-semibold">Next Number</div>
              <div className="text-8xl font-bold">{isPaused ? '-' : countdown}</div>
            </div>
            <button onClick={() => setIsPaused(!isPaused)} className={`w-full py-3 rounded-lg font-bold text-xl ${isPaused ? 'bg-blue-600' : 'bg-orange-500'}`}>{isPaused ? 'Resume' : 'Pause'}</button>
            <div className="flex gap-2">
              <input type="number" placeholder="Card #" value={cardNumberToCheck} onChange={(e) => setCardNumberToCheck(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-lg" />
              <button onClick={handleCheckCard} className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-md">Check</button>
            </div>
            <button onClick={() => onNav('create')} className="w-full py-3 rounded-lg font-bold bg-red-600">End game</button>
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