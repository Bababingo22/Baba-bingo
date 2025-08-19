import React, { useState } from "react";

/*
 BoardActivationCenter: presents 100 selectable items (boards).
 */
export default function BoardActivationCenter({ boards, onChange }) {
  const [active, setActive] = useState(new Set(boards.map((b,i) => i)));

  function toggle(i) {
    const next = new Set(active);
    if (next.has(i)) next.delete(i); else next.add(i);
    setActive(next);
    onChange(Array.from(next));
  }

  return (
    <div className="p-4 bg-[#111] rounded">
      <h3 className="font-semibold mb-3">Board Activation Center</h3>
      <div className="grid grid-cols-10 gap-2">
        {boards.map((b, i) => (
          <button key={i} onClick={()=>toggle(i)} className={`p-2 rounded ${active.has(i) ? 'bg-[#10B981]' : 'bg-[#262626]'}`}>
            #{i+1}
          </button>
        ))}
      </div>
    </div>
  );
}