import { useEffect, useState } from 'react';

interface JsonEditorProps {
  title: string;
  value: Record<string, unknown> | null;
  onChange: (updated: Record<string, unknown>) => void;
}

export function JsonEditor({ title, value, onChange }: JsonEditorProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setText(value ? JSON.stringify(value, null, 2) : '');
    setError('');
  }, [value]);

  const applyJson = () => {
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      onChange(parsed);
      setError('');
    } catch {
      setError('Invalid JSON. Please fix syntax before applying.');
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <button
          type="button"
          onClick={applyJson}
          className="rounded-lg bg-slateish px-3 py-2 text-xs font-medium text-white"
        >
          Apply Manual JSON Edit
        </button>
      </div>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        className="h-80 w-full rounded-lg border border-slate-300 bg-slate-950 p-4 font-mono text-xs text-emerald-200"
        placeholder="Extracted JSON will appear here"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </section>
  );
}
