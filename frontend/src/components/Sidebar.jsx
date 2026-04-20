import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const WEEKDAYS_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const WEEKDAYS_FULL  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function Sidebar({
  user = {},
  gameHistory = [],
  onNav = () => {},
  isExpanded: controlledIsExpanded = undefined,
  onToggle = () => {}
}) {
  const [expanded, setExpanded] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);
  const [weekData, setWeekData] = useState([]);
  const [weekLoading, setWeekLoading] = useState(true);
  const [weekError, setWeekError] = useState(null);
  const avatarInitial = (user.username && user.username[0]) ? user.username[0].toUpperCase() : 'U';
  const totalGames = Array.isArray(gameHistory) ? gameHistory.length : 0;

  const formatCurrency = (val) => {
    if (val === null || val === undefined || val === '') return '—';
    const n = Number(val);
    if (Number.isNaN(n)) return '—';
    return n.toFixed(2) + ' Birr';
  };

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function toLocalISODate(d) {
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d - tzOffset).toISOString().slice(0, 10);
  }

  const computeWeekRange = () => {
    const today = new Date();
    const day = today.getDay();
    const diffToMon = (day + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMon);
    monday.setHours(0,0,0,0);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  useEffect(() => {
    let cancelled = false;
    const days = computeWeekRange();
    const start = toLocalISODate(days[0]);
    const end = toLocalISODate(days[6]);

    const fetchWeek = async () => {
      setWeekLoading(true);
      setWeekError(null);
      try {
        const res = await api.get('/profit_report/', { params: { start, end } });
        const rows = Array.isArray(res.data) ? res.data : [];
        const byDate = rows.reduce((acc, cur) => {
          if (cur && cur.date) acc[cur.date] = cur;
          return acc;
        }, {});
        const mapped = days.map((d, idx) => {
          const iso = toLocalISODate(d);
          const row = byDate[iso] || null;
          return {
            date: iso,
            weekdayShort: WEEKDAYS_SHORT[idx],
            weekdayFull: WEEKDAYS_FULL[idx],
            regular_profit: row ? row.regular_profit : null,
            mtn_profit: row ? row.mtn_profit : null,
            total_profit: row ? row.total_profit : null,
          };
        });
        if (!cancelled) setWeekData(mapped);
      } catch (err) {
        console.error('Failed to fetch weekly profit', err);
        if (!cancelled) {
          setWeekError('Failed to load weekly profit.');
          setWeekData([]);
        }
      } finally {
        if (!cancelled) setWeekLoading(false);
      }
    };

    fetchWeek();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const openProfitReport = (e) => {
    e?.preventDefault?.();
    onNav('report');
  };

  const toggleExpanded = (next) => {
    const newVal = typeof next === 'boolean' ? next : !expanded;
    setExpanded(newVal);
    try { onToggle(); } catch (e) {}
  };

  const handleProfileTap = () => {
    if (!expanded) {
      toggleExpanded(true);
      setTimeout(() => setProfileOpen(true), 260);
    } else {
      setProfileOpen(false);
      toggleExpanded(false);
    }
  };

  const isExpanded = expanded;

  return (
    <div
      className={`fixed left-0 top-0 h-screen text-white border-r border-gray-700 transition-all duration-300 flex flex-col
        ${isExpanded ? 'w-80 z-40 bg-[#1e2b3a] shadow-xl' : 'w-16 z-10 bg-[#1e2b3a]/95'}`}
      aria-expanded={isExpanded}
    >
      <div className="flex items-center justify-between p-3">
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleProfileTap}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xl font-bold focus:outline-none"
            title="Profile"
          >
            {avatarInitial}
          </button>
          
          {profileOpen && isExpanded && (
            <div
              className="absolute left-0 mt-2 rounded-md bg-[#0f172a] border border-gray-700 shadow-lg text-sm py-2 w-44 z-50"
              role="menu"
            >
              {/* This is empty as per your previous request */}
            </div>
          )}
        </div>
        <div style={{ width: 40 }} />
      </div>
      
      {!isExpanded && (
        <div className="flex-0 flex flex-col items-center space-y-1 py-2 px-1">
          {weekLoading && <div className="text-xs text-gray-400">..</div>}
          {weekError && <div className="text-xs text-red-400">!</div>}
          {!weekLoading && !weekError && (
            <div className="w-full flex flex-col items-center gap-1">
              {weekData.map((d) => (
                <div key={d.date} className="w-full flex items-center justify-center text-center">
                  <div className="text-[10px] text-gray-300 leading-none">{d.weekdayShort}</div>
                  <div className="text-[10px] text-yellow-400 leading-none mt-0.5">{d.total_profit !== null ? Number(d.total_profit).toFixed(0) : '—'}</div>
                </div>
              ))}
              <button onClick={openProfitReport} className="mt-1 text-xs text-blue-300 hover:underline">Open</button>
            </div>
          )}
        </div>
      )}

      <div className={`flex-1 overflow-y-auto px-3 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* *** NAVIGATION BUTTON STYLES ARE NOW SIMPLIFIED *** */}
        <nav className="flex flex-col space-y-2 mb-6">
          <button 
            onClick={() => onNav('create')} 
            className="p-3 text-left rounded-md hover:bg-gray-700"
          >
            Dashboard
          </button>
          <button 
            onClick={() => onNav('report')} 
            className="p-3 text-left rounded-md hover:bg-gray-700"
          >
            Report
          </button>
          <button 
            onClick={() => alert('Online Games coming soon!')} 
            className="p-3 text-left rounded-md hover:bg-gray-700"
          >
            Online Games
          </button>
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
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-400">Week Profit</h3>
            <button onClick={openProfitReport} className="text-sm text-blue-400 hover:underline">Open Report</button>
          </div>
          <div className="bg-[#121827] border border-gray-700 rounded-md overflow-hidden">
            <div className="divide-y divide-gray-800">
              {weekLoading && <div className="p-3 text-sm text-gray-400">Loading...</div>}
              {!weekLoading && weekError && <div className="p-3 text-sm text-red-400">{weekError}</div>}
              {!weekLoading && !weekError && weekData.map((d) => (
                <div key={d.date} className="flex items-center justify-between px-3 py-2">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-200">{d.weekdayFull}</div>
                    <div className="text-xs text-gray-400">{d.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-yellow-400">{d.total_profit !== null ? formatCurrency(d.total_profit) : '—'}</div>
                    <div className="text-xs text-gray-400">{d.regular_profit !== null ? formatCurrency(d.regular_profit) : '—'} / {d.mtn_profit !== null ? formatCurrency(d.mtn_profit) : '—'}</div>
                  </div>
                </div>
              ))}
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
      <div className={`p-3 ${isExpanded ? 'block' : 'hidden'}`}>
        <button onClick={() => onNav('settings')} className="w-full py-2 mb-2 bg-gray-800 rounded-md hover:bg-gray-700">Settings</button>
        <button onClick={handleLogout} className="w-full py-2 bg-red-500 rounded-md hover:bg-red-600">Log Out</button>
      </div>
    </div>
  );
}