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

const parseBooleanLike = (v) => {
  if (v === undefined || v === null) return false;
  if (v === true) return true;
  if (v === 1) return true;
  const s = String(v).trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes' || s === 'win' || s === 'won' || s === 'winner';
};

const playAudio = (src, onEndedCallback) => {
  try {
    const audio = new Audio(src);
    if (onEndedCallback) {
      audio.onended = onEndedCallback;
    }
    audio.play().catch(() => {
      if (onEndedCallback) onEndedCallback();
    });
  } catch (error) {
    if (onEndedCallback) onEndedCallback();
  }
};

const CardCheckModal = ({ checkResult, calledNumbers, onClose, voiceFolder }) => {
  if (!checkResult || !checkResult.card_data) return null;
  
  const isWinner = parseBooleanLike(checkResult.is_winner);
  const { card_data } = checkResult;
  const { card_number, board } = card_data;
  const headers = ['B', 'I', 'N', 'G', 'O'];
  
  const col1 = 'bg-blue-500';
  const col2 = 'bg-red-500';
  const col3 = 'bg-orange-400';
  const col4 = 'bg-green-500';
  const col5 = 'bg-purple-500';
  const colors = [col1, col2, col3, col4, col5];
  
  // FIXED: Read the board as Rows instead of Columns
  const rows = Array.from({ length: 5 }).map((_, r) => Array.from({ length: 5 }, (_, c) => board[r][c]));
  
  const isCellCalled = (val) => {
    if (val === 'FREE' || val === '★') return true;
    const numeric = Number(val);
    if (!Number.isNaN(numeric)) return calledNumbers.has(numeric);
    return calledNumbers.has(val);
  };

  const getWinningCells = () => {
    const winningSet = new Set();
    if (!isWinner) return winningSet;

    for (let r = 0; r < 5; r++) {
      let isRowWin = true;
      for (let c = 0; c < 5; c++) {
        if (!isCellCalled(board[r][c])) isRowWin = false;
      }
      if (isRowWin) {
        for (let c = 0; c < 5; c++) winningSet.add(r.toString() + "-" + c.toString());
      }
    }

    for (let c = 0; c < 5; c++) {
      let isColWin = true;
      for (let r = 0; r < 5; r++) {
        if (!isCellCalled(board[r][c])) isColWin = false;
      }
      if (isColWin) {
        for (let r = 0; r < 5; r++) winningSet.add(r.toString() + "-" + c.toString());
      }
    }

    let diag1Win = true;
    let diag2Win = true;
    for (let i = 0; i < 5; i++) {
      if (!isCellCalled(board[i][i])) diag1Win = false;
      if (!isCellCalled(board[i][4 - i])) diag2Win = false;
    }
    if (diag1Win) {
      for (let i = 0; i < 5; i++) winningSet.add(i.toString() + "-" + i.toString());
    }
    if (diag2Win) {
      for (let i = 0; i < 5; i++) winningSet.add(i.toString() + "-" + (4 - i).toString());
    }

    const c1 = isCellCalled(board[0][0]);
    const c2 = isCellCalled(board[4][0]);
    const c3 = isCellCalled(board[0][4]);
    const c4 = isCellCalled(board[4][4]);
    
    if (c1 && c2 && c3 && c4) {
      winningSet.add("0-0");
      winningSet.add("4-0");
      winningSet.add("0-4");
      winningSet.add("4-4");
    }

    return winningSet;
  };

  const winningCells = getWinningCells();

  const handleBad = () => { playAudio("/audio/" + voiceFolder + "/bad.mp3"); onClose(); };
  const handleGood = () => { playAudio("/audio/" + voiceFolder + "/good.mp3"); onClose(); };

  const winBannerClass = isWinner ? "bg-green-900 border-green-500 text-green-400" : "bg-red-900 border-red-500 text-red-400";
  const winBannerText = isWinner ? "WINNER!" : "NO WIN";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 p-6 rounded-xl w-full max-w-2xl border border-gray-800">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">WIN CHECKER</h2>
            <p className="text-sm text-gray-400">Card: <span className="text-yellow-500 font-bold">{card_number}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl">✕</button>
        </header>

        <div className={"p-4 rounded-lg mb-6 border-2 " + winBannerClass}>
          <h3 className="text-center text-3xl font-black">{winBannerText}</h3>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
          <table className="w-full border-separate" style={{ borderSpacing: '4px' }}>
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={h} className={"w-1/5 text-center text-xl font-black p-2 text-white rounded-t-md " + colors[i]}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-900">
              {rows.map((row, r) => (
                <tr key={r}>
                  {row.map((val, c) => {
                    const isFreeSpace = val === "FREE" || val === "★";
                    const called = isCellCalled(val);
                    const isWinningCell = winningCells.has(r.toString() + "-" + c.toString());
                    
                    let cellStyle = "bg-gray-800 text-gray-500 border border-gray-700"; 
                    
                    if (called) {
                      if (isWinningCell) {
                        cellStyle = "bg-green-500 text-white font-black border-2 border-white scale-105 z-10";
                      } else {
                        cellStyle = "bg-red-600 text-white font-bold border border-red-400";
                      }
                    } else if (isFreeSpace) {
                        cellStyle = "bg-blue-600 text-white font-black"; 
                    }

                    return (
                      <td key={r.toString() + "-" + c.toString()} className={"text-center text-2xl h-16 rounded-md transition-all " + cellStyle}>
                        {isFreeSpace ? '★' : val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex gap-4">
          <button onClick={handleBad} className="flex-1 py-4 bg-red-600 text-white rounded-xl font-black text-xl">BAD CALL</button>
          <button onClick={handleGood} className="flex-1 py-4 bg-green-600 text-white rounded-xl font-black text-xl">GOOD WIN</button>
        </div>
      </div>
    </div>
  );
};

const NumberGrid = ({ calledNumbers }) => {
  const headers = ['B', 'I', 'N', 'G', 'O'];
  const col1 = 'bg-blue-600';
  const col2 = 'bg-green-600';
  const col3 = 'bg-yellow-500';
  const col4 = 'bg-red-600';
  const col5 = 'bg-purple-600';
  const headerColors = [col1, col2, col3, col4, col5];

  return (
    <section className="bg-gray-900 p-4 rounded-lg shadow-inner h-full min-h-[260px] flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-lg font-bold text-white uppercase">Called Numbers</h4>
        <span className="text-xs text-gray-500">1-75</span>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-separate" style={{ borderSpacing: '4px' }}>
          <thead>
            <tr>
              {headers.map((letter, index) => (
                <th key={letter} className={"text-white font-bold text-sm text-center rounded py-1 " + headerColors[index]}>{letter}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 15 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: 5 }).map((_, colIndex) => {
                  const num = colIndex * 15 + rowIndex + 1;
                  const isCalled = calledNumbers.has(num);
                  const cellClass = isCalled ? "bg-yellow-500 text-black font-black scale-105" : "bg-transparent text-gray-600";
                  return (<td key={num} className={"text-center text-sm py-1.5 rounded transition-all " + cellClass}>{num}</td>);
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default function GameRunner({ game, token, user, callSpeed, audioLanguage, onNav }) {
  const [calledNumbers, setCalledNumbers] = useState(new Set(game.called_numbers || []));
  
  // RESTORED: hasStarted state for the Start Button
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  const [cardNumberToCheck, setCardNumberToCheck] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // RESTORED: callHistory and currentNumber for the Recent Calls section
  const [currentNumber, setCurrentNumber] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  
  const [countdown, setCountdown] = useState(callSpeed);
  const socketRef = useRef(null);

  const voiceFolder = 'male';

  const prizeAmount = (() => {
    if (!game || !game.active_card_numbers) return '0.00';
    const totalPot = game.amount * game.active_card_numbers.length;
    const commissionAmount = totalPot * (game.commission_percentage / 100);
    return (totalPot - commissionAmount).toFixed(2);
  })();

  useEffect(() => {
    const url = "ws://127.0.0.1:8000/ws/game/" + game.id + "/?token=" + token;
    socketRef.current = new WebSocket(url);

    socketRef.current.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.action === "call_number") {
        const newNumber = data.number;
        setCalledNumbers(prev => { const next = new Set(prev); next.add(newNumber); return next; });
        
        // RESTORED: Update Recent Calls
        setCurrentNumber(prev => { if (prev) { setCallHistory(h => [prev, ...h]); } return newNumber; });
        
        const formattedNum = newNumber < 10 ? "0" + newNumber : newNumber.toString();
        
        setIsAudioPlaying(true);
        setCountdown(callSpeed);

        const filePath = "/audio/" + voiceFolder + "/" + getBingoLetter(newNumber) + formattedNum + ".mp3";
        playAudio(filePath, () => {
          setIsAudioPlaying(false);
        });
      }
    };

    return () => { if (socketRef.current) socketRef.current.close(); };
  }, [game.id, token, callSpeed]);

  // RESTORED: Start Game Logic
  const handleStartGame = () => {
    setHasStarted(true);
    setIsAudioPlaying(true);
    playAudio("/audio/" + voiceFolder + "/game_start.mp3", () => {
      setIsAudioPlaying(false);
      setIsPaused(false); 
    });
  };

  useEffect(() => {
    if (!hasStarted || isPaused || isAudioPlaying) return;
    
    const timerId = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (socketRef.current) {
            socketRef.current.send(JSON.stringify({ action: 'call_next' }));
          }
          return callSpeed;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [hasStarted, isPaused, isAudioPlaying, callSpeed]);

  async function handleCheckCard() {
    if (!cardNumberToCheck) return alert("Please enter a card number.");
    try {
      const response = await api.get("/check_win/" + game.id + "/" + cardNumberToCheck + "/");
      setCheckResult(response.data);
      setIsModalVisible(true);
    } catch (error) {
      alert("Error: Card not found.");
    }
  }

  const handleEndGame = () => {
    setIsPaused(true);
    playAudio("/audio/" + voiceFolder + "/game_end.mp3", () => {
        setTimeout(() => { onNav('create'); }, 500);
    });
  };

  const handleShuffle = () => {
    playAudio("/audio/" + voiceFolder + "/shuffle.mp3");
  };

  const pauseStatusClass = !hasStarted ? 'bg-gray-600 text-white' : isPaused ? 'bg-yellow-500 text-black' : 'bg-green-600 text-white';
  const pauseStatusText = !hasStarted ? 'WAITING' : isPaused ? 'Paused' : 'Running';

  return (
    <>
      {isModalVisible && <CardCheckModal voiceFolder={voiceFolder} checkResult={checkResult} calledNumbers={calledNumbers} onClose={() => setIsModalVisible(false)} />}
      <main className="bg-gray-950 text-white min-h-screen p-6 font-sans">
        <div className="max-w-[1200px] mx-auto">
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase">GAME #{game?.id}</h1>
              <p className="text-xs text-gray-500 font-bold">LIVE RUNNER</p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <div className="text-[10px] text-gray-500 font-black uppercase">TOTAL PRIZE</div>
                <div className="text-3xl font-black text-green-500">{prizeAmount} ETB</div>
              </div>
              <div className="bg-gray-900 px-4 py-2 rounded-lg border border-gray-800">
                <div className="text-[10px] text-gray-500 font-black uppercase">CARDS</div>
                <div className="text-xl font-black">{game?.active_card_numbers?.length || 0}</div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-8">
            <div className="flex flex-col gap-6">
              <NumberGrid calledNumbers={calledNumbers} />
              <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-gray-500 font-black uppercase">Balls Called</div>
                  <div className="text-5xl font-black text-white">{calledNumbers.size}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 font-black uppercase mb-1">Live Status</div>
                  <div className={"px-4 py-1 rounded-full text-xs font-black uppercase " + pauseStatusClass}>
                    {pauseStatusText}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-0 md:w-48 w-full">
                  <div className="text-[10px] text-gray-500 font-black uppercase mb-2">Next Ball In</div>
                  <div className="bg-gray-950 border-2 border-gray-800 text-green-500 rounded-2xl py-8 text-center text-7xl font-black">
                    <span>{!hasStarted ? '--' : isPaused ? '--' : isAudioPlaying ? '🔊' : countdown}</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-4 w-full">
                  
                  {/* RESTORED: Start Game Button Logic */}
                  {!hasStarted ? (
                    <>
                      <button onClick={handleStartGame} className="w-full py-6 rounded-xl font-black text-2xl bg-green-600 hover:bg-green-500 text-white">
                        ▶ START GAME
                      </button>
                      <button onClick={handleShuffle} className="w-full py-4 rounded-xl font-black text-xl bg-teal-600 hover:bg-teal-700 text-white">
                        🎲 SHUFFLE
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleShuffle} className="w-full py-4 rounded-xl font-black text-xl bg-teal-600 hover:bg-teal-700 text-white">
                        🎲 SHUFFLE
                      </button>
                      <button onClick={() => setIsPaused(prev => !prev)} className={"w-full py-4 rounded-xl font-black text-xl text-white " + (isPaused ? 'bg-indigo-600' : 'bg-orange-500')}>
                        {isPaused ? '▶ RESUME CALLS' : '⏸ PAUSE CALLS'}
                      </button>
                    </>
                  )}

                  <div className="flex gap-2 mt-2">
                    <input type="number" placeholder="Enter Card #" value={cardNumberToCheck} onChange={(e) => setCardNumberToCheck(e.target.value)} className="flex-1 bg-gray-950 border-2 border-gray-800 rounded-xl px-5 py-4 text-2xl font-black text-white"/>
                    <button onClick={handleCheckCard} className="px-8 bg-yellow-500 text-black rounded-xl font-black text-xl">CHECK</button>
                  </div>
                  <button onClick={handleEndGame} className="w-full py-3 rounded-xl bg-gray-800 text-red-500 font-black">END GAME</button>
                </div>
              </div>

              {/* RESTORED: Recent Calls Section */}
              <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 flex-1">
                <h3 className="text-xs text-gray-500 font-black uppercase mb-4">Recent Calls</h3>
                <div className="flex flex-wrap gap-4 items-start">
                  {currentNumber && (
                    <div className={"w-24 h-24 rounded-full border-4 flex items-center justify-center bg-gray-950 " + getLetterColorClass(getBingoLetter(currentNumber))}>
                      <span className="text-3xl font-black text-white">{getBingoLetter(currentNumber)}{currentNumber}</span>
                    </div>
                  )}
                  {callHistory.length > 0 ? callHistory.slice(0, 8).map((num, i) => (
                    <div key={i} className={"w-16 h-16 rounded-full border-2 flex items-center justify-center bg-gray-950 opacity-60 " + getLetterColorClass(getBingoLetter(num))}>
                      <span className="text-lg font-black text-white">{getBingoLetter(num)}{num}</span>
                    </div>
                  )) : null}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}