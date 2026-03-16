import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { HomePage } from './pages/HomePage';
import { ReviewPage } from './pages/ReviewPage';
export function App() {
    return (_jsx(BrowserRouter, { children: _jsxs("div", { className: "min-h-screen", children: [_jsx(Navbar, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/sop", element: _jsx(ReviewPage, { documentType: "SOP" }) }), _jsx(Route, { path: "/log", element: _jsx(ReviewPage, { documentType: "LOG" }) }), _jsx(Route, { path: "/dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "/documents/:id", element: _jsx(DocumentDetailPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] })] }) }));
}
