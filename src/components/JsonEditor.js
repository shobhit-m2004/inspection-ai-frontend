import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export function JsonEditor({ title, value, onChange }) {
    const [text, setText] = useState('');
    const [error, setError] = useState('');
    useEffect(() => {
        setText(value ? JSON.stringify(value, null, 2) : '');
        setError('');
    }, [value]);
    const applyJson = () => {
        try {
            const parsed = JSON.parse(text);
            onChange(parsed);
            setError('');
        }
        catch {
            setError('Invalid JSON. Please fix syntax before applying.');
        }
    };
    return (_jsxs("section", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-800", children: title }), _jsx("button", { type: "button", onClick: applyJson, className: "rounded-lg bg-slateish px-3 py-2 text-xs font-medium text-white", children: "Apply Manual JSON Edit" })] }), _jsx("textarea", { value: text, onChange: (event) => setText(event.target.value), className: "h-80 w-full rounded-lg border border-slate-300 bg-slate-950 p-4 font-mono text-xs text-emerald-200", placeholder: "Extracted JSON will appear here" }), error && _jsx("p", { className: "mt-2 text-xs text-red-600", children: error })] }));
}
