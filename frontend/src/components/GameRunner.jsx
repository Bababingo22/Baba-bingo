import React, { useEffect, useState, useRef } from "react";

/*
 GameRunner implements:
 1) Announces number in am-ET using window.speechSynthesis.
 2) Highlights the number.
 3) Next Number display remains unchanged while voice is speaking; update immediately on speechend.
 4) Left panel with total calls, preview card, next number, controls.
 5) Right panel: grid 1-75 highlighting called numbers.
 */
export default function GameRunner({ game, token }) {
  const [socket, setSocket] = useState(null);
  const [called, setCalled] = useState(new Set(game.called_numbers || []));
  const [totalCalls, setTotalCalls] = useState(game.total_calls || 0);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [nextNumberPending, setNextNumberPending] = useState(null); // will update after speech ends
  const speakingRef = useRef(false);

  useEffect(() => {
    const wsProto = window.location.protocol === "https:" ? "wss" : "ws";
    const apiHost = (import.meta.env.VITE_API_BASE || "http://localhost:8000").replace(/^https?:\/\//, "");
    const url = `${wsProto}://${apiHost.replace(/\/$/, "")}/ws/game/${game.id}/?token=${token}`;
    const s = new WebSocket(url);
    s.onopen = () => console.log("ws open");
    s.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.action === "sequence_set") {
        // ignore
      } else if (data.action === "call_number") {
        handleIncomingCall(data.number, data.next_number);
      } else if (data.action === "ended") {
        // ended
      }
    };
    setSocket(s);
    return () => {
      s.close();
    };
    // eslint-disable-next-line
  }, []);

  function handleIncomingCall(number, next_number) {
    // When a number is called, it should be announced in am-ET.
    // NextNumber display must remain unchanged while voice is speaking; update on speechend.
    setCalled(prev => new Set(prev).add(number));
    setTotalCalls(prev => prev + 1);
    setCurrentNumber(number);
    // Push next number as pending, but show only after speech ends
    setNextNumberPending(next_number);
    speakNumber(number, () => {
      // onend
      if (next_number) {
        setCurrentNumber(number); // current still
        // show next number now:
        setNextNumberPending(null);
        setCurrentNumber(number); // current remains
        // set visible next number
        setNextVisible(next_number);
      } else {
        setNextVisible(null);
      }
    });
  }

  const [visibleNext, setNextVisible] = useState(null);

  function speakNumber(number, onEnd) {
    if (!("speechSynthesis" in window)) {
      console.warn("No TTS available");
      if (onEnd) onEnd();
      return;
    }
    const msg = new SpeechSynthesisUtterance(String(number));
    msg.lang = "am-ET";
    speakingRef.current = true;
    msg.onend = () => {
      speakingRef.current = false;
      if (onEnd) onEnd();
    };
    msg.onerror = () => {
      speakingRef.current = false;
      if (onEnd) onEnd();
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg);
  }

  function callNext() {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ action: "call_next" }));
  }

  function resumeGame() {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ action: "start" }));
  }

  const numberGrid = Array.from({ length: 75 }, (_, i) => i+1);

  return (
    <div className="p-6 text-white">
      <div className="flex gap-6">
        <div className="w-1/3 bg-[#141414] p-4 rounded">
          <div className="text-center">
            <div className="text-xs text-[#9CA3AF]">Total Calls</div>
            <div className="text-5xl font-bold">{totalCalls}</div>
          </div>
          <div className="mt-6">
            <div className="text-sm mb-1 text-[#9CA3AF]">Preview Card</div>
            <div className="bg-[#222] p-3 rounded">
              <div className="grid grid-cols-5 gap-1">
                {/* simple static preview */}
                {Array.from({length:25}).map((_,i)=>(
                  <div key={i} className={`h-8 flex items-center justify-center text-sm ${i===12 ? 'bg-white text-black' : 'bg-[#333]'}`}>{i===12?'FREE':i+1}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm text-[#9CA3AF]">Next Number</div>
            <div className="mt-2 text-center py-4 text-2xl font-bold bg-[#3B82F6] rounded">
              {visibleNext ?? (nextNumberPending ? "..." : "-")}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button onClick={resumeGame} className="flex-1 py-2 bg-[#10B981] rounded">Resume</button>
            <button onClick={()=>{}} className="flex-1 py-2 bg-[#EF4444] rounded">End Game</button>
          </div>

          <div className="mt-4">
            <button onClick={callNext} className="w-full py-2 bg-[#F59E0B] rounded">Call Next</button>
          </div>
        </div>

        <div className="flex-1 bg-[#111] p-4 rounded">
          <div className="grid grid-cols-15 gap-1">
            {numberGrid.map(n => {
              const calledClass = called.has(n) ? "bg-[#F59E0B] text-black" : "bg-[#262626]";
              return (
                <div key={n} className={`py-3 text-center rounded ${calledClass}`}>
                  {n}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}