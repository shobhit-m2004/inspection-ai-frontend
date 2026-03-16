import { apiClient } from './client';
export async function uploadDocument(documentType, file) {
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', file);
    const { data } = await apiClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
}
export async function listDocuments(params) {
    const { data } = await apiClient.get('/documents', { params });
    return data;
}
export async function getDocument(documentId) {
    const { data } = await apiClient.get(`/documents/${documentId}`);
    return data;
}
export async function extractDocument(payload) {
    const { data } = await apiClient.post(`/documents/${payload.documentId}/extract`, {
        mode: payload.mode,
        selected_parameters: payload.selectedParameters,
    });
    return data;
}
export async function approveDocument(documentId, approvedJson) {
    const { data } = await apiClient.post(`/documents/${documentId}/approve`, {
        approved_json: approvedJson,
    });
    return data;
}
export async function sendAssistantMessage(documentId, payload) {
    const { data } = await apiClient.post(`/review/${documentId}/assistant`, {
        review_session_id: payload.review_session_id,
        message: payload.message,
        current_json: payload.current_json,
    });
    return data;
}
export async function getLatestReview(documentId) {
    const { data } = await apiClient.get(`/documents/${documentId}/review/latest`);
    return data;
}
export async function runAnalysis(payload) {
    const { data } = await apiClient.post('/analysis/run', {
        sop_document_id: payload.sopDocumentId,
        log_document_id: payload.logDocumentId,
    });
    return data;
}
export async function listAnalyses() {
    const { data } = await apiClient.get('/analysis');
    return data;
}
export async function getParameterSuggestions() {
    const { data } = await apiClient.get('/parameters/suggestions');
    return data;
}
