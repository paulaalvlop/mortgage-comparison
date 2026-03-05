import VinculacionSelector from './VinculacionSelector';

export default function MortgageForm({ mortgage, onChange, onRemove }) {
  function update(field, value) {
    onChange({ ...mortgage, [field]: value });
  }

  function updateEarlyFee(index, field, value) {
    const fees = [...mortgage.earlyAmortizationFees];
    fees[index] = { ...fees[index], [field]: value };
    update('earlyAmortizationFees', fees);
  }

  function addEarlyFee() {
    update('earlyAmortizationFees', [
      ...mortgage.earlyAmortizationFees,
      { fromYear: 0, toYear: 5, feePercent: 0 },
    ]);
  }

  function removeEarlyFee(index) {
    update(
      'earlyAmortizationFees',
      mortgage.earlyAmortizationFees.filter((_, i) => i !== index)
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">
          {mortgage.entity || 'Nueva hipoteca'}
        </h3>
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-600 text-sm font-medium"
        >
          Eliminar
        </button>
      </div>

      {/* Bank name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Entidad</label>
        <input
          type="text"
          value={mortgage.entity}
          onChange={(e) => update('entity', e.target.value)}
          className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm"
          placeholder="Nombre del banco"
        />
      </div>

      {/* Rate type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de interés</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              checked={mortgage.rateType === 'fijo'}
              onChange={() => update('rateType', 'fijo')}
              className="text-blue-600"
            />
            Fijo
          </label>
          <label className="flex items-center gap-1.5 text-sm text-gray-400 cursor-not-allowed" title="Próximamente">
            <input type="radio" disabled className="text-gray-300" />
            Variable
            <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Próximamente</span>
          </label>
        </div>
      </div>

      {/* Interest rate */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de interés anual (%)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={mortgage.interestRate}
            onChange={(e) => update('interestRate', e.target.value)}
            className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm"
            placeholder="2.50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plazo (años)</label>
          <input
            type="number"
            min="1"
            max="40"
            value={mortgage.termYears}
            onChange={(e) => update('termYears', e.target.value)}
            className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm"
            placeholder="25"
          />
        </div>
      </div>

      {/* Initial rate toggle */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={mortgage.hasInitialRate}
            onChange={(e) => update('hasInitialRate', e.target.checked)}
            className="rounded text-blue-600"
          />
          Tipo inicial diferente
        </label>
        {mortgage.hasInitialRate && (
          <div className="grid grid-cols-2 gap-3 mt-2 pl-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tipo inicial (%)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={mortgage.initialRate}
                onChange={(e) => update('initialRate', e.target.value)}
                className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm"
                placeholder="1.50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Duración (años)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={mortgage.initialRatePeriod}
                onChange={(e) => update('initialRatePeriod', e.target.value)}
                className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm"
                placeholder="2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Vinculaciones */}
      <VinculacionSelector
        vinculaciones={mortgage.vinculaciones}
        onChange={(v) => update('vinculaciones', v)}
      />

      {/* Fees */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comisión de apertura (€)</label>
          <input
            type="number"
            min="0"
            step="50"
            value={mortgage.openingFee}
            onChange={(e) => update('openingFee', e.target.value)}
            className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comisión de bróker (€)</label>
          <input
            type="number"
            min="0"
            step="50"
            value={mortgage.brokerFee}
            onChange={(e) => update('brokerFee', e.target.value)}
            className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm"
            placeholder="0"
          />
        </div>
      </div>

      {/* Early amortization fees */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Comisiones por amortización anticipada</label>
          <button
            type="button"
            onClick={addEarlyFee}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            + Añadir periodo
          </button>
        </div>
        {mortgage.earlyAmortizationFees.length === 0 && (
          <p className="text-xs text-gray-400">Sin comisiones configuradas</p>
        )}
        {mortgage.earlyAmortizationFees.map((fee, i) => (
          <div key={i} className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-gray-500">Año</span>
            <input
              type="number"
              min="0"
              value={fee.fromYear}
              onChange={(e) => updateEarlyFee(i, 'fromYear', e.target.value)}
              className="w-14 rounded border-gray-300 border px-2 py-1 text-sm text-center"
            />
            <span className="text-xs text-gray-500">a</span>
            <input
              type="number"
              min="0"
              value={fee.toYear}
              onChange={(e) => updateEarlyFee(i, 'toYear', e.target.value)}
              className="w-14 rounded border-gray-300 border px-2 py-1 text-sm text-center"
            />
            <span className="text-xs text-gray-500">→</span>
            <input
              type="number"
              min="0"
              step="0.1"
              value={fee.feePercent}
              onChange={(e) => updateEarlyFee(i, 'feePercent', e.target.value)}
              className="w-16 rounded border-gray-300 border px-2 py-1 text-sm text-right"
            />
            <span className="text-xs text-gray-500">%</span>
            <button
              type="button"
              onClick={() => removeEarlyFee(i)}
              className="text-red-400 hover:text-red-600 text-xs ml-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
