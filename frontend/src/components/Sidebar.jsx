import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Sidebar({ user }) {
  const [stats, setStats] = useState({ totalGames: 0, wallet: 0 });
  const [recentGames, setRecentGames] = useState([]);

  useEffect(() => {
    // Fetch game history when the component mounts
    api.get('/games/history/')
      .then(response => {
        setRecentGames(response.data);
        setStats({
          totalGames: response.data.length,
          wallet: user.operational_credit // The wallet is the user's operational credit
        });
      })
      .catch(error => console.error("Failed to fetch game history:", error));
  }, [user.operational_credit]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload(); // The easiest way to log out
  };

  return (
    <div className="w-80 bg-[#1e2b3a] p-6 flex flex-col h-screen text-white border-r border-gray-700">
      {/* User Profile Section */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-xl font-bold">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-lg">{user.username}</div>
          <button onClick={handleLogout} className="text-sm text-red-400 hover:underline">
            Log Out
          </button>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex flex-col space-y-2 mb-8">
        <a href="#" className="p-3 bg-gray-700 rounded-md font-semibold">Dashboard</a>
        <a href="#" className="p-3 hover:bg-gray-700 rounded-md">MTN Bingo</a>
        <a href="#" className="p-3 hover:bg-gray-700 rounded-md">Board</a>
        <a href="#" className="p-3 hover:bg-gray-700 rounded-md">Report</a>
        <a href="#" className="p-3 hover:bg-gray-700 rounded-md">Online Games</a>
      </nav>

      {/* Statistics */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-400 mb-4">Statistics</h3>
        <div className="space-y-4">
          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="text-gray-500">Total Games</div>
            <div className="text-2xl font-bold">{stats.totalGames}</div>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg">
            <div className="text-gray-500">Wallet</div>
            <div className="text-2xl font-bold">{Number(stats.wallet).toFixed(2)} Birr</div>
          </div>
        </div>
      </div>

      {/* Recent Games */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-400 mb-4">Recent Games</h3>
        <table className="w-full text-sm text-left">
          <thead className="text-gray-400">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Bet</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {recentGames.slice(0, 5).map(game => ( // Show only the 5 most recent
              <tr key={game.id}>
                <td className="p-2">{new Date(game.created_at).toLocaleDateString()}</td>
                <td className="p-2">{Number(game.amount).toFixed(0)} Birr</td>
                <td className="p-2">{game.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}