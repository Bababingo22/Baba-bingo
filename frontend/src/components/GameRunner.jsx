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

const CardCheckModal = ({ checkResult, calledNumbers, onClose }) => {
  if (!checkResult || !checkResult.card_data) return null;
  const { is_winner, card_data } = checkResult;
  const { card_number, board } = card_data;
  const headers = ['B', 'I', 'N', 'G', 'O'];
  const colors = ['bg-blue-500', 'bg-red-500', 'bg-orange-400', 'bg-green-500', 'bg-purple-500'];
  const rows = Array.from({ length: 5 }).map((_, r) => Array.from({ length: 5 }, (_, c) => board[c][r]));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2d3748] p-6 rounded-lg shadow-xl relative w-full max-w-lg">
        <div className="text-center mb-4 p-3 rounded-lg bg-red-600">
          <h2 className="text-2xl font-bold text-white">Yaba Bingo</h2>
          <p className="text-white text-lg">Card Number: {card_number}</p>
        </div>
        <div className={`text-center mb-4 p-3 rounded-lg ${is_winner ? 'bg-green-500' : 'bg-gray-700'}`}>
          <h2 className="text-4xl font-bold text-white">{is_winner ? 'ዘግቷል' : 'አልዘጋም'}</h2>
        </div>
        <table className="w-full border-separate" style={{ borderSpacing: '6px' }}>
          <thead>
            <tr>{headers.map((h, i) => <th key={h} className={`w-1/5 text-center text-xl font-bold p-2 text-white rounded-md ${colors[i]}`}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cellValue, colIndex) => {
                  const isCalled = cellValue !== "FREE" && calledNumbers.has(cellValue);
                  const isFreeSpace = cellValue === "FREE";
                  return <td key={`${colIndex}-${rowIndex}`} className={`text-center font-bold text-2xl h-16 rounded-md ${isCalled ? 'bg-yellow-400 text-black' : isFreeSpace ? 'bg-blue-600 text-white' : 'bg-gray-300 text-black'}`}>{isFreeSpace ? '★' : cellValue}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-center mt-6">
          <button onClick={onClose} className="px-10 py-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  );
};

const NumberGrid = ({ calledNumbers }) => {
  const headers = ['B', 'I', 'N', 'G', 'O'];
  const headerColors = ['bg-blue-600', 'bg-green-600', 'bg-yellow-500', 'bg-red-600', 'bg-purple-600'];

  return (
    <div className="bg-[#1e2b3a] p-4 rounded-lg h-full">
      <table className="w-full h-full border-separate" style={{ borderSpacing: '4px' }}>
        <thead>
          <tr>
            <th className="w-12"></th> {/* Empty corner */}
            {Array.from({ length: 15 }, (_, i) => (
              <th key={`header-${i + 1}`} className="font-bold text-gray-400 text-sm">{i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {headers.map((letter, rowIndex) => (
            <tr key={letter}>
              <td className={`font-bold text-2xl text-center rounded-md text-white ${headerColors[rowIndex]}`}>{letter}</td>
              {Array.from({ length: 15 }, (_, colIndex) => {
                const num = rowIndex * 15 + colIndex + 1;
                const isCalled = calledNumbers.has(num);
                return (
                  <td
                    key={num}
                    className={`text-center font-semibold text-lg transition-colors duration-300 ${
                      isCalled ? 'text-yellow-400 font-bold' : 'text-gray-600'
                    }`}
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
  const [voices, setVoices] = useState([]);

  const prizeAmount = (() => {
    if (!game || !user || !game.active_card_numbers) return '0.00';
    const totalPot = game.amount * game.active_card_numbers.length;
    const commissionAmount = totalPot * (user.commission_percentage / 100);
    const prize = totalPot - commissionAmount;
    return prize.toFixed(2);
  })();

  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

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
        setCurrentNumber(prev => { if (prev) { setCallHistory(h => [prev, ...h]); } return newNumber; });
        speakText(newNumber, audioLanguage, false);
        setCountdown(callSpeed);
      }
    };

    socketRef.current.onopen = () => {
        speakText("ጨዋታው ጀምሯል", audioLanguage, true);
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

  function speakText(textOrNumber, lang, isAnnouncement = false) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    if (isAnnouncement) {
      const utterance = new SpeechSynthesisUtterance(textOrNumber);
      if (lang === 'Amharic Male' || lang === 'Amharic Female') {
        const amharicVoice = voices.find(voice => voice.lang === 'am-ET');
        if (amharicVoice) utterance.voice = amharicVoice;
        else utterance.lang = 'am-ET';
      }
      window.speechSynthesis.speak(utterance);
    } else {
      const letter = getBingoLetter(textOrNumber);
      const number = String(textOrNumber);
      const letterUtterance = new SpeechSynthesisUtterance(letter);
      letterUtterance.lang = 'en-US';
      const numberUtterance = new SpeechSynthesisUtterance(number);
      if (lang === 'Amharic Male' || lang === 'Amharic Female') {
        const amharicVoice = voices.find(voice => voice.lang === 'am-ET');
        if (amharicVoice) numberUtterance.voice = amharicVoice;
        else numberUtterance.lang = 'am-ET';
      }
      letterUtterance.onend = () => {
        window.speechSynthesis.speak(numberUtterance);
      };
      window.speechSynthesis.speak(letterUtterance);
    }
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
    speakText("ጨዋታው ቋሞል", audioLanguage, true);
    setTimeout(() => { onNav('create'); }, 1000);
  };

  return (
    <>
      {isModalVisible && <CardCheckModal checkResult={checkResult} calledNumbers={calledNumbers} onClose={() => setIsModalVisible(false)} />}
      <div className="bg-[#0f172a] text-white h-screen p-4 flex flex-col gap-4">
        <div className="h-[35%]"> 
          <NumberGrid calledNumbers={call