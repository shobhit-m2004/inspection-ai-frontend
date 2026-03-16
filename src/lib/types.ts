export type DocumentType = 'SOP' | 'LOG';
export type DocumentStatus = 'draft' | 'approved';

export interface DocumentSummary {
  id: number;
  type: DocumentType;
  original_filename: string;
  status: DocumentStatus;
  created_at: string;
  updated_at?: string | null;
}

export interface DocumentDetail extends DocumentSummary {
  storage_path: string;
  raw_text: string;
  extracted_json?: Record<string, unknown> | null;
  approved_json?: Record<string, unknown> | null;
}

export interface ExtractResponse {
  document_id: number;
  review_session_id: number;
  extracted_json: Record<string, unknown>;
  warnings: string[];
}

export interface AssistantRequest {
  review_session_id?: number | null;
  message: string;
  current_json?: Record<string, unknown> | null;
}

export interface AssistantResponse {
  review_session_id: number;
  message: string;
  updated_json?: Record<string, unknown> | null;
  changed: boolean;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  message: string;
  updated_json_snapshot?: Record<string, unknown> | null;
  created_at: string;
}

export interface ReviewSession {
  id: number;
  document_id: number;
  selected_parameters?: Record<string, unknown> | null;
  session_status: string;
  created_at: string;
  updated_at?: string | null;
  messages: ChatMessage[];
}

export interface AnalysisFinding {
  rule_id: string;
  parameter: string;
  status: 'compliant' | 'missing' | 'deviation' | 'partial' | 'unclear';
  matched_observations: string[];
  explanation: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AnalysisRunResponse {
  analysis_id: number;
  sop_document_id: number;
  log_document_id: number;
  summary: Record<string, number>;
  findings: AnalysisFinding[];
}

export interface AnalysisRecord {
  id: number;
  sop_document_id: number;
  log_document_id: number;
  result_json: { findings: AnalysisFinding[] };
  summary_json: Record<string, number>;
  created_at: string;
}

export interface ParameterSuggestionResponse {
  predefined_parameters: string[];
  aliases: Record<string, string[]>;
}
