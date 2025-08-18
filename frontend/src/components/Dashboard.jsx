import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard({ user, onStartGame }) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <div className="text-sm text-[#9CA3AF]">Welcome, <span className="font-semibold">{user.username}</span></div>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#9CA3AF]">Operational Credit</div>
          <div className="text-xl font-bold">{Number(user.operational_credit).toFixed(2)} Birr</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-[#222] rounded">
          <h3 className="font-semibold mb-2">MTY Bingo</h3>
          <div className="text-sm">Create and manage games.</div>
          <div className="mt-4">
            <button className="py-2 px-3 bg-[#10B981] rounded" onClick={() => onStartGame()}>Create Game</button>
          </div>
        </div>

        <div className="p-4 bg-[#222] rounded">
          <h3 className="font-semibold mb-2">Reports</h3>
          <div className="text-sm">View transaction history and profits.</div>
        </div>
      </div>
    </div>
  );
}