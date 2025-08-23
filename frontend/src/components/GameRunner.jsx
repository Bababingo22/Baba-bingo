import React, { useEffect, useState, useRef } from 'react'; and very difficult "race condition" bug. Let's fix this now, once and for all, with a clean
import api from '../services/api';

const getBingoLetter = (number) => {
  if (number >=, professional, and robust solution.

### The Final, Definitive Solution

We are going to replace the logic in the `GameRunner.jsx` file one last time. This new version uses a much safer and more standard React pattern that ** 1 && number <= 15) return 'B';
  if (number >= 16 && number <= 30) return 'I';
  if (number >= 31 && number <= 45) return 'Nguarantees** the timer will only start after the connection to the server is fully open and ready.

This is';
  if (number >= 46 && number <= 60) return 'G';
  if (number >=  the **final, correct, and bug-free version** of the `GameRunner.jsx` file. This is the **only file you need to change.**

---

### `frontend/src/components/GameRunner.jsx` (Final Correct61 && number <= 75) return 'O';
  return '';
};

const CardCheckModal = ({ checkResult, calledNumbers, onClose }) => {
  if (!checkResult || !checkResult.card_data) return nulled Version)

**Please replace the entire content of your `frontend/src/components/GameRunner.jsx` file with;
  const { is_winner, card_data } = checkResult;
  const { card_number this code.**

```jsx
import React, { useEffect, useState, useRef } from 'react';
import api, board } = card_data;
  const headers = ['B', 'I', 'N', 'G from '../services/api';

const getBingoLetter = (number) => {
  if (number >= ', 'O'];
  const colors = ['bg-blue-500', 'bg-red-500', 'bg-orange-400', 'bg-green-500', 'bg-purple-500'];
  const rows1 && number <= 15) return 'B';
  if (number >= 16 && number <= 30) return 'I';
  if (number >= 31 && number <= 45) return 'N';
  if (number >= 46 && number <= 60) return 'G';
  if (number >=  = Array.from({ length: 5 }).map((_, r) => Array.from({ length: 5 },61 && number <= 75) return 'O';
  return '';
};

const CardCheckModal = ({ checkResult, calledNumbers, onClose }) => {
  if (!checkResult || !checkResult.card_data) return null (_, c) => board[c][r]));

  return (
    <div className="fixed inset-0 bg;
  const { is_winner, card_data } = checkResult;
  const { card_number, board } = card_data;
  const headers = ['B', 'I', 'N', 'G', 'O-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg'];
  const colors = ['bg-blue-500', 'bg-red-500', 'bg-orange-400', 'bg-green-500', 'bg-purple-500'];-[#2d3748] p-6 rounded-lg shadow-xl relative w-full max-w-lg
  const rows = Array.from({ length: 5 }).map((_, r) => Array.from({ length: 5 },">
        <div className="text-center mb-4 p-3 rounded-lg bg-red-6 (_, c) => board[c][r]));

  return (
    <div className="fixed inset-0 bg00">
          <h2 className="text-2xl font-bold text-white">Yaba Bingo</h2>-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className
          <p className="text-white text-lg">Card Number: {card_number}</p>
        </div>
        <div className={`text-center mb-4 p-3 rounded-lg ${is_winner ? 'bg-green-500' : 'bg-gray-700'}`}>
          <h2 className="text-4xl font-bold text="bg-[#2d3748] p-6 rounded-lg shadow-xl relative w-full max-w-lg">
        <div className="text-center mb-4 p-3 rounded-lg bg-red-600">
          <h2 className="text-2xl font-bold text-white">Y-white">{is_winner ? 'ዘግቷል' : 'አልዘጋም'}</h2>
        </div>
        <tableaba Bingo</h2>
          <p className="text-white text-lg">Card Number: {card_number}</p className="w-full border-separate" style={{ borderSpacing: '6px' }}>
          <thead>
            <tr>>
        </div>
        <div className={`text-center mb-4 p-3 rounded-lg ${is_winner ? 'bg-green-500' : 'bg-gray-700'}`}>
          <h2 className="text{headers.map((h, i) => <th key={h} className={`w-1/5 text-4xl font-bold text-white">{is_winner ? 'ዘግቷል' : 'አል-center text-xl font-bold p-2 text-white rounded-md ${colors[i]}`}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (ዘጋም'}</h2>
        </div>
        <table className="w-full border-separate" style={{ borderSpacing
              <tr key={rowIndex}>
                {row.map((cellValue, colIndex) => {
                  const isCalled: '6px' }}>
          <thead>
            <tr>{headers.map((h, i) => <th key={h} className={`w-1/5 text-center text-xl font-bold p-2 text = cellValue !== "FREE" && calledNumbers.has(cellValue);
                  const isFreeSpace = cellValue === "FREE";
                  return <td key={`${colIndex}-${rowIndex}`} className={`text-center font-bold text-2-white rounded-md ${colors[i]}`}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {xl h-16 rounded-md ${isCalled ? 'bg-yellow-400 text-black' : isrows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cellFreeSpace ? 'bg-blue-600 text-white' : 'bg-gray-300 text-blackValue, colIndex) => {
                  const isCalled = cellValue !== "FREE" && calledNumbers.has(cellValue);
                  const isFreeSpace = cellValue === "FREE";
                  return <td key={`${'}`}>{isFreeSpace ? '★' : cellValue}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-center mt-6">
          <button onClickcolIndex}-${rowIndex}`} className={`text-center font-bold text-2xl h-16 rounded-md ${is={onClose} className="px-10 py-3 bg-gray-600 text-white fontCalled ? 'bg-yellow-400 text-black' : isFreeSpace ? 'bg-blue-6-bold rounded-lg hover:bg-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  00 text-white' : 'bg-gray-300 text-black'}`}>{isFreeSpace ? '★);
};

const NumberGrid = ({ calledNumbers }) => {
  const headers = ['B', 'I',' : cellValue}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div 'N', 'G', 'O'];
  return (
    <div className="bg-[#1e2 className="text-center mt-6">
          <button onClick={onClose} className="px-10 pyb3a] p-4 rounded-lg h-full">
      <table className="w-full h-3 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700">-full border-separate" style={{ borderSpacing: '4px' }}>
        <tbody>
          {headers.map((letter, rowIndex) => (
            <tr key={letter}>
              <td className="w-12 bg-blueCancel</button>
        </div>
      </div>
    </div>
  );
};

const NumberGrid = ({-600 text-yellow-400 font-bold text-2xl text-center rounded-md">{ calledNumbers }) => {
  const headers = ['B', 'I', 'N', 'G', 'Oletter}</td>
              {Array.from({ length: 15 }).map((_, colIndex) => {
                const num'];
  return (
    <div className="bg-[#1e2b3a] p-4 rounded-lg h-full">
      <table className="w-full h-full border-separate" style={{ borderSpacing: '4 = rowIndex * 15 + colIndex + 1;
                const isCalled = calledNumbers.has(numpx' }}>
        <tbody>
          {headers.map((letter, rowIndex) => (
            <tr key={letter}>
              <td className="w-12 bg-blue-600 text-yellow-400 font);
                return <td key={num} className={`text-center font-semibold text-lg transition-colors duration-bold text-2xl text-center rounded-md">{letter}</td>
              {Array.from({ length: 1-300 ${isCalled ? 'text-white font-bold' : 'text-gray-600'}`}>{5 }).map((_, colIndex) => {
                const num = rowIndex * 15 + colIndex + 1;
                const isCalled = calledNumbers.has(num);
                return <td key={num} className={`text-center fontnum}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export-semibold text-lg transition-colors duration-300 ${isCalled ? 'text-white font-bold' : 'text-gray-600'}`}>{num}</td>;
              })}
            </tr>
          ))} default function GameRunner({ game, token, user, callSpeed, audioLanguage, onNav }) {
  const
        </tbody>
      </table>
    </div>
  );
};

export default function GameRunner({ game, token, user [calledNumbers, setCalledNumbers] = useState(new Set(game.called_numbers || []));
  const [isPaused, setIsPaused] = useState(true);
  const [cardNumberToCheck, setCardNumberToCheck] = useState('');, callSpeed, audioLanguage, onNav }) {
  const [calledNumbers, setCalledNumbers] = useState(
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentNumber,new Set(game.called_numbers || []));
  const [isPaused, setIsPaused] = useState(true); // setCurrentNumber] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [countdown Game starts paused, waits for connection
  const [cardNumberToCheck, setCardNumberToCheck] = useState('');
  const [is, setCountdown] = useState(callSpeed);
  const [checkResult, setCheckResult] = useState(null);
ModalVisible, setIsModalVisible] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(  const socketRef = useRef(null);

  const prizeAmount = (() => {
    if (!game || !usernull);
  const [callHistory, setCallHistory] = useState([]);
  const [countdown, setCountdown] = useState(callSpeed);
  const [checkResult, setCheckResult] = useState(null);
  const socketRef = useRef(null);

 || !game.active_card_numbers) return '0.00';
    const totalPot = game  const prizeAmount = (() => {
    if (!game || !user || !game.active_card_numbers.amount * game.active_card_numbers.length;
    const commissionAmount = totalPot * (user.commission) return '0.00';
    const totalPot = game.amount * game.active_card_numbers._percentage / 100);
    const prize = totalPot - commissionAmount;
    return prize.toFixed(2);
  })();

  useEffect(() => {
    const wsProto = window.location.protocol === "https:" ? "wss"length;
    const commissionAmount = totalPot * (user.commission_percentage / 100);
    const : "ws";
    const apiHost = (import.meta.env.VITE_API_BASE || "http:// prize = totalPot - commissionAmount;
    return prize.toFixed(2);
  })();

  // Thislocalhost:8000").replace(/^https?:\/\//, "").replace(/\/api$/, "");
     useEffect is ONLY for the WebSocket connection.
  useEffect(() => {
    const wsProto = window.location.protocol
    // --- THIS IS THE CRITICAL FIX ---
    // The URL now correctly includes "://" after the protocol.
    const === "https:" ? "wss" : "ws";
    const apiHost = (import.meta.env url = `${wsProto}://${apiHost}/ws/game/${game.id}/?token=${token}`;
    socket.VITE_API_BASE || "http://localhost:8000").replace(/^https?:\/\//, "").replace(/\/api$/, "");
    const url = `${wsProto}/${apiHost}/ws/game/${game.id}/Ref.current = new WebSocket(url);

    socketRef.current.onmessage = (ev) => {
      const?token=${token}`;
    socketRef.current = new WebSocket(url);

    socketRef.current.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if data = JSON.parse(ev.data);
      if (data.action === "call_number") {
        const new (data.action === "call_number") {
        const newNumber = data.number;
        setNumber = data.number;
        setCalledNumbers(prev => new Set(prev).add(newNumber));
        setCurrentCalledNumbers(prev => new Set(prev).add(newNumber));
        setCurrentNumber(prev => { ifNumber(prev => { if (prev) { setCallHistory(h => [prev, ...h].slice(0 (prev) { setCallHistory(h => [prev, ...h].slice(0, 4)); } return newNumber; });
        speakText(String(newNumber), audioLanguage);
        setCountdown(call, 4)); } return newNumber; });
        speakText(String(newNumber), audioLanguage);
        setCountdown(callSpeed);
      }
    };

    socketRef.current.onopen = () => {
        Speed);
      }
    };

    // THIS IS THE KEY TO FIXING THE RACE CONDITION
    socketRef.current.onopen = () => {
      console.log("WebSocket connection established.");
      speakText("ጨspeakText("ጨዋታው ጀምሯል", audioLanguage);
        setIsPaused(false);
    };
ዋታው ጀምሯል", audioLanguage);
      setIsPaused(false); // Auto-start the game ONLY when the connection is ready.
    };
    
    socketRef.current.onerror = (error) => {
      console.    
    return () => { if (socketRef.current) socketRef.current.close(); };
  error("WebSocket Error:", error);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [game.id, token, audio}, [game.id, token, audioLanguage, callSpeed]);

  useEffect(() => {
    if (isPaused) return;
    
    const timerId = setInterval(() => {
      setCountdown(prevCountdownLanguage, callSpeed]);

  // This useEffect is ONLY for the timer.
  useEffect(() => {
    if (isPaused) {
 => {
        if (prevCountdown <= 1) {
          if (socketRef.current && socketRef.current.readyState      return;
    }
    
    const timerId = setInterval(() => {
      setCountdown(prevCountdown === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ action: 'call_next' }));
          }
          return 0;
        }
        return prevCountdown - 1;
      }); => {
        if (prevCountdown <= 1) {
          if (socketRef.current && socketRef.current.readyState
    }, 1000);

    return () => clearInterval(timerId);
  }, [isPaused, callSpeed]);

   === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ action: 'call_next' }));
          }function speakText(text, lang) {
    if (!('speechSynthesis' in window)) return;
    const
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isPaused, callSpeed]);

  function speakText(text, lang) {
    if (!('speechSynthesis' in window)) return;
    const msg = new SpeechSynthesisUtterance(text);
    if (lang === 'Amharic Male' || lang === 'Amharic Female') {
      msg.lang = 'am-ET';
    }
    window msg = new SpeechSynthesisUtterance(text);
    if (lang === 'Amharic Male' ||.speechSynthesis.speak(msg);
  }

  async function handleCheckCard() {
    if (!cardNumber lang === 'Amharic Female') {
      msg.lang = 'am-ET';
    }
    window.speechSynthesis.speak(msg);
  }

  async function handleCheckCard() {
    if (!cardNumberToCheck) return alert("Please enter a card number.");
    try {
      const response = await api.get(`/ToCheck) return alert("Please enter a card number.");
    try {
      const response = await api.get(`/check_win/${game.id}/${cardNumberToCheck}/`);
      setCheckResult(response.data);
      setIscheck_win/${game.id}/${cardNumberToCheck}/`);
      setCheckResult(response.data);
      setIsModalVisible(true);
    } catch (error) {
      alert(`Error: ${error.response?.ModalVisible(true);
    } catch (error) {
      alert(`Error: ${error.response?.data?.detail || 'Card not found.'}`);
    }
  }
  
  const handleEndGamedata?.detail || 'Card not found.'}`);
    }
  }
  
  const handleEndGame = () => {
    setIsPaused(true);
    speakText("ጨዋታው ቋሞል", audioLanguage);
    setTimeout(() => {
      onNav('create');
    }, 1000);
  };

  return (
    <> = () => {
    setIsPaused(true);
    speakText("ጨዋታው ቋሞል", audioLanguage);
    setTimeout(() => {
      onNav('create');
    }, 1000);
  
      {isModalVisible && <CardCheckModal checkResult={checkResult} calledNumbers={calledNumbers} onClose};

  return (
    <>
      {isModalVisible && <CardCheckModal checkResult={checkResult}={() => setIsModalVisible(false)} />}
      <div className="bg-[#0f172a] text calledNumbers={calledNumbers} onClose={() => setIsModalVisible(false)} />}
      <div className="bg-[#-white h-screen p-4 flex flex-col gap-4">
        <div className="flex-grow min-h-0"> 
          <NumberGrid calledNumbers={calledNumbers} />
        </div>
        <div className="flex0f172a] text-white h-screen p-4 flex flex-col gap-4">
        <div className-grow-[2] min-h-0 grid grid-cols-[300px_1fr] gap-4">
          <div className="flex flex-col gap-4">
            <div className="bg="flex-grow min-h-0"> 
          <NumberGrid calledNumbers={calledNumbers} />
        </div>
        <div className="flex-grow-[2] min-h-0 grid grid-cols-[300px_-[#1e2b3a] p-4 rounded-lg text-center">
              <div className="text-gray-400 font-semibold">Next Number</div>
              <div className="text-8xl font-bold">{isPaused ? '-' : countdown}</div>
            </div>
            <button onClick={() => setIsPaused(prev => !prev1fr] gap-4">
          <div className="flex flex-col gap-4">
            <div className="bg-[#1e2b3a] p-4 rounded-lg text-center">
              <div className="text-gray)} className={`w-full py-3 rounded-lg font-bold text-xl ${isPaused ? 'bg-orange-500' : 'bg-blue-600'}`}>{isPaused ? 'Pause' : 'Resume'}</button>
            <div className="flex gap-2 mb-2">
              <input-400 font-semibold">Next Number</div>
              <div className="text-8xl font-bold">{isPaused ? '-' : countdown}</div>
            </div>
            <button onClick={() => setIsPaused(prev => ! type="number" placeholder="Card #" value={cardNumberToCheck} onChange={(e) => setCardNumberToCheck(e.target.value)} className="prev)} className={`w-full py-3 rounded-lg font-bold text-xl ${isPaused ? 'bg-blue-600' : 'bg-orange-500'}`}>{isPaused ? 'Resumew-full bg-gray-700 p-2 rounded-md text-lg" />
              <button' : 'Pause'}</button>
            <div className="flex gap-2 mb-2">
              <input onClick={handleCheckCard} className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-md">Check</button>
            </div>
            <button onClick={handleEndGame} className="w-full py- type="number" placeholder="Card #" value={cardNumberToCheck} onChange={(e) => setCardNumberToCheck(e.3 rounded-lg font-bold bg-red-600">End game</button>
            <div className="bg-[#1e2b3a] p-4 rounded-lg text-center mt-auto">
              <div className="texttarget.value)} className="w-full bg-gray-700 p-2 rounded-md text-lg"-gray-400 font-semibold">Total Calls</div>
              <div className="text-7xl font- />
              <button onClick={handleCheckCard} className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-md">Check</button>
            </div>
            <button onClick={handleEndGamebold">{calledNumbers.size}</div>
            </div>
          </div>
          <div className="flex flex-col gap-4">} className="w-full py-3 rounded-lg font-bold bg-red-600">End
            <div className="text-2xl font-bold text-green-400 text-center"> game</button>
            <div className="bg-[#1e2b3a] p-4 rounded-lg
              {prizeAmount} Birr ደራሽ
            </div>
            <div className="bg-[#1e2b3 text-center mt-auto">
              <div className="text-gray-400 font-semibold">Totala] p-4 rounded-lg flex-1 flex items-center justify-center">
              <div className="flex Calls</div>
              <div className="text-7xl font-bold">{calledNumbers.size}</div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-2xl font-bold text-green items-center justify-center gap-3">
                {callHistory.length > 0 ? (
                  call-400 text-center">
              {prizeAmount} Birr ደራሽ
            </div>
            <div classNameHistory.map((num, index) => (
                    <div key={index} className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${index === 0 ? 'border="bg-[#1e2b3a] p-4 rounded-lg flex-1 flex items-center justify-center">
              <div className="flex items-center justify-center gap-3">
                {callHistory.length-green-400' : 'border-yellow-400'}`}>
                      <span className="text-4 > 0 ? (
                  callHistory.map((num, index) => (
                    <div key={index} className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${xl font-bold text-white">{getBingoLetter(num)}{num}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">Previous numbers will appear here</div>
            