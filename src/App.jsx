import { useState } from 'react';
import LoanAmountInput from './components/LoanAmountInput';
import MortgageForm from './components/MortgageForm';
import EarlyAmortizationScenarios from './components/EarlyAmortizationScenarios';
import ComparisonView from './components/ComparisonView';

let nextId = 1;

function createMortgage() {
  return {
    id: String(nextId++),
    entity: '',
    rateType: 'fijo',
    interestRate: '',
    hasInitialRate: false,
    initialRate: '',
    initialRatePeriod: '',
    termYears: 25,
    vinculaciones: [],
    openingFee: 0,
    brokerFee: 0,
    earlyAmortizationFees: [],
  };
}

const MAX_MORTGAGES = 8;

export default function App() {
  const [loanAmount, setLoanAmount] = useState(150000);
  const [mortgages, setMortgages] = useState([createMortgage()]);
  const [activeTab, setActiveTab] = useState('0');
  const [amortizationScenarios, setAmortizationScenarios] = useState([]);

  function addMortgage() {
    if (mortgages.length >= MAX_MORTGAGES) return;
    const m = createMortgage();
    setMortgages([...mortgages, m]);
    setActiveTab(String(mortgages.length));
  }

  function removeMortgage(index) {
    const updated = mortgages.filter((_, i) => i !== index);
    setMortgages(updated);
    if (parseInt(activeTab) >= updated.length) {
      setActiveTab(String(Math.max(0, updated.length - 1)));
    }
  }

  function updateMortgage(index, mortgage) {
    const updated = [...mortgages];
    updated[index] = mortgage;
    setMortgages(updated);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Comparador de Hipotecas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Compara hasta {MAX_MORTGAGES} ofertas de hipoteca fija lado a lado
        </p>
      </div>

      {/* Loan amount */}
      <LoanAmountInput loanAmount={loanAmount} setLoanAmount={setLoanAmount} />

      {/* Mortgage forms with tabs */}
      <div className="mb-8">
        <div className="flex items-center gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
          {mortgages.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setActiveTab(String(i))}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === String(i)
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {m.entity || `Hipoteca ${i + 1}`}
            </button>
          ))}
          {mortgages.length < MAX_MORTGAGES && (
            <button
              onClick={addMortgage}
              className="px-4 py-2 text-sm font-medium text-blue-500 hover:text-blue-700 whitespace-nowrap"
            >
              + Añadir
            </button>
          )}
        </div>

        {mortgages.map((m, i) => (
          <div key={m.id} className={activeTab === String(i) ? '' : 'hidden'}>
            <MortgageForm
              mortgage={m}
              onChange={(updated) => updateMortgage(i, updated)}
              onRemove={() => removeMortgage(i)}
            />
          </div>
        ))}
      </div>

      {/* Early amortization scenarios */}
      <EarlyAmortizationScenarios
        scenarios={amortizationScenarios}
        onChange={setAmortizationScenarios}
      />

      {/* Comparison view */}
      <ComparisonView
        mortgages={mortgages}
        loanAmount={loanAmount}
        scenarios={amortizationScenarios}
      />
    </div>
  );
}
