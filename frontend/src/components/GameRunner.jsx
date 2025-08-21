import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';

const getBingoLetter = (number) => { /* ... (no changes here) ... */ };
const CardCheckModal = ({ cardData, calledNumbers, onClose }) => { /* ... (no changes here) ... */ };
const NumberGrid = ({ calledNumbers }) => { /* ... (no changes here) ... */ };

// --- Main GameRunner with CORRECTED LAYOUT PROPORTIONS ---
export default function GameRunner({ game, token, user, callSpeed, audioLanguage, onNav }) {
  // ... (All state and functions are the same) ...

  return (
    <>
      <CardCheckModal cardData={cardDataForModal} calledNumbers={calledNumbers} onClose={() => setIsModalVisible(false)} />
      <div className="bg-[#0f172a] text-white h-screen p-4 flex flex-col gap-4">
        
        {/* --- THIS IS THE FIX --- */}
        {/* The top section containing the NumberGrid is now larger */}
        <div className="flex-grow-[2]"> 
          <NumberGrid calledNumbers={calledNumbers} />
        </div>
        
        {/* The bottom section is now smaller */}
        <div className="flex-grow grid grid-cols-[300px_1fr] gap-4">
          {/* Left Column of Controls */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#1e2b3a] p-4 rounded-lg text-center">
              <div className="text-gray-400 font-semibold">Next Number</div>
              <div className="text-8xl font-bold">{nextNumber || '-'}</div>
            </div>
            <button onClick={() => setIsPaused(!isPaused)} className={`w-full py-3 rounded-lg font-bold text-xl ${isPaused ? 'bg-blue-600' : 'bg-orange-500'}`}>{isPaused ? 'Resume' : 'Pause'}</button>
            <div className="flex gap-2">
              <input type="number" placeholder="Card #" value={cardNumberToCheck} onChange={(e) => setCardNumberToCheck(e-
.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-lg" />
              <button onClick={handleCheckCard} className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-md">Check</button>
            </div>
            <button onClick={() => onNav('create')} className="w-full py-3 rounded-lg font-bold bg-red-600">End game</button>
            <div className="bg-[#1e2b3a] p-4 rounded-lg text-center mt-auto">
              <div className="text-gray-400 font-semibold">Total Calls</div>
              <div className="text-7xl font-bold">{calledNumbers.size}</div>
            </div>
          </div>

          {/* Right Column of Displays */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div className="text-2xl font-bold text-green-400">የእርስዎ 24Birr</div>
                <div className="bg-[#1e2b3a] p-4 rounded-lg">
                    <div className="text-gray-400 font-semibold mb-2 text-center">Winning Pattern</div>
                    <div className="grid grid-cols-5 gap-1 mx-auto w-40 h-40">
                        {Array.from({length: 25}).map((_, i) => <div key={i} className={`rounded-full ${[0,4,12,20,24].includes(i) ? 'bg-yellow-400' : 'bg-blue-800'}`}></div>)}
                    </div>
                </div>
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

// NOTE: Remember to include the full, unchanged code for getBingoLetter, CardCheckModal, and NumberGrid at the top of this file.