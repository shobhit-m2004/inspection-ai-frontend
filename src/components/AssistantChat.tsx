import { useState } from 'react';

interface ChatItem {
  role: 'user' | 'assistant';
  message: string;
}

interface AssistantChatProps {
  messages: ChatItem[];
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
}

export function AssistantChat({ messages, onSend, disabled = false }: AssistantChatProps) {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const clean = draft.trim();
    if (!clean || sending || disabled) {
      return;
    }
    setSending(true);
    try {
      await onSend(clean);
      setDraft('');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">Review Assistant</h3>
      <div className="mb-3 h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
        {messages.length === 0 && <p className="text-sm text-slate-500">Ask why something is missing or request a correction.</p>}
        {messages.map((item, index) => (
          <div
            key={`${item.role}-${index}`}
            className={`rounded-lg px-3 py-2 text-sm ${
              item.role === 'user' ? 'bg-brand-100 text-brand-900' : 'bg-white text-slate-700'
            }`}
          >
            <p className="mb-1 text-[10px] uppercase tracking-wide text-slate-500">{item.role}</p>
            <p>{item.message}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Example: add temperature parameter from section 2"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          disabled={disabled || sending}
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || sending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </section>
  );
}
