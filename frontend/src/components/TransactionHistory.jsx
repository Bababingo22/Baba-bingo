import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function TransactionHistory() {
  const [txs, setTxs] = useState([]);

  useEffect(() => {
    async function load() {
      const resp = await api.get("/transactions/");
      setTxs(resp.data);
    }
    load();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">የግብዣ መለያ (Transaction History)</h2>
      <div className="bg-[#111] rounded">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-[#9CA3AF]">
              <th className="p-3">Date & Time</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Running Balance</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {txs.map(tx => (
              <tr key={tx.id} className="border-t border-[#222]">
                <td className="p-3 text-sm">{new Date(tx.timestamp).toLocaleString()}</td>
                <td className="p-3">{tx.type_display}</td>
                <td className="p-3">{Number(tx.amount) >= 0 ? `+${Number(tx.amount).toFixed(2)} Birr` : `${Number(tx.amount).toFixed(2)} Birr`}</td>
                <td className="p-3">{Number(tx.running_balance).toFixed(2)} Birr</td>
                <td className="p-3">{tx.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}