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
    return <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-600">Loading document...</div>;
  }

  if (!documentQuery.data) {
    return <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-red-600">Document not found.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Document #{documentQuery.data.id}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {documentQuery.data.original_filename} | {documentQuery.data.type} | {documentQuery.data.status}
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-slate-800">Approved JSON</h3>
        <pre className="max-h-72 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-emerald-200">
          {JSON.stringify(documentQuery.data.approved_json ?? {}, null, 2)}
        </pre>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-slate-800">Latest Review Chat</h3>
        <div className="space-y-2">
          {(reviewQuery.data?.messages ?? []).map((message) => (
            <div
              key={message.id}
              className={`rounded-lg px-3 py-2 text-sm ${
                message.role === 'user' ? 'bg-brand-100 text-brand-900' : 'bg-slate-50 text-slate-700'
              }`}
            >
              <p className="text-[10px] uppercase tracking-wide text-slate-500">{message.role}</p>
              <p>{message.message}</p>
            </div>
          ))}
          {(reviewQuery.data?.messages ?? []).length === 0 && (
            <p className="text-sm text-slate-500">No review messages yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
