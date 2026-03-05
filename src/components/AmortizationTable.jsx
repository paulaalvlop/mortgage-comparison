import { useState } from 'react';
import { formatCurrency } from '../utils/calculations';

export default function AmortizationTable({ table }) {
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('yearly'); // 'monthly' | 'yearly'

  if (!table || table.length === 0) return null;

  // Build yearly summary
  const yearlyData = [];
  for (let i = 0; i < table.length; i += 12) {
    const yearRows = table.slice(i, i + 12);
    const yearNum = Math.floor(i / 12) + 1;
    yearlyData.push({
      year: yearNum,
      payment: yearRows.reduce((s, r) => s + r.payment, 0),
      interest: yearRows.reduce((s, r) => s + r.interest, 0),
      principal: yearRows.reduce((s, r) => s + r.principal, 0),
      balance: yearRows[yearRows.length - 1].balance,
    });
  }

  const displayData = viewMode === 'yearly' ? yearlyData : table;

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
      >
        <span className={`transform transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
        {expanded ? 'Ocultar' : 'Ver'} tabla de amortización
      </button>
      {expanded && (
        <div className="mt-2">
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setViewMode('yearly')}
              className={`text-xs px-2 py-1 rounded ${viewMode === 'yearly' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
            >
              Anual
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`text-xs px-2 py-1 rounded ${viewMode === 'monthly' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
            >
              Mensual
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto border rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-2 py-1.5 text-left font-medium text-gray-600">
                    {viewMode === 'yearly' ? 'Año' : 'Mes'}
                  </th>
                  <th className="px-2 py-1.5 text-right font-medium text-gray-600">Cuota</th>
                  <th className="px-2 py-1.5 text-right font-medium text-gray-600">Intereses</th>
                  <th className="px-2 py-1.5 text-right font-medium text-gray-600">Capital</th>
                  <th className="px-2 py-1.5 text-right font-medium text-gray-600">Pendiente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-2 py-1 text-gray-700">
                      {viewMode === 'yearly' ? row.year : row.month}
                    </td>
                    <td className="px-2 py-1 text-right text-gray-700">{formatCurrency(row.payment)}</td>
                    <td className="px-2 py-1 text-right text-gray-700">{formatCurrency(row.interest)}</td>
                    <td className="px-2 py-1 text-right text-gray-700">{formatCurrency(row.principal)}</td>
                    <td className="px-2 py-1 text-right text-gray-700">{formatCurrency(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
