import React, { useEffect, useState } from 'react';
import api from '../services/api';

const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function formatMoney(val) {
  if (val === null || val === undefined || val === '') return '—';
  const n = Number(val);
  if (Number.isNaN(n)) return '—';
  return n.toFixed(2) + ' Birr';
}

function toLocalISODate(d) {
  // return YYYY-MM-DD (local)
  const tzOffset = d.getTimezoneOffset() * 60000;
  const localISO = new Date(d - tzOffset).toISOString().slice(0,10);
  return localISO;
}

export default function ProfitReport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const fetchReport = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/profit_report/', { params });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError('Failed to load profit report.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const onFilter = (e) => {
    e?.preventDefault?.();
    const params = {};
    if (start) params.start = start;
    if (end) params.end = end;
    fetchReport(params);
  };

  // derive weekday name for a date string "YYYY-MM-DD"
  const weekdayForDate = (dateStr) => {
    if (!dateStr) return '';
    // create date at local midnight to avoid timezone shift
    const d = new Date(dateStr + 'T00:00:00');
    return WEEKDAYS[d.getDay()];
  };

  // sort rows by date ascending
  const sortedRows = [...rows].sort((a,b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));

  return (
    <div className="p-6 bg-[#0f172a] text-white min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Profit Report</h1>

        <form onSubmit={onFilter} className="flex items-center space-x-2">
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="bg-[#0b1220] border border-gray-700 px-3 py-2 rounded text-sm"
            placeholder="Start"
          />
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="bg-[#0b1220] border border-gray-700 px-3 py-2 rounded text-sm"
            placeholder="End"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm font-medium"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => {
              setStart('');
              setEnd('');
              fetchReport();
            }}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm font-medium"
          >
            Reset
          </button>
        </form>
      </div>

      {loading && <div className="p-6">Loading...</div>}
      {error && <div className="p-6 text-red-400">{error}</div>}

      {!loading && !error && (
        <div className="bg-[#1e2b3a] rounded-lg shadow-lg overflow-auto">
          <table className="min-w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-4 text-left text-sm font-semibold uppercase">Date</th>
                <th className="p-4 text-left text-sm font-semibold uppercase">Weekday</th>
                <th className="p-4 text-right text-sm font-semibold uppercase">Regular Profit</th>
                <th className="p-4 text-right text-sm font-semibold uppercase">MTN Profit</th>
                <th className="p-4 text-right text-sm font-semibold uppercase">Total Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sortedRows.length === 0 && (
                <tr>
                  <td className="p-6" colSpan="5">No data</td>
                </tr>
              )}

              {sortedRows.map((r) => (
                <tr key={r.date}>
                  <td className="p-4 whitespace-nowrap">{r.date}</td>
                  <td className="p-4">{weekdayForDate(r.date)}</td>
                  <td className="p-4 text-right">{formatMoney(r.regular_profit)}</td>
                  <td className="p-4 text-right">{formatMoney(r.mtn_profit)}</td>
                  <td className="p-4 text-right font-semibold">{formatMoney(r.total_profit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}