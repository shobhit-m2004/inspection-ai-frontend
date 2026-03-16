import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { listAnalyses, listDocuments, runAnalysis } from '../api/endpoints';
import type { AnalysisFinding } from '../lib/types';

export function DashboardPage() {
  const [selectedSop, setSelectedSop] = useState<number | null>(null);
  const [selectedLog, setSelectedLog] = useState<number | null>(null);
  const [findings, setFindings] = useState<AnalysisFinding[]>([]);
  const [summary, setSummary] = useState<Record<string, number> | null>(null);
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
    onError: (error: Error) => setStatusMessage(error.message),
  });

  const summaryItems = useMemo(
    () => [
      { key: 'compliant', label: 'Compliant', color: 'bg-emerald-50 text-emerald-700' },
      { key: 'missing', label: 'Missing', color: 'bg-rose-50 text-rose-700' },
      { key: 'deviation', label: 'Deviation', color: 'bg-orange-50 text-orange-700' },
      { key: 'partial', label: 'Partial', color: 'bg-amber-50 text-amber-700' },
      { key: 'unclear', label: 'Unclear', color: 'bg-slate-100 text-slate-700' },
    ],
    [],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-xl bg-white p-5 shadow-panel">
        <h2 className="text-xl font-semibold text-slate-900">Analysis Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">
          Select one approved SOP and one approved Log, then run deterministic gap detection.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={selectedSop ?? ''}
            onChange={(event) => setSelectedSop(Number(event.target.value) || null)}
          >
            <option value="">Select SOP</option>
            {(sopQuery.data ?? []).map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.id} - {doc.original_filename}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={selectedLog ?? ''}
            onChange={(event) => setSelectedLog(Number(event.target.value) || null)}
          >
            <option value="">Select Log</option>
            {(logQuery.data ?? []).map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.id} - {doc.original_filename}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => runMutation.mutate()}
            disabled={runMutation.isPending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {runMutation.isPending ? 'Running Analysis...' : 'Run Analysis'}
          </button>
        </div>

        {statusMessage && <p className="mt-3 text-sm text-slate-700">{statusMessage}</p>}
      </section>

      {summary && (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {summaryItems.map((item) => (
            <article key={item.key} className={`rounded-xl p-4 ${item.color}`}>
              <p className="text-xs uppercase tracking-wide">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold">{summary[item.key] ?? 0}</p>
            </article>
          ))}
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Detailed Findings</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                <th className="px-2 py-2">Rule</th>
                <th className="px-2 py-2">Parameter</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Severity</th>
                <th className="px-2 py-2">Matched Obs</th>
                <th className="px-2 py-2">Explanation</th>
              </tr>
            </thead>
            <tbody>
              {findings.length === 0 ? (
                <tr>
                  <td className="px-2 py-3 text-slate-500" colSpan={6}>
                    No analysis findings yet.
                  </td>
                </tr>
              ) : (
                findings.map((finding) => (
                  <tr key={finding.rule_id} className="border-b border-slate-100 align-top">
                    <td className="px-2 py-2 font-medium text-slate-700">{finding.rule_id}</td>
                    <td className="px-2 py-2 text-slate-700">{finding.parameter}</td>
                    <td className="px-2 py-2">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {finding.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-slate-700">{finding.severity}</td>
                    <td className="px-2 py-2 text-slate-700">{finding.matched_observations.join(', ') || '-'}</td>
                    <td className="px-2 py-2 text-slate-600">{finding.explanation}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">Recent Analyses</h3>
        <div className="mt-2 space-y-2 text-sm text-slate-600">
          {(analysisHistoryQuery.data ?? []).slice(0, 6).map((item) => (
            <p key={item.id}>
              #{item.id} | SOP {item.sop_document_id} vs LOG {item.log_document_id} | {new Date(item.created_at).toLocaleString()}
            </p>
          ))}
          {(analysisHistoryQuery.data ?? []).length === 0 && <p>No analyses run yet.</p>}
        </div>
      </section>
    </div>
  );
}
