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
  const [so