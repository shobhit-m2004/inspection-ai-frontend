import { useMemo, useState } from 'react';

interface ParameterSelectorProps {
  mode: 'auto' | 'manual';
  onModeChange: (mode: 'auto' | 'manual') => void;
  selected: string[];
  onSelectedChange: (params: string[]) => void;
  predefined: string[];
}

export function ParameterSelector({
  mode,
  onModeChange,
  selected,
  onSelectedChange,
  predefined,
}: ParameterSelectorProps) {
  const [customParam, setCustomParam] = useState('');

  const available = useMemo(
    () => predefined.filter((item) => !selected.includes(item)).sort((a, b) => a.localeCompare(b)),
    [predefined, selected],
  );

  const addParameter = (param: string) => {
    const clean = param.trim();
    if (!clean || selected.includes(clean)) {
      return;
    }
    onSelectedChange([...selected, clean]);
  };

  const removeParameter = (param: string) => {
    onSelectedChange(selected.filter((item) => item !== param));
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => onModeChange('auto')}
          className={`rounded-lg px-3 py-2 text-sm ${
            mode === 'auto' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Auto Extract
        </button>
        <button
          type="button"
          onClick={() => onModeChange('manual')}
          className={`rounded-lg px-3 py-2 text-sm ${
            mode === 'manual' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Manual Parameters
        </button>
      </div>

      {mode === 'manual' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {available.map((param) => (
              <button
                key={param}
                type="button"
                onClick={() => addParameter(param)}
                className="rounded-full border border-brand-300 px-3 py-1 text-xs text-brand-700 hover:bg-brand-100"
              >
                + {param}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={customParam}
              onChange={(event) => setCustomParam(event.target.value)}
              placeholder="Custom parameter"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                addParameter(customParam);
                setCustomParam('');
              }}
              className="rounded-lg bg-slateish px-4 py-2 text-sm text-white"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {selected.length === 0 ? (
              <span className="text-sm text-slate-500">No parameters selected yet.</span>
            ) : (
              selected.map((param) => (
                <button
                  key={param}
                  type="button"
                  onClick={() => removeParameter(param)}
                  className="rounded-full bg-brand-100 px-3 py-1 text-xs text-brand-800"
                >
                  {param} x
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
