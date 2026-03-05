const VINCULACION_TYPES = [
  { type: 'nomina', label: 'Nómina' },
  { type: 'hogar', label: 'Seguro de hogar' },
  { type: 'vida', label: 'Seguro de vida' },
  { type: 'otro', label: 'Otro' },
];

export default function VinculacionSelector({ vinculaciones, onChange }) {
  const activeTypes = vinculaciones.map((v) => v.type);

  function toggleType(type) {
    if (activeTypes.includes(type)) {
      onChange(vinculaciones.filter((v) => v.type !== type));
    } else {
      const def = VINCULACION_TYPES.find((t) => t.type === type);
      onChange([...vinculaciones, { type, label: def.label, monthlyCost: 0 }]);
    }
  }

  function updateVinculacion(type, field, value) {
    onChange(vinculaciones.map((v) => (v.type === type ? { ...v, [field]: value } : v)));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Vinculaciones</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {VINCULACION_TYPES.map(({ type, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => toggleType(type)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              activeTypes.includes(type)
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {activeTypes.includes(type) ? '✓ ' : ''}
            {label}
          </button>
        ))}
      </div>
      {vinculaciones.length > 0 && (
        <div className="space-y-2 mt-2">
          {vinculaciones.map((v) => (
            <div key={v.type} className="flex items-center gap-2">
              {v.type === 'otro' ? (
                <input
                  type="text"
                  value={v.label}
                  onChange={(e) => updateVinculacion(v.type, 'label', e.target.value)}
                  placeholder="Descripción"
                  className="flex-1 rounded border-gray-300 border px-2 py-1 text-sm"
                />
              ) : (
                <span className="flex-1 text-sm text-gray-600">{v.label}</span>
              )}
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={v.monthlyCost}
                  onChange={(e) => updateVinculacion(v.type, 'monthlyCost', e.target.value)}
                  className="w-24 rounded border-gray-300 border px-2 py-1 pr-8 text-sm text-right"
                  placeholder="0"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">€/mes</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
