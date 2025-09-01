import React, { useState, useRef, useEffect } from 'react';

export default function Sidebar({ user = {}, gameHistory = [], onNav = () => {}, isExpanded = false, onToggle = () => {} }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined || val === '') return '—';
    const n = Number(val);
    if (isNaN(n)) return '—';
    return n.toFixed(2) + ' Birr';
  };

  // close profile menu when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const avatarInitial = (user.username && user.username[0]) ? user.username[0].toUpperCase() : 'U';
  const totalGames = Array.isArray(gameHistory) ? gameHistory.length : 0;

  return (
    // Make sidebar overlay when expanded so it doesn't push the wizard; collapsed stays slim
    <div
      className={`fixed left-0 top-0 h-screen text-white border-r border-gray-700 transition-all duration-300 flex flex-col
        ${isExpanded ? 'w-80 z-40 bg-[#1e2b3a] shadow-xl' : 'w-16 z-10 bg-[#1e2b3a]/95'}`}
      aria-expanded={isExpanded}
    >
      {/* Top bar: avatar + expand/collapse toggle */}
      <div className="flex items-center justify-between p-3">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setProfileOpen(prev => !prev)}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xl font-bold focus:outline-none"
            title="Profile"
          >
            {avatarInitial}
          </button>

          {profileOpen && (
            <div
              className={`absolute left-0 mt-2 rounded-md bg-[#0f172a] border border-gray-700 shadow-lg text-sm w-44 py-2 ${isExpanded ? '' : 'translate-x-0'}`}
              role="menu"
            >
              <div className="px-3 py-2">
                <div className="font-semibold">{user.username || 'User'}</div>
                <div className="text-xs text-gray-400">{user.email || ''}</div>
              </div>
              <div className="border-t border-gray-700 my-1" />
              <button
                onClick={() => { setProfileOpen(false); onNav('profile'); }}
                className="block w-full text-left px-3 py-2 hover:bg-gray-800"
                role="menuitem"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 hover:bg-gray-800 text-red-400"
                role="menuitem"
              >
                Log out
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => { setProfileOpen(false); onToggle(); }}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className="w-10 h-10 rounded-md flex items-center justify-center hover:bg-gray-700 focus:outline-none"
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {/* simple chevron icon using CSS-triangle fallback */}
          <svg className={`w-5 h-5 transform ${isExpanded ? '' : 'rotate-180'}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 5l6 5-6 5V5z" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className={`flex-1 overflow-y-auto px-3 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <nav className="flex flex-col space-y-2 mb-6">
          <button onClick={() => onNav('create')} className="p-3 text-left bg-gray-700 rounded-md font-semibold">Dashboard</button>
          <button onClick={() => onNav('report')} className="p-3 text-left hover:bg-gray-700 rounded-md">Report</button>
          <button onClick={() => alert('Online Games coming soon!')} className="p-3 text-left hover:bg-gray-700 rounded-md">Online Games</button>
        </nav>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-400 mb-3">Statistics</h3>
          <div className="space-y-3">
            <div className="bg-gray-900 p-3 rounded-lg">
              <div className="text-gray-500">Total Games</div>
              <div className="text-2xl font-bold">{totalGames}</div>
            </div>
            <div className="bg-gray-900 p-3 rounded-lg">
              <div className="text-gray-500">Wallet</div>
              <div className="text-2xl font-bold">{formatCurrency(user.operational_credit)}</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-400 mb-3">Recent Games</h3>
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">Players</th>
                <th className="p-2">Total Bet</th>
                <th className="p-2">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {Array.isArray(gameHistory) && gameHistory.slice(0, 5).map(game => {
                const date = game.created_at ? new Date(game.created_at).toLocaleDateString() : '—';
                const players = (game.players_count !== undefined && game.players_count !== null) ? game.players_count : (Array.isArray(game.active_card_numbers) ? game.active_card_numbers.length : '—');
                const totalBet = game.total_bet_amount ?? (game.amount && players ? (Number(game.amount) * Number(players)).toFixed(2) : null);
                const profit = game.profit ?? null;

                return (
                  <tr key={game.id}>
                    <td className="p-2">{date}</td>
                    <td className="p-2">{players}</td>
                    <td className="p-2">{totalBet !== null ? `${Number(totalBet).toFixed(2)} Birr` : '—'}</td>
                    <td className="p-2">{profit !== null ? `${Number(profit).toFixed(2)} Birr` : '—'}</td>
                  </tr>
                );
              })}
              {(!Array.isArray(gameHistory) || gameHistory.length === 0) && (
                <tr>
                  <td className="p-2" colSpan="4">No recent games</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer area: only visible when expanded */}
      <div className={`p-3 ${isExpanded ? 'block' : 'hidden'}`}>
        <button onClick={() => onNav('settings')} className="w-full py-2 mb-2 bg-gray-800 rounded-md hover:bg-gray-700">Settings</button>
        <button onClick={handleLogout} className="w-full py-2 bg-red-500 rounded-md hover:bg-red-600">Log Out</button>
      </div>
    </div>
  );
}