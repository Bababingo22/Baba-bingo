import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';

// --- All helper functions and sub-components remain the same ---
const getBingoLetter = (number) => { /* ... */ };
const CardCheckModal = ({ cardData, calledNumbers, onClose }) => { /* ... */ };

// --- Main GameRunner with the CORRECT 3-COLUMN LAYOUT ---
export default function GameRunner({ game, token, user, callSpeed, audioLanguage, onNav }) {
  // All state variables are the same
  const [socket, setSocket] = useState(null);
  const [calledNumbers, setCalledNumbers] = useState(new Set(game.called_numbers || []));
  const [nextNumber, setNextNumber] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [cardNumberToCheck, setCardNumberToCheck] = useState('');
  const [cardDataForModal, setCardDataForModal] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const intervalRef = useRef(null);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [callHistory, setCallHistory] = useState([]);

  // All functions are the same
  useEffect(() => { /* ... */ }, [game.id, token, audioLanguage]);
  useEffect(() => { /* ... */ }, [isPaused, callSpeed]);
  function callNext() { /* ... */ }
  function speakNumber(number, lang) { /* ... */ }
  async function handleCheckCard() { /* ... */ }

  return (
    <>
      <CardCheckModal cardData={cardDataForModal} calledNumbers={calledNumbers} onClose={() => setIsModalVisible(false)} />
      
      <div className="flex bg-[#0f172a] text-white h-screen">
        
        {/* --- COLUMN 1: User Profile Icon --- */}
        <div className="w-20 bg-[#1e2b3a] p-4 flex flex-col items-center border-r border-gray-700">
          <button onClick={() => onNav('create')} className="w-12 h-12 bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold hover:bg-gray-500">
            {user.username.charAt(0).toUpperCase()}
          </button>
        </div>

        {/* --- COLUMN 2: Game Controls --- */}
        <div className="w-64 flex flex-col gap-4 p-4 border-r border-gray-700">
          <div className="bg-[#1e2b3a] p-4 rounded-lg text-center">
            <div className="text-gray-400 font-semibold">Total Calls</div>
            <div className="text-7xl font-bold">{calledNumbers.size}</div>
          </div>
          <div className="bg-[#1e2b3a] p-4 rounded-lg text-center">
            <div className="text-gray-400 font-semibold mb-2">Winning Pattern</div>
            <div className="grid grid-cols-5 gap-1 mx-auto w-40 h-40 border-2 border-gray-600 p-1">
              {Array.from({length: 25}).map((_, i) => <div key={i} className={`rounded-full ${[0,4,12,20,24].includes(i) ? 'bg-yellow-400' : 'bg-blue-800'}`}></div>)}
            </div>
          </div>
          <div className="bg-[#1e2b3a] p-4 rounded-lg text-center flex-1 flex flex-col justify-center">
            <div className="text-gray-400 font-semibold">Next Number</div>
            <div className="text-8xl font-bold mt-4">{nextNumber || '-'}</div>
          </div>
          <div className="space-y-2">
            <button onClick={() => setIsPaused(!isPaused)} className={`w-full py-3 rounded-lg font-bold text-xl ${isPaused ? 'bg-blue-600' : 'bg-orange-500'}`}>{isPaused ? 'Resume' : 'Pause'}</button>
            <div className="flex gap-2">
              <input type="number" placeholder="Card #" value={cardNumberToCheck} onChange={(e) => setCardNumberToCheck(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-lg" />
              <button onClick={handleCheckCard} className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-md">Check</button>
            </div>
            <button className="w-full py-3 rounded-lg font-bold bg-red-600">End game</button>
          </div>
        </div>

        {/* --- COLUMN 3: Main Content --- */}
        <div className="flex-1 flex flex-col gap-4 p-4">
          {/* Main BINGO Number Grid */}
          <div className="bg-[#1e2b3a] p-4 rounded-lg flex-1">
            <div className="flex justify-around h-full">
              {['B', 'I', 'N', 'G', 'O'].map((header, colIndex) => (
                <div key={header} className="flex flex-col items-center gap-1 w-1/5">
                  <div className="w-10 h-10 flex items-center justify-center text-2xl font-bold">{header}</div>
                  {Array.from({ length: 15 }, (_, i) => colIndex * 15 + 1 + i).map(num => (
                    <div key={num} className={`w-10 h-10 flex items-center justify-center text-md font-semibold rounded-full transition-colors ${calledNumbers.has(num) ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-gray-300'}`}>
                      {num}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* Live Call Display */}
          <div className="flex items-center justify-between bg-[#1e2b3a] p-4 rounded-lg h-40">
            <div className="flex items-center justify-center flex-grow">
              {currentNumber ? (
                <div className="w-32 h-32 rounded-full bg-yellow-400 border-4 border-white flex items-center justify-center shadow-lg"><span className="text-5xl font-bold text-black">{getBingoLetter(currentNumber)}{currentNumber}</span></div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center"><span className="text-xl text-gray-400">Press Resume</span></div>
              )}
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="text-gray-400 font-semibold mb-2">PREVIOUS</div>
              <div className="flex gap-2">
                {callHistory.map((num, index) => (
                  <div key={index} className="w-20 h-20 rounded-full bg-gray-800 border-2 border-red-500 flex items-center justify-center"><span className="text-3xl font-bold text-white">{getBingoLetter(num)}{num}</span></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center text-2xl font-bold text-green-400">የእርስዎ 24Birr</div>
        </div>
      </div>
    </>
  );
}

// NOTE: You still need to include the full, unchanged code for CardCheckModal at the top of this file.