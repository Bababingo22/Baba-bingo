import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';

// --- Helper function and sub-components are correct ---
const getBingoLetter = (number) => { /* ... (no changes needed) ... */ };
const CardCheckModal = ({ cardData, calledNumbers, onClose }) => { /* ... (no changes needed) ... */ };

// --- THIS IS THE CORRECTED NUMBER GRID COMPONENT ---
const NumberGrid = ({ calledNumbers }) => {
  const headers = ['B', 'I', 'N', 'G', 'O'];
  return (
    <div className="bg-[#1e2b3a] p-4 rounded-lg flex-1">
      {/* We use a CSS grid with 16 columns: 1 for the header, 15 for the numbers */}
      <div className="grid grid-cols-16 gap-1 text-center h-full">
        {/* First row is empty for the header column */}
        <div></div> 
        {/* Render the number headers 1 through 15 */}
        {Array.from({ length: 15 }, (_, i) => i + 1).map(headerNum => (
          <div key={`header-${headerNum}`} className="font-bold text-gray-400 text-sm flex items-center justify-center">{headerNum}</div>
        ))}

        {/* Create a row for each B-I-N-G-O letter */}
        {headers.map((letter, rowIndex) => (
          <React.Fragment key={letter}>
            {/* The B-I-N-G-O letter in the first column */}
            <div className="font-bold text-2xl flex items-center justify-center">{letter}</div>
            {/* The 15 numbers for that letter's row */}
            {Array.from({ length: 15 }, (_, colIndex) => {
              const num = rowIndex * 15 + colIndex + 1;
              const isCalled = calledNumbers.has(num);
              return (
                <div 
                  key={num} 
                  className={`w-full aspect-square flex items-center justify-center text-sm font-semibold rounded-full transition-colors ${
                    isCalled ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {num}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// --- Main GameRunner with the CORRECT 3-COLUMN LAYOUT ---
export default function GameRunner({ game, token, user, callSpeed, audioLanguage, onNav }) {
  // ... (All state and functions are correct and do not need to change) ...

  return (
    <>
      <CardCheckModal cardData={cardDataForModal} calledNumbers={calledNumbers} onClose={() => setIsModalVisible(false)} />
      <div className="flex bg-[#0f172a] text-white h-screen">
        <div className="w-20 bg-[#1e2b3a] p-4 flex flex-col items-center border-r border-gray-700">
          <button onClick={() => onNav('create')} className="w-12 h-12 bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold hover:bg-gray-500">
            {user.username.charAt(0).toUpperCase()}
          </button>
        </div>
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
        <div className="flex-1 flex flex-col gap-4 p-4">
          <NumberGrid calledNumbers={calledNumbers} />
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