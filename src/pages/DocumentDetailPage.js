import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDocument, getLatestReview } from '../api/endpoints';
export function DocumentDetailPage() {
    const params = useParams();
    const documentId = Number(params.id);
    const documentQuery = useQuery({
        queryKey: ['document', documentId],
        queryFn: () => getDocument(documentId),
        enabled: Number.isFinite(documentId) && documentId > 0,
    });
    const reviewQuery = useQuery({
        queryKey: ['document-review', documentId],
        queryFn: () => getLatestReview(documentId),
        enabled: Number.isFinite(documentId) && documentId > 0,
    });
    if (documentQuery.isLoading) {
        return _jsx("div", { className: "mx-auto max-w-6xl px-4 py-8 text-sm text-slate-600", children: "Loading document..." });
    }
    if (!documentQuery.data) {
        return _jsx("div", { className: "mx-auto max-w-6xl px-4 py-8 text-sm text-red-600", children: "Document not found." });
    }
    return (_jsxs("div", { className: "mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-6 lg:px-8", children: [_jsxs("section", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsxs("h2", { className: "text-xl font-semibold text-slate-900", children: ["Document #", documentQuery.data.id] }), _jsxs("p", { className: "mt-1 text-sm text-slate-600", children: [documentQuery.data.original_filename, " | ", documentQuery.data.type, " | ", documentQuery.data.status] })] }), _jsxs("section", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsx("h3", { className: "mb-2 text-sm font-semibold text-slate-800", children: "Approved JSON" }), _jsx("pre", { className: "max-h-72 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-emerald-200", children: JSON.stringify(documentQuery.data.approved_json ?? {}, null, 2) })] }), _jsxs("section", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsx("h3", { className: "mb-2 text-sm font-semibold text-slate-800", children: "Latest Review Chat" }), _jsxs("div", { className: "space-y-2", children: [(reviewQuery.data?.messages ?? []).map((message) => (_jsxs("div", { className: `rounded-lg px-3 py-2 text-sm ${message.role === 'user' ? 'bg-brand-100 text-brand-900' : 'bg-slate-50 text-slate-700'}`, children: [_jsx("p", { className: "text-[10px] uppercase tracking-wide text-slate-500", children: message.role }), _jsx("p", { children: message.message })] }, message.id))), (reviewQuery.data?.messages ?? []).length === 0 && (_jsx("p", { className: "text-sm text-slate-500", children: "No review messages yet." }))] })] })] }));
}
