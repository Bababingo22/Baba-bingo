import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';

// --- THIS IS THE CORRECTED, COMPACT NUMBER GRID ---
const NumberGrid = ({ calledNumbers }) => {
  const headers = ['B', 'I', 'N', 'G', 'O'];

  return (
    // The main container is now a flexbox column that doesn't grow to fill the screen
    <div className="bg-[#1e2b3a] p-4 rounded-lg flex flex-col gap-2">
      {headers.map((letter, rowIndex) => (
        <div key={letter} className="flex items-center gap-3">
          {/* White box for B-I-N-G-O letters */}
          <div className="w-10 h-10 bg-white text-blue-600 font-bold text-xl flex-shrink-0 flex items-center justify-center rounded-md">
            {letter}
          </div>
          {/* Horizontal row of numbers */}
          <div className="flex-1 grid grid-cols-15 gap-2">
            {Array.from({ length: 15 }, (_, colIndex) => {
              const num = rowIndex * 15 + colIndex + 1;
              const isCalled = calledNumbers.has(num);
              return (
                <div 
                  key={num} 
                  className={`w-full aspect-square flex items-center justify-center text-sm font-semibold transition-colors duration-300 ${
                    isCalled ? 'text-white font-bold' : 'text-gray-600'
                  }`}
                >
                  {num}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Main GameRunner with MINIMALIST LAYOUT ---
export default function GameRunner({ game, token, callSpeed, audioLanguage }) {
  const [socket, setSocket] = useState(null);
  const [calledNumbers, setCalledNumbers] = useState(new Set(game.called_numbers || []));
  const intervalRef = useRef(null);

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
        speakNumber(newNumber, audioLanguage);
      }
    };
    setSocket(s);
    
    // Automatically start the game when the page loads
    const startInterval = (ws) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: 'call_next' }));
        }
      }, callSpeed * 1000);
    };

    if (s.readyState === WebSocket.OPEN) {
        startInterval(s);
    } else {
        s.onopen = () => startInterval(s);
    }

    return () => { 
      s.close(); 
      if (intervalRef.current) clearInterval(intervalRef.current); 
    };
  }, [game.id, token, callSpeed, audioLanguage]);

  function speakNumber(number, lang) {
    if (!('speechSynthesis' in window)) return;
    const msg = new SpeechSynthesisUtterance(String(number));
    if (lang === 'Amharic Male' || lang === 'Amharic Female') msg.lang = 'am-ET';
    window.speechSynthesis.speak(msg);
  }

  // The main container now just holds the number grid at the top of the page.
  return (
    <div className="p-4 bg-[#0f172a] h-screen">
      <NumberGrid calledNumbers={calledNumbers} />
    </div>
  );
}