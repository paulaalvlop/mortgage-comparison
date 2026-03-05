import {
  amortizationTable,
  amortizationTableWithScenario,
  totalInterest,
  totalVinculacionesCost,
  totalRealCost,
  calculateTAE,
  formatCurrency,
  formatPercent,
} from '../utils/calculations';
import AmortizationTable from './AmortizationTable';

export default function MortgageCard({ mortgage, loanAmount, isLowest, scenario }) {
  const termYears = parseFloat(mortgage.termYears) || 0;
  const interestRate = parseFloat(mortgage.interestRate) || 0;
  const initialRate = parseFloat(mortgage.initialRate) || 0;
  const initialRatePeriod = parseFloat(mortgage.initialRatePeriod) || 0;

  if (loanAmount <= 0 || termYears <= 0 || interestRate <= 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 min-w-[280px]">
        <h3 className="font-semibold text-gray-800">{mortgage.entity || 'Sin nombre'}</h3>
        <p className="text-xs text-gray-500 mt-1 mb-3">
          Fijo · {parseFloat(mortgage.termYears) || '—'} años
        </p>
        <p className="text-sm text-gray-400">Introduce los datos para ver resultados</p>
      </div>
    );
  }

  const table = amortizationTable(
    loanAmount,
    interestRate,
    termYears,
    mortgage.hasInitialRate,
    initialRate,
    initialRatePeriod
  );

  const interest = totalInterest(table);
  const vincCost = totalVinculacionesCost(mortgage.vinculaciones, termYears);
  const initialFees = (parseFloat(mortgage.openingFee) || 0) + (parseFloat(mortgage.brokerFee) || 0);
  const realCost = totalRealCost(table, mortgage.vinculaciones, termYears, mortgage.openingFee, mortgage.brokerFee);
  const tae = calculateTAE(loanAmount, table, mortgage.vinculaciones, mortgage.openingFee, mortgage.brokerFee);

  // Detect dual-rate payments
  const phase1Payment = table.length > 0 ? table[0].payment : 0;
  const phase2Row = table.find((r) => r.phase === 2);
  const phase2Payment = phase2Row ? phase2Row.payment : null;
  const isDualRate = mortgage.hasInitialRate && phase2Payment && Math.abs(phase1Payment - phase2Payment) > 0.01;

  // Scenario calculations
  const hasScenario = scenario && scenario.events && scenario.events.length > 0;
  let scenarioResult = null;
  let scenarioInterest = 0;
  let scenarioVincCost = 0;
  let scenarioRealCost = 0;
  let interestSaved = 0;

  if (hasScenario) {
    scenarioResult = amortizationTableWithScenario(
      loanAmount, interestRate, termYears,
      mortgage.hasInitialRate, initialRate, initialRatePeriod,
      scenario, mortgage.earlyAmortizationFees
    );
    scenarioInterest = totalInterest(scenarioResult.table);
    const scenarioTermYears = scenarioResult.table.length / 12;
    scenarioVincCost = totalVinculacionesCost(mortgage.vinculaciones, scenarioTermYears);
    scenarioRealCost = scenarioInterest + scenarioVincCost + initialFees + scenarioResult.earlyFeesPaid;
    interestSaved = interest - scenarioInterest;
  }

  const displayTable = hasScenario ? scenarioResult.table : table;

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 p-5 min-w-[280px] ${isLowest ? 'border-green-400 ring-2 ring-green-100' : 'border-gray-200'}`}>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{mortgage.entity || 'Sin nombre'}</h3>
          {isLowest && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              Más barata
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Fijo {formatPercent(interestRate)}
          {mortgage.hasInitialRate && initialRate > 0 && ` (${formatPercent(initialRate)} primeros ${initialRatePeriod} a.)`}
          {' · '}{termYears} años
        </p>
        {mortgage.vinculaciones.length > 0 && (
          <p className="text-xs text-gray-400 mt-0.5">
            {mortgage.vinculaciones.map((v) => v.label).join(', ')}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {/* Monthly payment */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Cuota mensual</p>
          {hasScenario ? (
            <div>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(scenarioResult.currentPayment)}
              </p>
              {Math.abs(scenarioResult.currentPayment - phase1Payment) > 0.01 && (
                <p className="text-xs text-gray-400 line-through">{formatCurrency(phase1Payment)}</p>
              )}
            </div>
          ) : isDualRate ? (
            <div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(phase2Payment)}</p>
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-gray-700">{formatCurrency(phase1Payment)}</span>
                {' '}primeros {initialRatePeriod} años
              </p>
            </div>
          ) : (
            <p className="text-xl font-bold text-gray-900">{formatCurrency(phase1Payment)}</p>
          )}
        </div>

        {/* Total interest */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total intereses pagados</p>
          <p className="text-lg font-semibold text-gray-800">
            {formatCurrency(hasScenario ? scenarioInterest : interest)}
          </p>
          {hasScenario && interestSaved > 0 && (
            <p className="text-xs text-green-600 font-medium">-{formatCurrency(interestSaved)} vs. base</p>
          )}
        </div>

        {/* Vinculaciones cost */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Coste total vinculaciones</p>
          <p className="text-lg font-semibold text-gray-800">
            {formatCurrency(hasScenario ? scenarioVincCost : vincCost)}
          </p>
        </div>

        {/* Initial fees */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Gastos iniciales</p>
          <p className="text-lg font-semibold text-gray-800">{formatCurrency(initialFees)}</p>
        </div>

        {/* Early amortization fees (only shown with scenario) */}
        {hasScenario && scenarioResult.earlyFeesPaid > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Comisiones amortización anticipada</p>
            <p className="text-lg font-semibold text-orange-600">{formatCurrency(scenarioResult.earlyFeesPaid)}</p>
          </div>
        )}

        {/* Real total cost */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Coste real total del préstamo</p>
          <p className="text-xl font-bold text-blue-700">
            {formatCurrency(hasScenario ? scenarioRealCost : realCost)}
          </p>
          {hasScenario && (
            <p className="text-xs text-green-600 font-medium">
              -{formatCurrency(realCost - scenarioRealCost)} vs. base
            </p>
          )}
        </div>

        {/* Months/years saved (only with scenario) */}
        {hasScenario && scenarioResult.monthsSaved > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Plazo ahorrado</p>
            <p className="text-lg font-semibold text-green-700">
              {scenarioResult.monthsSaved >= 12
                ? `${Math.floor(scenarioResult.monthsSaved / 12)} años ${scenarioResult.monthsSaved % 12} meses`
                : `${scenarioResult.monthsSaved} meses`}
            </p>
          </div>
        )}

        {/* TAE */}
        {!hasScenario && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">TAE (Tipo efectivo real)</p>
            <p className="text-lg font-semibold text-gray-800">{formatPercent(tae)}</p>
          </div>
        )}
      </div>

      <AmortizationTable table={displayTable} />
    </div>
  );
}
