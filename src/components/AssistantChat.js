import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function AssistantChat({ messages, onSend, disabled = false }) {
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
        }
        finally {
            setSending(false);
        }
    };
    return (_jsxs("section", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsx("h3", { className: "mb-3 text-sm font-semibold text-slate-800", children: "Review Assistant" }), _jsxs("div", { className: "mb-3 h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3", children: [messages.length === 0 && _jsx("p", { className: "text-sm text-slate-500", children: "Ask why something is missing or request a correction." }), messages.map((item, index) => (_jsxs("div", { className: `rounded-lg px-3 py-2 text-sm ${item.role === 'user' ? 'bg-brand-100 text-brand-900' : 'bg-white text-slate-700'}`, children: [_jsx("p", { className: "mb-1 text-[10px] uppercase tracking-wide text-slate-500", children: item.role }), _jsx("p", { children: item.message })] }, `${item.role}-${index}`)))] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { value: draft, onChange: (event) => setDraft(event.target.value), placeholder: "Example: add temperature parameter from section 2", className: "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm", disabled: disabled || sending }), _jsx("button", { type: "button", onClick: submit, disabled: disabled || sending, className: "rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60", children: "Send" })] })] }));
}
