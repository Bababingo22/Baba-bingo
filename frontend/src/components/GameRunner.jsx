import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';

// --- THIS IS THE ONLY UI COMPONENT ON THE PAGE ---
// It renders the main 75-number B-I-N-G-O grid.
const NumberGrid = ({ calledNumbers }) => {
  const headers = ['B', 'I', 'N', 'G', 'O'];
  const columns = headers.map((_, index) => Array.from({ length: 15 }, (_, i) => index * 15 + 1 + i));
  return (
    <div className="bg-[#1e2b3a] p-4 rounded-lg flex-1">
      <div className="flex justify-around h-full">
        {headers.map((header, colIndex) => (
          <div key={header} className="flex flex-col items-center gap-1 w-1/5">
            <div className="w-10 h-10 flex items-center justify-center text-2xl font-bold">{header}</div>
            {columns[colIndex].map(num => (
              <div key={num} className={`w-10 h-10 flex items-center justify-center text-md font-semibold rounded-full transition-colors ${calledNumbers.has(num) ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-gray-300'}`}>
                {num}
              </div>
            ))}
          </div>
        ))}
      </div>
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

  // The entire page is now just the number grid, filling the screen.
  return (
    <div className="flex flex-col p-4 bg-[#0f172a] h-screen">
      <NumberGrid calledNumbers={calledNumbers} />
    </div>
  );
}