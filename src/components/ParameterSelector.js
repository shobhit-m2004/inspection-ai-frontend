import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
export function ParameterSelector({ mode, onModeChange, selected, onSelectedChange, predefined, }) {
    const [customParam, setCustomParam] = useState('');
    const available = useMemo(() => predefined.filter((item) => !selected.includes(item)).sort((a, b) => a.localeCompare(b)), [predefined, selected]);
    const addParameter = (param) => {
        const clean = param.trim();
        if (!clean || selected.includes(clean)) {
            return;
        }
        onSelectedChange([...selected, clean]);
    };
    const removeParameter = (param) => {
        onSelectedChange(selected.filter((item) => item !== param));
    };
    return (_jsxs("div", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsxs("div", { className: "mb-3 flex gap-2", children: [_jsx("button", { type: "button", onClick: () => onModeChange('auto'), className: `rounded-lg px-3 py-2 text-sm ${mode === 'auto' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'}`, children: "Auto Extract" }), _jsx("button", { type: "button", onClick: () => onModeChange('manual'), className: `rounded-lg px-3 py-2 text-sm ${mode === 'manual' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-700'}`, children: "Manual Parameters" })] }), mode === 'manual' && (_jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "flex flex-wrap gap-2", children: available.map((param) => (_jsxs("button", { type: "button", onClick: () => addParameter(param), className: "rounded-full border border-brand-300 px-3 py-1 text-xs text-brand-700 hover:bg-brand-100", children: ["+ ", param] }, param))) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { value: customParam, onChange: (event) => setCustomParam(event.target.value), placeholder: "Custom parameter", className: "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" }), _jsx("button", { type: "button", onClick: () => {
                                    addParameter(customParam);
                                    setCustomParam('');
                                }, className: "rounded-lg bg-slateish px-4 py-2 text-sm text-white", children: "Add" })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: selected.length === 0 ? (_jsx("span", { className: "text-sm text-slate-500", children: "No parameters selected yet." })) : (selected.map((param) => (_jsxs("button", { type: "button", onClick: () => removeParameter(param), className: "rounded-full bg-brand-100 px-3 py-1 text-xs text-brand-800", children: [param, " x"] }, param)))) })] }))] }));
}
