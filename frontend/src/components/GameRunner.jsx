import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';

const getBingoLetter = (number) => { /* ... (This is correct) ... */ };

// --- THIS IS THE NEW, FINAL CardCheckModal ---
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

const NumberGrid = ({ calledNumbers }) => { /* ... (This is correct) ... */ };

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

  const calculatePrize = () => { /* ... (This is correct) ... */ };
  const prizeAmount = calculatePrize();

  useEffect(() => { /* ... (WebSocket logic is correct) ... */ }, [game.id, token, audioLanguage, callSpeed]);
  useEffect(() => { /* ... (Countdown timer logic is correct) ... */ }, [isPaused, socket]);
  function speakNumber(number, lang) { /* ... (This is correct) ... */ }

  // --- THIS IS THE CORRECTED handleCheckCard FUNCTION ---
  async function handleCheckCard() {
    if (!cardNumberToCheck) return alert("Please enter a card number.");
    try {
      // It now calls the correct win-checker API endpoint
      const response = await api.get(`/check_win/${game.id}/${cardNumberToCheck}/`);
      setCheckResult(response.data); // Store the full result object
      setIsModalVisible(true);
    } catch (error) {
      alert(`Error: ${error.response?.data?.detail || 'Card not found.'}`);
    }
  }

  return (
    <>
      <CardCheckModal 
        checkResult={checkResult} 
        calledNumbers={calledNumbers} 
        onClose={() => setIsModalVisible(false)} 
      />
      
      {/* The rest of the JSX is the same */}
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