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
              <th className="p-4 text-left text-sm font-semibold uppercase">Date & Time</th>
              <th className="p-4 text-left text-sm font-semibold uppercase">Type</th>
              <th className="p-4 text-left text-sm font-semibold uppercase">Amount</th>
              <th className="p-4 text-left text-sm font-semibold uppercase">Running Balance</th>
              <th className="p-4 text-left text-sm font-semibold uppercase">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td className="p-4 whitespace-nowrap">{new Date(tx.timestamp).toLocaleString()}</td>
                <td className="p-4">{tx.type_display}</td>
                <td className={`p-4 font-bold ${Number(tx.amount) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Number(tx.amount).toFixed(2)} Birr
                </td>
                <td className="p-4">{Number(tx.running_balance).toFixed(2)} Birr</td>
                <td className="p-4">{tx.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}