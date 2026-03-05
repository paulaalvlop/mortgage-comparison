import { useState } from 'react';
import MortgageCard from './MortgageCard';
import {
  amortizationTable,
  totalRealCost,
} from '../utils/calculations';

export default function ComparisonView({ mortgages, loanAmount, scenarios }) {
  const [activeScenarioTab, setActiveScenarioTab] = useState(null); // null = base case

  if (mortgages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">Añade hipotecas para comparar</p>
      </div>
    );
  }

  // Find the mortgage with lowest real cost (base case only for highlighting)
  let lowestId = null;
  let lowestCost = Infinity;
  for (const m of mortgages) {
    const termYears = parseFloat(m.termYears) || 0;
    const interestRate = parseFloat(m.interestRate) || 0;
    if (loanAmount <= 0 || termYears <= 0 || interestRate <= 0) continue;

    const table = amortizationTable(
      loanAmount,
      interestRate,
      termYears,
      m.hasInitialRate,
      parseFloat(m.initialRate) || 0,
      parseFloat(m.initialRatePeriod) || 0
    );
    const cost = totalRealCost(table, m.vinculaciones, termYears, m.openingFee, m.brokerFee);
    if (cost < lowestCost) {
      lowestCost = cost;
      lowestId = m.id;
    }
  }

  const activeScenario = activeScenarioTab !== null && scenarios && scenarios[activeScenarioTab]
    ? scenarios[activeScenarioTab]
    : null;

  const hasScenarios = scenarios && scenarios.length > 0;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Comparación</h2>

      {/* Scenario tabs */}
      {hasScenarios && (
        <div className="flex items-center gap-1 mb-4 overflow-x-auto">
          <button
            onClick={() => setActiveScenarioTab(null)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeScenarioTab === null
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sin amortización anticipada
          </button>
          {scenarios.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveScenarioTab(i)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                activeScenarioTab === i
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.name || `Escenario ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {mortgages.map((m) => (
          <div key={m.id} className="flex-shrink-0 w-[300px]">
            <MortgageCard
              mortgage={m}
              loanAmount={loanAmount}
              isLowest={mortgages.length > 1 && m.id === lowestId}
              scenario={activeScenario}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
