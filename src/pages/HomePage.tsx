import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl bg-gradient-to-r from-brand-700 via-brand-500 to-brand-300 p-8 text-white shadow-panel">
        <h2 className="text-3xl font-bold">SOP vs Log Gap Detection MVP</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-brand-50">
          Upload SOPs and execution logs, extract structured JSON with AI-assisted review, approve finalized records,
          and run deterministic compliance gap analysis with explainable findings.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/sop" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slateish">
            Review SOP
          </Link>
          <Link to="/log" className="rounded-lg bg-slateish px-4 py-2 text-sm font-semibold text-white">
            Review Log
          </Link>
          <Link to="/dashboard" className="rounded-lg bg-black/20 px-4 py-2 text-sm font-semibold text-white">
            Open Dashboard
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-800">Hybrid Extraction</h3>
          <p className="mt-2 text-sm text-slate-600">
            Deterministic parsing + alias normalization + LLM structured output for reliable rule/observation JSON.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-800">Human Review Loop</h3>
          <p className="mt-2 text-sm text-slate-600">
            Assistant explains missing fields and applies evidence-backed corrections before approval.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-slate-800">Explainable Gaps</h3>
          <p className="mt-2 text-sm text-slate-600">
            Deterministic comparison classifies each SOP rule into compliant, missing, deviation, partial, or unclear.
          </p>
        </article>
      </section>
    </div>
  );
}
