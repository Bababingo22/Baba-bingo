import React from 'react';

export default function Sidebar({ data, error, onNav, isExpanded, onToggle }) {
  const { user, gameHistory } = data;

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className={`bg-[#1e2b3a] p-4 flex flex-col h-screen text-white border-r border-gray-700 transition-all duration-300 ${isExpanded ? 'w-80' : 'w-24'}`}>
      
      <button onClick={onToggle} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-700 w-full text-left mb-8">
        <div className="w-12 h-12 bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold">
          {user.username.charAt(0).toUpperCase()}
        </div>
        {isExpanded && (<div><div className="font-bold text-lg">{user.username}</div></div>)}
      </button>

      <div className={`flex-1 overflow-y-auto overflow-x-hidden transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
        <nav className="flex flex-col space-y-2 mb-8">
          <button onClick={() => onNav('create')} className="p-3 text-left bg-gray-700 rounded-md font-semibold">Dashboard</button>
          <button onClick={() => onNav('report')} className="p-3 text-left hover:bg-gray-700 rounded-md">Report</button>
          <button onClick={() => alert('Online Games coming soon!')} className="p-3 text-left hover:bg-gray-700 rounded-md">Online Games</button>
        </nav>

        {/* This section now shows errors if they happen */}
        {error && <div className="p-4 bg-red-800 text-red-200 rounded-md mb-4">{error}</div>}

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-400 mb-4">Statistics</h3>
          <div className="space-y-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-gray-500">Total Games</div>
              <div className="text-2xl font-bold">{gameHistory.length}</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-gray-500">Wallet</div>
              <div className="text-2xl font-bold">{Number(user.operational_credit).toFixed(2)} Birr</div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-400 mb-4">Recent Games</h3>
          <table className="w-full text-sm text-left">
            <thead className="text-gray-400">
              <tr><th className="p-2">Date</th><th className="p-2">Bet</th><th className="p-2">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {gameHistory.slice(0, 5).map(game => (
                <tr key={game.id}><td className="p-2">{new Date(game.created_at).toLocaleDateString()}</td><td className="p-2">{Number(game.amount).toFixed(0)} Birr</td><td className="p-2">{game.status}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-auto">
        {isExpanded && (
          <button onClick={handleLogout} className="w-full mt-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600">
            Log Out
          </button>
        )}
      </div>
    </div>
  );
}