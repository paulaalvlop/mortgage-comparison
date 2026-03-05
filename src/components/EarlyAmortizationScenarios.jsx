import { useState } from 'react';

const MAX_SCENARIOS = 3;

export default function EarlyAmortizationScenarios({ scenarios, onChange }) {
  const [activeTab, setActiveTab] = useState(0);

  function addScenario() {
    if (scenarios.length >= MAX_SCENARIOS) return;
    const newScenario = {
      id: String(Date.now()),
      name: `Escenario ${scenarios.length + 1}`,
      events: [],
    };
    onChange([...scenarios, newScenario]);
    setActiveTab(scenarios.length);
  }

  function removeScenario(index) {
    const updated = scenarios.filter((_, i) => i !== index);
    onChange(updated);
    if (activeTab >= updated.length) {
      setActiveTab(Math.max(0, updated.length - 1));
    }
  }

  function updateScenario(index, scenario) {
    const updated = [...scenarios];
    updated[index] = scenario;
    onChange(updated);
  }

  function updateName(index, name) {
    updateScenario(index, { ...scenarios[index], name });
  }

  function addEvent(scenarioIndex) {
    const scenario = scenarios[scenarioIndex];
    updateScenario(scenarioIndex, {
      ...scenario,
      events: [...scenario.events, { year: 1, amount: 10000, reduceType: 'term' }],
    });
  }

  function updateEvent(scenarioIndex, eventIndex, field, value) {
    const scenario = scenarios[scenarioIndex];
    const events = [...scenario.events];
    events[eventIndex] = { ...events[eventIndex], [field]: value };
    updateScenario(scenarioIndex, { ...scenario, events });
  }

  function removeEvent(scenarioIndex, eventIndex) {
    const scenario = scenarios[scenarioIndex];
    updateScenario(scenarioIndex, {
      ...scenario,
      events: scenario.events.filter((_, i) => i !== eventIndex),
    });
  }

  if (scenarios.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Amortización anticipada</h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-3">
            Simula pagos anticipados que se aplican a todas las hipotecas.
          </p>
          <button
            onClick={addScenario}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Añadir escenario
          </button>
        </div>
      </div>
    );
  }

  const current = scenarios[activeTab];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Amortización anticipada</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 px-4 pt-3 overflow-x-auto">
          {scenarios.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(i)}
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === i
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {s.name || `Escenario ${i + 1}`}
            </button>
          ))}
          {scenarios.length < MAX_SCENARIOS && (
            <button
              onClick={addScenario}
              className="px-3 py-2 text-sm font-medium text-blue-500 hover:text-blue-700 whitespace-nowrap"
            >
              + Añadir
            </button>
          )}
        </div>

        {/* Active scenario editor */}
        {current && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <label className="block text-xs text-gray-500 mb-1">Nombre del escenario</label>
                <input
                  type="text"
                  value={current.name}
                  onChange={(e) => updateName(activeTab, e.target.value)}
                  className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm"
                  placeholder="Nombre"
                />
              </div>
              <button
                onClick={() => removeScenario(activeTab)}
                className="text-red-400 hover:text-red-600 text-sm font-medium mt-4"
              >
                Eliminar escenario
              </button>
            </div>

            {/* Events */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Pagos anticipados</label>
                <button
                  onClick={() => addEvent(activeTab)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Añadir pago
                </button>
              </div>

              {current.events.length === 0 && (
                <p className="text-xs text-gray-400">No hay pagos configurados en este escenario.</p>
              )}

              <div className="space-y-2">
                {current.events.map((ev, i) => (
                  <div key={i} className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">Año</span>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      value={ev.year}
                      onChange={(e) => updateEvent(activeTab, i, 'year', parseInt(e.target.value) || 1)}
                      className="w-16 rounded border-gray-300 border px-2 py-1 text-sm text-center"
                    />
                    <span className="text-xs text-gray-500">Importe</span>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={ev.amount}
                        onChange={(e) => updateEvent(activeTab, i, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-28 rounded border-gray-300 border px-2 py-1 text-sm text-right pr-6"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
                    </div>
                    <select
                      value={ev.reduceType || 'term'}
                      onChange={(e) => updateEvent(activeTab, i, 'reduceType', e.target.value)}
                      className="rounded border-gray-300 border px-2 py-1 text-sm"
                    >
                      <option value="term">Reducir plazo</option>
                      <option value="payment">Reducir cuota</option>
                    </select>
                    <button
                      onClick={() => removeEvent(activeTab, i)}
                      className="text-red-400 hover:text-red-600 text-xs ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
