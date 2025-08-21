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

// --- THIS IS THE CORRECTED NUMBER GRID WITH THE NEW STYLE ---
const NumberGrid = ({ calledNumbers }) => {
  const headers = ['B', 'I', 'N', 'G', 'O'];

  return (
    <div className="bg-[#1e2b3a] p-4 rounded-lg flex-1">
      <table className="w-full h-full border-separate" style={{borderSpacing: '4px'}}>
        <tbody>
          {headers.map((letter, rowIndex) => (
            <tr key={letter}>
              {/* White box for B-I-N-G-O letters */}
              <td className="w-[4%] bg-white text-blue-600 font-bold text-2xl text-center rounded-md">{letter}</td>
              
              {Array.from({ length: 15 }).map((_, colIndex) => {
                const num = rowIndex * 15 + colIndex + 1;
                const isCalled = calledNumbers.has(num);
                return (
                  <td 
                    key={num} 
                    className={`w-1/15 text-center font-semibold text-lg transition-colors duration-300 ${
                      isCalled ? 'text-white font-bold' : 'text-gray-600'
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

// --- The rest of the GameRunner is unchanged, but included for completeness ---
const CardCheckModal = ({ cardData, calledNumbers, onClose }) => { /* ... */ };

export default function GameRunner({ game, token, user, callSpeed, audioLanguage, onNav }) {
  // ... (All state and functions are the same) ...

  return (
    <>
      <CardCheckModal cardData={cardDataForModal} calledNumbers={calledNumbers} onClose={() => setIsModalVisible(false)} />
      <div className="flex bg-[#0f172a] text-white h-screen">
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
            <button onClick={() => onNav('create')} className="w-full py-3 rounded-lg font-bold bg-red-600">End game</button>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4 p-4">
          <NumberGrid calledNumbers={calledNumbers} />
        </div>
      </div>
    </>
  );
}