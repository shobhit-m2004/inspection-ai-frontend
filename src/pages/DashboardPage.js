import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { listAnalyses, listDocuments, runAnalysis } from '../api/endpoints';
export function DashboardPage() {
    const [selectedSop, setSelectedSop] = useState(null);
    const [selectedLog, setSelectedLog] = useState(null);
    const [findings, setFindings] = useState([]);
    const [summary, setSummary] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const sopQuery = useQuery({
        queryKey: ['documents', 'SOP', 'approved'],
        queryFn: () => listDocuments({ type: 'SOP', status: 'approved' }),
    });
    const logQuery = useQuery({
        queryKey: ['documents', 'LOG', 'approved'],
        queryFn: () => listDocuments({ type: 'LOG', status: 'approved' }),
    });
    const analysisHistoryQuery = useQuery({
        queryKey: ['analysis-history'],
        queryFn: listAnalyses,
    });
    const runMutation = useMutation({
        mutationFn: () => {
            if (!selectedSop || !selectedLog) {
                throw new Error('Select both approved SOP and approved Log documents.');
            }
            return runAnalysis({ sopDocumentId: selectedSop, logDocumentId: selectedLog });
        },
        onSuccess: (data) => {
            setFindings(data.findings);
            setSummary(data.summary);
            setStatusMessage(`Analysis #${data.analysis_id} completed.`);
            analysisHistoryQuery.refetch();
        },
        onError: (error) => setStatusMessage(error.message),
    });
    const summaryItems = useMemo(() => [
        { key: 'compliant', label: 'Compliant', color: 'bg-emerald-50 text-emerald-700' },
        { key: 'missing', label: 'Missing', color: 'bg-rose-50 text-rose-700' },
        { key: 'deviation', label: 'Deviation', color: 'bg-orange-50 text-orange-700' },
        { key: 'partial', label: 'Partial', color: 'bg-amber-50 text-amber-700' },
        { key: 'unclear', label: 'Unclear', color: 'bg-slate-100 text-slate-700' },
    ], []);
    return (_jsxs("div", { className: "mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8", children: [_jsxs("section", { className: "rounded-xl bg-white p-5 shadow-panel", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: "Analysis Dashboard" }), _jsx("p", { className: "mt-1 text-sm text-slate-600", children: "Select one approved SOP and one approved Log, then run deterministic gap detection." }), _jsxs("div", { className: "mt-4 grid gap-4 md:grid-cols-3", children: [_jsxs("select", { className: "rounded-lg border border-slate-300 px-3 py-2 text-sm", value: selectedSop ?? '', onChange: (event) => setSelectedSop(Number(event.target.value) || null), children: [_jsx("option", { value: "", children: "Select SOP" }), (sopQuery.data ?? []).map((doc) => (_jsxs("option", { value: doc.id, children: [doc.id, " - ", doc.original_filename] }, doc.id)))] }), _jsxs("select", { className: "rounded-lg border border-slate-300 px-3 py-2 text-sm", value: selectedLog ?? '', onChange: (event) => setSelectedLog(Number(event.target.value) || null), children: [_jsx("option", { value: "", children: "Select Log" }), (logQuery.data ?? []).map((doc) => (_jsxs("option", { value: doc.id, children: [doc.id, " - ", doc.original_filename] }, doc.id)))] }), _jsx("button", { type: "button", onClick: () => runMutation.mutate(), disabled: runMutation.isPending, className: "rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60", children: runMutation.isPending ? 'Running Analysis...' : 'Run Analysis' })] }), statusMessage && _jsx("p", { className: "mt-3 text-sm text-slate-700", children: statusMessage })] }), summary && (_jsx("section", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-5", children: summaryItems.map((item) => (_jsxs("article", { className: `rounded-xl p-4 ${item.color}`, children: [_jsx("p", { className: "text-xs uppercase tracking-wide", children: item.label }), _jsx("p", { className: "mt-2 text-2xl font-semibold", children: summary[item.key] ?? 0 })] }, item.key))) })), _jsxs("section", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsx("h3", { className: "mb-3 text-sm font-semibold text-slate-800", children: "Detailed Findings" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[640px] border-collapse text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-slate-200 text-left text-xs uppercase text-slate-500", children: [_jsx("th", { className: "px-2 py-2", children: "Rule" }), _jsx("th", { className: "px-2 py-2", children: "Parameter" }), _jsx("th", { className: "px-2 py-2", children: "Status" }), _jsx("th", { className: "px-2 py-2", children: "Severity" }), _jsx("th", { className: "px-2 py-2", children: "Matched Obs" }), _jsx("th", { className: "px-2 py-2", children: "Explanation" })] }) }), _jsx("tbody", { children: findings.length === 0 ? (_jsx("tr", { children: _jsx("td", { className: "px-2 py-3 text-slate-500", colSpan: 6, children: "No analysis findings yet." }) })) : (findings.map((finding) => (_jsxs("tr", { className: "border-b border-slate-100 align-top", children: [_jsx("td", { className: "px-2 py-2 font-medium text-slate-700", children: finding.rule_id }), _jsx("td", { className: "px-2 py-2 text-slate-700", children: finding.parameter }), _jsx("td", { className: "px-2 py-2", children: _jsx("span", { className: "rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700", children: finding.status }) }), _jsx("td", { className: "px-2 py-2 text-slate-700", children: finding.severity }), _jsx("td", { className: "px-2 py-2 text-slate-700", children: finding.matched_observations.join(', ') || '-' }), _jsx("td", { className: "px-2 py-2 text-slate-600", children: finding.explanation })] }, finding.rule_id)))) })] }) })] }), _jsxs("section", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsx("h3", { className: "text-sm font-semibold text-slate-800", children: "Recent Analyses" }), _jsxs("div", { className: "mt-2 space-y-2 text-sm text-slate-600", children: [(analysisHistoryQuery.data ?? []).slice(0, 6).map((item) => (_jsxs("p", { children: ["#", item.id, " | SOP ", item.sop_document_id, " vs LOG ", item.log_document_id, " | ", new Date(item.created_at).toLocaleString()] }, item.id))), (analysisHistoryQuery.data ?? []).length === 0 && _jsx("p", { children: "No analyses run yet." })] })] })] }));
}
