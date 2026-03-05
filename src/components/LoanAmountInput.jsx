import { formatCurrency } from '../utils/calculations';

export default function LoanAmountInput({ loanAmount, setLoanAmount }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Importe del préstamo
      </label>
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <input
            type="number"
            min="0"
            step="1000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
            className="w-full rounded-lg border-gray-300 border px-4 py-2.5 pr-10 text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="150000"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">€</span>
        </div>
        <span className="text-sm text-gray-500">{formatCurrency(loanAmount)}</span>
      </div>
    </div>
  );
}
