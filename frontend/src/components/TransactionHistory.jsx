import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/transactions/')
      .then(response => {
        setTransactions(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load transaction history.');
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading transactions...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-400">{error}</div>;
  }

  return (
    <div className="p-6 bg-[#0f172a] text-white">
      <h1 className="text-3xl font-bold mb-6">Transaction Report</h1>
      <div className="bg-[#1e2b3a] rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-700">
            <tr>
              {/* Header padding is slightly reduced for a tighter look */}
              <th className="px-4 py-3 text-left text-sm font-semibold uppercase">Remaining Total Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold uppercase">Bet Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold uppercase">Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold uppercase">Date & Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {transactions.map(tx => (
              <tr key={tx.id}>
                {/* Cell padding is reduced (py-2) and font size is smaller (text-sm) */}
                <td className="px-4 py-2 text-sm">{Number(tx.running_balance).toFixed(2)} Birr</td>
                <td className={`px-4 py-2 text-sm font-bold ${Number(tx.amount) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Number(tx.amount).toFixed(2)} Birr
                </td>
                <td className="px-4 py-2 text-sm">{tx.type_display}</td>
                <td className="px-4 py-2 text-sm whitespace-nowrap">{new Date(tx.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}