import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';

import {
  approveDocument,
  extractDocument,
  getLatestReview,
  getParameterSuggestions,
  sendAssistantMessage,
  uploadDocument,
} from '../api/endpoints';
import { AssistantChat } from '../components/AssistantChat';
import { JsonEditor } from '../components/JsonEditor';
import { ParameterSelector } from '../components/ParameterSelector';
import type { DocumentSummary, DocumentType } from '../lib/types';

interface ReviewPageProps {
  documentType: DocumentType;
}

interface ChatLine {
  role: 'user' | 'assistant';
  message: string;
}

export function ReviewPage({ documentType }: ReviewPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [document, setDocument] = useState<DocumentSummary | null>(null);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [selectedParams, setSelectedParams] = useState<string[]>([]);
  const [extractedJson, setExtractedJson] = useState<Record<string, unknown> | null>(null);
  const [reviewSessionId, setReviewSessionId] = useState<number | null>(null);
  const [chat, setChat] = useState<ChatLine[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
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
    onError: (error: Error) => setStatusMessage(error.message),
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
    onError: (error: Error) => setStatusMessage(error.message),
  });

  const assistantMutation = useMutation({
    mutationFn: (message: string) => {
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
    onError: (error: Error) => setStatusMessage(error.message),
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
    onError: (error: Error) => setStatusMessage(error.message),
  });

  const latestReviewQuery = useQuery({
    queryKey: ['review-latest', document?.id],
    queryFn: () => getLatestReview(document!.id),
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
    const restored = review.messages.map((m) => ({ role: m.role, message: m.message as string }));
    if (restored.length > 0) {
      setChat(restored as ChatLine[]);
    }
  }, [latestReviewQuery.data, reviewSessionId]);

  const pageTitle = useMemo(() => (documentType === 'SOP' ? 'SOP Upload & Review' : 'Log Upload & Review'), [documentType]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-xl bg-white p-5 shadow-panel">
        <h2 className="text-xl font-semibold text-slate-900">{pageTitle}</h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload a {documentType}, extract structured JSON, review with assistant, then approve the final JSON.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_auto]">
          <input
            type="file"
            accept=".pdf,.txt,.docx,.log,.md"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => uploadMutation.mutate()}
            disabled={uploadMutation.isPending}
            className="rounded-lg bg-slateish px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
          </button>
          <button
            type="button"
            onClick={() => extractMutation.mutate()}
            disabled={!document || extractMutation.isPending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {extractMutation.isPending ? 'Extracting...' : 'Extract JSON'}
          </button>
        </div>

        <div className="mt-3 text-xs text-slate-600">
          {document ? (
            <p>
              Active Document: <strong>{document.original_filename}</strong> ({document.status}){' '}
              <Link className="text-brand-700 underline" to={`/documents/${document.id}`}>
                View details
              </Link>
            </p>
          ) : (
            <p>No document uploaded in this session.</p>
          )}
        </div>
      </section>

      <ParameterSelector
        mode={mode}
        onModeChange={setMode}
        selected={selectedParams}
        onSelectedChange={setSelectedParams}
        predefined={parameterSuggestions?.predefined_parameters ?? []}
      />

      <JsonEditor title="Extracted JSON (Editable)" value={extractedJson} onChange={setExtractedJson} />

      <AssistantChat
        messages={chat}
        onSend={async (message) => {
          await assistantMutation.mutateAsync(message);
        }}
        disabled={!document || !extractedJson || assistantMutation.isPending}
      />

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Finalize Review</h3>
            <p className="text-xs text-slate-600">Only approved JSON will be available in dashboard analysis.</p>
          </div>
          <button
            type="button"
            onClick={() => approveMutation.mutate()}
            disabled={!document || !extractedJson || approveMutation.isPending}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {approveMutation.isPending ? 'Saving...' : 'Approve & Save'}
          </button>
        </div>

        {warnings.length > 0 && (
          <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            {warnings.map((warning, index) => (
              <p key={`${warning}-${index}`}>{warning}</p>
            ))}
          </div>
        )}

        {statusMessage && <p className="mt-3 text-sm text-slate-700">{statusMessage}</p>}
      </section>
    </div>
  );
}
