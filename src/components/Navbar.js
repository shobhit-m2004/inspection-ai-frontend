import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
const navItems = [
    { to: '/', label: 'Home' },
    { to: '/sop', label: 'SOP Review' },
    { to: '/log', label: 'Log Review' },
    { to: '/dashboard', label: 'Dashboard' },
];
export function Navbar() {
    return (_jsx("header", { className: "bg-slateish text-white shadow-panel", children: _jsxs("div", { className: "mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-semibold tracking-wide", children: "Compliance Gap Intelligence" }), _jsx("p", { className: "text-xs text-slate-200", children: "SOP vs Execution Log Gap Detection Platform" })] }), _jsx("nav", { className: "flex gap-2 text-sm", children: navItems.map((item) => (_jsx(NavLink, { to: item.to, className: ({ isActive }) => `rounded-lg px-3 py-2 transition ${isActive ? 'bg-brand-400 text-slateish' : 'bg-white/10 text-slate-100 hover:bg-white/20'}`, children: item.label }, item.to))) })] }) }));
}
