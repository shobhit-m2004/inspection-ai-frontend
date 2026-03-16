import { apiClient } from './client';
import type {
  AnalysisRecord,
  AnalysisRunResponse,
  AssistantRequest,
  AssistantResponse,
  DocumentDetail,
  DocumentSummary,
  DocumentType,
  ExtractResponse,
  ParameterSuggestionResponse,
  ReviewSession,
} from '../lib/types';

export async function uploadDocument(documentType: DocumentType, file: File): Promise<DocumentSummary> {
  const formData = new FormData();
  formData.append('document_type', documentType);
  formData.append('file', file);
  const { data } = await apiClient.post<DocumentSummary>('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function listDocuments(params?: {
  type?: DocumentType;
  status?: 'draft' | 'approved';
}): Promise<DocumentSummary[]> {
  const { data } = await apiClient.get<DocumentSummary[]>('/documents', { params });
  return data;
}

export async function getDocument(documentId: number): Promise<DocumentDetail> {
  const { data } = await apiClient.get<DocumentDetail>(`/documents/${documentId}`);
  return data;
}

export async function extractDocument(payload: {
  documentId: number;
  mode: 'auto' | 'manual';
  selectedParameters: string[];
}): Promise<ExtractResponse> {
  const { data } = await apiClient.post<ExtractResponse>(`/documents/${payload.documentId}/extract`, {
    mode: payload.mode,
    selected_parameters: payload.selectedParameters,
  });
  return data;
}

export async function approveDocument(documentId: number, approvedJson: Record<string, unknown>) {
  const { data } = await apiClient.post(`/documents/${documentId}/approve`, {
    approved_json: approvedJson,
  });
  return data;
}

export async function sendAssistantMessage(
  documentId: number,
  payload: AssistantRequest,
): Promise<AssistantResponse> {
  const { data } = await apiClient.post<AssistantResponse>(`/review/${documentId}/assistant`, {
    review_session_id: payload.review_session_id,
    message: payload.message,
    current_json: payload.current_json,
  });
  return data;
}

export async function getLatestReview(documentId: number): Promise<ReviewSession> {
  const { data } = await apiClient.get<ReviewSession>(`/documents/${documentId}/review/latest`);
  return data;
}

export async function runAnalysis(payload: {
  sopDocumentId: number;
  logDocumentId: number;
}): Promise<AnalysisRunResponse> {
  const { data } = await apiClient.post<AnalysisRunResponse>('/analysis/run', {
    sop_document_id: payload.sopDocumentId,
    log_document_id: payload.logDocumentId,
  });
  return data;
}

export async function listAnalyses(): Promise<AnalysisRecord[]> {
  const { data } = await apiClient.get<AnalysisRecord[]>('/analysis');
  return data;
}

export async function getParameterSuggestions(): Promise<ParameterSuggestionResponse> {
  const { data } = await apiClient.get<ParameterSuggestionResponse>('/parameters/suggestions');
  return data;
}
