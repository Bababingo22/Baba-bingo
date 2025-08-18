import React from "react";

export default function Sidebar({ onNav, profile }) {
  return (
    <div className="w-64 p-4 bg-[#111111] h-screen">
      <div className="mb-6">
        <div className="text-xl font-bold">Yaba Bingo</div>
        <div className="text-sm text-[#9CA3AF] mt-1">shashemene</div>
      </div>
      <nav>
        <button className="w-full text-left py-2 px-3 mb-1 rounded bg-[#15233B]" onClick={() => onNav("dashboard")}>Dashboard</button>
        <button className="w-full text-left py-2 px-3 mb-1 rounded bg-transparent hover:bg-[#15233B]" onClick={() => onNav("create")}>Create Game</button>
        <button className="w-full text-left py-2 px-3 mb-1 rounded bg-transparent hover:bg-[#15233B]" onClick={() => onNav("transactions")}>Reports</button>
        <button className="w-full text-left py-2 px-3 mb-1 rounded bg-transparent hover:bg-[#15233B]" onClick={() => onNav("online")}>Online Games</button>
      </nav>
    </div>
  );
}