import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { approveDocument, extractDocument, getLatestReview, getParameterSuggestions, sendAssistantMessage, uploadDocument, } from '../api/endpoints';
import { AssistantChat } from '../components/AssistantChat';
import { JsonEditor } from '../components/JsonEditor';
import { ParameterSelector } from '../components/ParameterSelector';
export function ReviewPage({ documentType }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [document, setDocument] = useState(null);
    const [mode, setMode] = useState('auto');
    const [selectedParams, setSelectedParams] = useState([]);
    const [extractedJson, setExtractedJson] = useState(null);
    const [reviewSessionId, setReviewSessionId] = useState(null);
    const [chat, setChat] = useState([]);
    const [warnings, setWarnings] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');
    const { data: parameterSuggestions } = useQuery({
        queryKey: ['parameters'],
        queryFn: getParameterSuggestions,
    });
    const uploadMutation = useMutation({
        mutationFn: () => {
            if (!selectedFile) {
                throw new Error('Please select a file first.');
            }
            return uploadDocument(documentType, selectedFile);
        },
        onSuccess: (data) => {
            setDocument(data);
            setStatusMessage(`Uploaded ${data.original_filename}. Run extraction next.`);
            setChat([]);
            setReviewSessionId(null);
            setExtractedJson(null);
            setWarnings([]);
        },
        onError: (error) => setStatusMessage(error.message),
    });
    const extractMutation = useMutation({
        mutationFn: () => {
            if (!document) {
                throw new Error('Upload a document before extraction.');
            }
            return extractDocument({
                documentId: document.id,
                mode,
                selectedParameters: mode === 'manual' ? selectedParams : [],
            });
        },
        onSuccess: (data) => {
            setExtractedJson(data.extracted_json);
            setReviewSessionId(data.review_session_id);
            setWarnings(data.warnings);
            setStatusMessage('Extraction complete. Review JSON and use assistant for corrections.');
        },
        onError: (error) => setStatusMessage(error.message),
    });
    const assistantMutation = useMutation({
        mutationFn: (message) => {
            if (!document) {
                throw new Error('Upload and extract document first.');
            }
            return sendAssistantMessage(document.id, {
                review_session_id: reviewSessionId,
                message,
                current_json: extractedJson,
            });
        },
        onSuccess: (data, userMessage) => {
            setChat((prev) => [...prev, { role: 'user', message: userMessage }, { role: 'assistant', message: data.message }]);
            setReviewSessionId(data.review_session_id);
            if (data.changed && data.updated_json) {
                setExtractedJson(data.updated_json);
            }
        },
        onError: (error) => setStatusMessage(error.message),
    });
    const approveMutation = useMutation({
        mutationFn: () => {
            if (!document || !extractedJson) {
                throw new Error('Nothing to approve yet.');
            }
            return approveDocument(document.id, extractedJson);
        },
        onSuccess: () => {
            setStatusMessage('Document approved and saved. You can now use it on Dashboard analysis.');
            setDocument((current) => (current ? { ...current, status: 'approved' } : current));
        },
        onError: (error) => setStatusMessage(error.message),
    });
    const latestReviewQuery = useQuery({
        queryKey: ['review-latest', document?.id],
        queryFn: () => getLatestReview(document.id),
        enabled: Boolean(document?.id),
    });
    useEffect(() => {
        const review = latestReviewQuery.data;
        if (!review || review.id === 0) {
            return;
        }
        if (!reviewSessionId) {
            setReviewSessionId(review.id);
        }
        const restored = review.messages.map((m) => ({ role: m.role, message: m.message }));
        if (restored.length > 0) {
            setChat(restored);
        }
    }, [latestReviewQuery.data, reviewSessionId]);
    const pageTitle = useMemo(() => (documentType === 'SOP' ? 'SOP Upload & Review' : 'Log Upload & Review'), [documentType]);
    return (_jsxs("div", { className: "mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8", children: [_jsxs("section", { className: "rounded-xl bg-white p-5 shadow-panel", children: [_jsx("h2", { className: "text-xl font-semibold text-slate-900", children: pageTitle }), _jsxs("p", { className: "mt-1 text-sm text-slate-600", children: ["Upload a ", documentType, ", extract structured JSON, review with assistant, then approve the final JSON."] }), _jsxs("div", { className: "mt-4 grid gap-4 md:grid-cols-[1fr_auto_auto]", children: [_jsx("input", { type: "file", accept: ".pdf,.txt,.docx,.log,.md", onChange: (event) => setSelectedFile(event.target.files?.[0] ?? null), className: "rounded-lg border border-slate-300 px-3 py-2 text-sm" }), _jsx("button", { type: "button", onClick: () => uploadMutation.mutate(), disabled: uploadMutation.isPending, className: "rounded-lg bg-slateish px-4 py-2 text-sm font-medium text-white disabled:opacity-60", children: uploadMutation.isPending ? 'Uploading...' : 'Upload' }), _jsx("button", { type: "button", onClick: () => extractMutation.mutate(), disabled: !document || extractMutation.isPending, className: "rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60", children: extractMutation.isPending ? 'Extracting...' : 'Extract JSON' })] }), _jsx("div", { className: "mt-3 text-xs text-slate-600", children: document ? (_jsxs("p", { children: ["Active Document: ", _jsx("strong", { children: document.original_filename }), " (", document.status, ")", ' ', _jsx(Link, { className: "text-brand-700 underline", to: `/documents/${document.id}`, children: "View details" })] })) : (_jsx("p", { children: "No document uploaded in this session." })) })] }), _jsx(ParameterSelector, { mode: mode, onModeChange: setMode, selected: selectedParams, onSelectedChange: setSelectedParams, predefined: parameterSuggestions?.predefined_parameters ?? [] }), _jsx(JsonEditor, { title: "Extracted JSON (Editable)", value: extractedJson, onChange: setExtractedJson }), _jsx(AssistantChat, { messages: chat, onSend: async (message) => {
                    await assistantMutation.mutateAsync(message);
                }, disabled: !document || !extractedJson || assistantMutation.isPending }), _jsxs("section", { className: "rounded-xl border border-slate-200 bg-white p-4 shadow-sm", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-slate-800", children: "Finalize Review" }), _jsx("p", { className: "text-xs text-slate-600", children: "Only approved JSON will be available in dashboard analysis." })] }), _jsx("button", { type: "button", onClick: () => approveMutation.mutate(), disabled: !document || !extractedJson || approveMutation.isPending, className: "rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60", children: approveMutation.isPending ? 'Saving...' : 'Approve & Save' })] }), warnings.length > 0 && (_jsx("div", { className: "mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800", children: warnings.map((warning, index) => (_jsx("p", { children: warning }, `${warning}-${index}`))) })), statusMessage && _jsx("p", { className: "mt-3 text-sm text-slate-700", children: statusMessage })] })] }));
}
