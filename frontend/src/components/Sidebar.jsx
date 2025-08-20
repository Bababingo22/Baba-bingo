import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Sidebar({ user, onNav, isExpanded, onToggle }) {
  const [stats, setStats] = useState({ totalGames: 0, wallet: 0 });
  const [recentGames, setRecentGames] = useState([]);

  useEffect(() => {
    // Only fetch stats if the sidebar is expanded to save resources
    if (isExpanded) {
      api.get('/games/history/')
        .then(response => {
          setRecentGames(response.data);
          setStats({
            totalGames: response.data.length,
            wallet: user.operational_credit
          });
        })
        .catch(error => console.error("Failed to fetch game history:", error));
    }
  }, [user.operational_credit, isExpanded]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    // The sidebar's width will change based on the isExpanded state
    <div className={`bg-[#1e2b3a] p-4 flex flex-col h-screen text-white border-r border-gray-700 transition-all duration-300 ${isExpanded ? 'w-80' : 'w-24'}`}>
      
      {/* --- TOP SECTION: User Profile (acts as the toggle button) --- */}
      <button 
        onClick={onToggle} 
        className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-700 w-full text-left mb-8"
      >
        <div className="w-12 h-12 bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold">
          {user.username.charAt(0).toUpperCase()}
        </div>
        {/* Show username only when expanded */}
        {isExpanded && (
          <div>
            <div className="font-bold text-lg">{user.username}</div>
          </div>
        )}
      </button>

      {/* --- MIDDLE SECTION: Main Content (Scrollable and Collapsible) --- */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Main Navigation */}
        <nav className="flex flex-col space-y-2 mb-8">
          <button onClick={() => onNav('create')} className="p-3 text-left bg-gray-700 rounded-md font-semibold">Dashboard</button>
          <button onClick={() => onNav('report')} className="p-3 text-left hover:bg-gray-700 rounded-md">Report</button>
          <button onClick={() => alert('Online Games coming soon!')} className="p-3 text-left hover:bg-gray-700 rounded-md">Online Games</button>
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
              <div className="text-2xl font-bold">{Number(user.operational_credit).toFixed(2)} Birr</div>
            </div>
          </div>
        </div>

        {/* Recent Games */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-400 mb-4">Recent Games</h3>
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400">
              <tr><th className="p-2">Date</th><th className="p-2">Bet</th><th className="p-2">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {recentGames.slice(0, 5).map(game => (
                <tr key={game.id}><td className="p-2">{new Date(game.created_at).toLocaleDateString()}</td><td className="p-2">{Number(game.amount).toFixed(0)} Birr</td><td className="p-2">{game.status}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- BOTTOM SECTION: Logout Button --- */}
      <div className="mt-auto">
        {/* Show logout button 