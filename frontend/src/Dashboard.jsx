import { useEffect, useState } from 'react'
import {
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Upload,
  Play,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Database,
  FileCheck,
  Activity,
  Menu,
  X,
  RefreshCw,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { DashboardApi, SopApi, LogApi, AnalyzeApi, ReportApi } from './api'

const severityConfig = {
  Low: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2,
  },
  Medium: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: AlertTriangle,
  },
  High: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: XCircle,
  },
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sops, setSops] = useState([])
  const [sopsLoading, setSopsLoading] = useState(false)
  const [selectedSopId, setSelectedSopId] = useState(null)
  const [selectedLogId, setSelectedLogId] = useState(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [reportId, setReportId] = useState(null)
  const [reportSopId, setReportSopId] = useState(null)
  const [reportLogId, setReportLogId] = useState(null)
  const [reportGenerating, setReportGenerating] = useState(false)
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)

  useEffect(() => {
    refresh()
    loadSops()
    loadLogs()
  }, [])

  const loadSops = async () => {
    setSopsLoading(true)
    try {
      const res = await SopApi.list()
      setSops(res.data || [])
      if (res.data?.length && !selectedSopId) {
        setSelectedSopId(res.data[0].id)
      }
    } catch (e) {
      console.error('Failed to fetch SOPs', e)
      toast.error('Failed to load SOP list')
    } finally {
      setSopsLoading(false)
    }
  }

  const loadLogs = async () => {
    setLogsLoading(true)
    try {
      const res = await LogApi.list()
      setLogs(res.data || [])
      if (res.data?.length && !selectedLogId) {
        setSelectedLogId(res.data[0].id)
      }
    } catch (e) {
      console.error('Failed to fetch Logs', e)
      toast.error('Failed to load Logs list')
    } finally {
      setLogsLoading(false)
    }
  }

  const refresh = async () => {
    try {
      const res = await DashboardApi.get()
      setData(res.data)
    } catch (e) {
      console.error('Failed to fetch dashboard data', e)
      toast.error('Failed to load dashboard data')
    }
  }

  const runAnalysis = async () => {
    setAnalyzing(true)
    try {
      toast.loading('Running AI compliance analysis...', { id: 'analyze' })
      await AnalyzeApi.run({ sop_id: selectedSopId || null })
      await refresh()
      toast.success('Analysis completed successfully!', { id: 'analyze' })
    } catch (e) {
      toast.error('Analysis failed. Please upload SOPs and logs first.', { id: 'analyze' })
    } finally {
      setAnalyzing(false)
    }
  }

  const generateReportFor = async (sopId, logId, { downloadPDF = false } = {}) => {
    if (!sopId || !logId) {
      toast.error('Please select both SOP and Log')
      return
    }
    setReportGenerating(true)
    try {
      toast.loading('Generating report...', { id: 'report' })
      const res = await ReportApi.generate({
        sop_id: sopId,
        log_id: logId,
        include_details: true,
      })
      const newReportId = res.data?.report_id
      setReportId(newReportId || null)
      setReportData(res.data?.report || null)
      setReportSopId(sopId)
      setReportLogId(logId)
      setReportOpen(true)
      toast.success('Report generated!', { id: 'report' })
      if (downloadPDF && newReportId) {
        const pdfRes = await ReportApi.downloadPDF(newReportId)
        const blob = new Blob([pdfRes.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `compliance_report_${newReportId}.pdf`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Download started', { id: 'download' })
      }
    } catch (err) {
      console.error('Report error:', err)
      toast.error('Failed to generate report')
    } finally {
      setReportGenerating(false)
    }
  }

  const downloadReport = async (resultId) => {
    const result = data?.recent_analyses?.find((r) => r.id === resultId)
    if (!result) {
      toast.error('Analysis result not found')
      return
    }
    const sopId = result.sop_id || selectedSopId || null
    const logId = result.log_id || selectedLogId || null
    setReportSopId(sopId)
    setReportLogId(logId)
    await generateReportFor(sopId, logId, { downloadPDF: true })
  }

  const deleteSop = async (sopId, sopTitle) => {
    // Show confirmation dialog
    if (!window.confirm(`Are you sure you want to delete SOP "${sopTitle}"?\n\nThis will also delete:\n- All SOP chunks\n- Associated FAISS vectors\n- Related compliance analysis results\n\nThis action cannot be undone.`)) {
      return
    }

    toast.loading('Deleting SOP...', { id: 'delete-sop' })
    try {
      await SopApi.delete(sopId)
      toast.success('SOP deleted successfully', { id: 'delete-sop' })
      await loadSops()
      refresh()
    } catch (e) {
      console.error('Delete error:', e)
      toast.error('Failed to delete SOP', { id: 'delete-sop' })
    }
  }

  const deleteLog = async (logId, logTitle) => {
    // Show confirmation dialog
    if (!window.confirm(`Are you sure you want to delete Log "${logTitle}"?\n\nThis will also delete:\n- All log chunks\n- Associated FAISS vectors\n- Related compliance analysis results\n\nThis action cannot be undone.`)) {
      return
    }

    toast.loading('Deleting Log...', { id: 'delete-log' })
    try {
      await LogApi.delete(logId)
      toast.success('Log deleted successfully', { id: 'delete-log' })
      refresh()
    } catch (e) {
      console.error('Delete error:', e)
      toast.error('Failed to delete Log', { id: 'delete-log' })
    }
  }

  const downloadReportFromModal = async (format = 'pdf') => {
    if (!reportData && !reportId) {
      toast.error('No report data available')
      return
    }
    try {
      if (reportId) {
        const res = await ReportApi.download(reportId, format)
        const type =
          format === 'json'
            ? 'application/json'
            : format === 'txt'
            ? 'text/plain'
            : 'application/pdf'
        const blob = new Blob([res.data], { type })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `compliance_report_${reportId}.${format === 'json' ? 'json' : format}`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Report downloaded successfully!')
        return
      }
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `compliance_report_${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Report downloaded successfully!')
    } catch (err) {
      console.error('Download error:', err)
      toast.error('Failed to download report')
    }
  }

  const coverageChartData = (data?.recent_analyses || []).map((r) => ({
    name: `SOP-${r.sop_id}`,
    expected: r.total_chunks || 1,
    observed: r.matched_chunks || 0,
    similarity: r.similarity_score || 0,
  }))

  const avgCompliance = data?.recent_analyses?.length
    ? Math.round(
        (data.recent_analyses.reduce((acc, r) => acc + (r.similarity_score || 0), 0) /
          data.recent_analyses.length) *
          100
      )
    : 0

  const stats = [
    {
      label: 'Total SOPs',
      value: data?.total_sops || 0,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'Batch Logs',
      value: data?.total_logs || 0,
      icon: Database,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      label: 'Analyses Run',
      value: data?.total_analyses || 0,
      icon: Activity,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      label: 'Avg Compliance',
      value: `${avgCompliance}%`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
  ]

  const normalizeUnit = (unit) => {
    if (!unit) return ''
    return unit.toLowerCase().replace(/Â/g, '').replace(/°/g, '').trim()
  }

  const parseValue = (raw) => {
    if (raw === null || raw === undefined) return null
    const str = String(raw)
    const match = str.match(/(-?\d+(?:\.\d+)?)(?:\s*([^\d\s]+))?/)
    if (!match) return null
    const value = Number.parseFloat(match[1])
    if (Number.isNaN(value)) return null
    const unit = (match[2] || '').trim()
    return { value, unit }
  }

  const numericComparisonData = (reportData?.parameter_comparison || []).reduce((acc, item) => {
    const expectedSource =
      item.expected ?? item.rule_text ?? item.rule ?? item.sop_context ?? item.expected_value
    const actualSource =
      item.actual ?? item.log_text ?? item.log_excerpt ?? item.log_context ?? item.actual_value
    const expected = parseValue(expectedSource)
    const actual = parseValue(actualSource)
    if (!expected || !actual) return acc
    const expUnit = normalizeUnit(expected.unit)
    const actUnit = normalizeUnit(actual.unit)
    if (expUnit && actUnit && expUnit !== actUnit) return acc
    if ((expUnit && !actUnit) || (!expUnit && actUnit)) return acc
    acc.push({
      parameter: item.parameter || item.parameter_name || item.name || 'Parameter',
      expected: expected.value,
      actual: actual.value,
      unit: expected.unit || actual.unit || '',
    })
    return acc
  }, [])

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Toaster position="top-right" />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">PharmaCompliance</h1>
                <p className="text-xs text-slate-400">AI Audit System</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button
              onClick={() => {
                setActiveTab('overview')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'overview'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('analysis')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'analysis'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Analysis Details</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('sops')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'sops'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">SOP Documents</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('logs')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'logs'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Database className="w-5 h-5" />
              <span className="font-medium">Batch Logs</span>
            </button>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800">
            <div className="text-xs text-slate-500 text-center">
              Pharma SOP Compliance Analyzer v1.0
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-xl"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {activeTab === 'overview' && 'Compliance Overview'}
                  {activeTab === 'analysis' && 'Technical Analysis'}
                  {activeTab === 'sops' && 'SOP Documents'}
                  {activeTab === 'logs' && 'Batch Logs'}
                </h1>
                <p className="text-sm text-slate-500">
                  {activeTab === 'overview' && 'Monitor your compliance status'}
                  {activeTab === 'analysis' && 'Deep dive into ML metrics'}
                  {activeTab === 'sops' && 'Manage standard operating procedures'}
                  {activeTab === 'logs' && 'Manage operational batch records'}
                </p>
              </div>
            </div>
            <button onClick={runAnalysis} className="btn-primary" disabled={analyzing}>
              {analyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Run AI Audit
                </>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={stat.label} className="stat-card animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                      </div>
                      <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center`}>
                        <stat.icon className={`w-7 h-7 ${stat.color}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts and Upload */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">Coverage vs Similarity</h3>
                      <p className="text-sm text-slate-500">ML-powered compliance scoring</p>
                    </div>
                    <div className="badge-info">AI Compliance Engine</div>
                  </div>
                  <div style={{ width: '100%', height: 320 }}>
                    <ResponsiveContainer>
                      <ComposedChart data={coverageChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          yAxisId="left"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[0, 1]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="expected" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="Expected" />
                        <Bar yAxisId="left" dataKey="observed" fill="#22c55e" radius={[6, 6, 0, 0]} name="Verified" />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="similarity"
                          stroke="#f97316"
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#f97316' }}
                          name="Score"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Upload Cards */}
                <div className="space-y-6">
                  <SopSelectCard
                    sops={sops}
                    loading={sopsLoading}
                    selectedSopId={selectedSopId}
                    onSelect={setSelectedSopId}
                    onManage={() => {
                      setActiveTab('sops')
                      setSidebarOpen(false)
                    }}
                  />
                  <UploadCard
                    type="log"
                    title="Operational Batch Logs"
                    description="Upload CSV or TXT files for gap analysis"
                    icon={Database}
                    color="accent"
                    onUpload={async (file) => {
                      toast.loading('Uploading Log...', { id: 'upload' })
                      try {
                        await LogApi.upload(file)
                        toast.success('Log uploaded successfully', { id: 'upload' })
                        refresh()
                      } catch (e) {
                        toast.error('Upload failed', { id: 'upload' })
                      }
                    }}
                  />
                </div>
              </div>

              {/* Results Table */}
              <div className="card overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Recent Audit Findings</h3>
                    <p className="text-sm text-slate-500">Latest compliance analysis results</p>
                  </div>
                  <button onClick={refresh} className="p-2 hover:bg-slate-100 rounded-xl transition">
                    <RefreshCw className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Document
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Coverage
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Severity
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Summary
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data?.recent_analyses || []).map((r) => {
                        const SeverityIcon = severityConfig[r.severity]?.icon || AlertTriangle
                        return (
                          <tr key={r.id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">SOP-{r.sop_id}</div>
                              <div className="text-sm text-slate-500">vs Log-{r.log_id}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold text-slate-900">
                                  {(r.similarity_score * 100).toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary-500 rounded-full transition-all"
                                    style={{ width: `${(r.coverage || 0) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm text-slate-600">{Math.round((r.coverage || 0) * 100)}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                                  severityConfig[r.severity]?.bg || 'bg-slate-100'
                                } ${severityConfig[r.severity]?.text || 'text-slate-700'}`}
                              >
                                <SeverityIcon className="w-3.5 h-3.5" />
                                {r.severity}
                              </div>
                            </td>
                            <td className="px-6 py-4 max-w-xs">
                              <p className="text-sm text-slate-600 truncate">{r.gap_summary}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => downloadReport(r.id)}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition"
                              >
                                <Download className="w-4 h-4" />
                                Report
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                      {(data?.recent_analyses || []).length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <FileText className="w-12 h-12 text-slate-300 mb-4" />
                              <p className="text-slate-500 font-medium">No analysis results yet</p>
                              <p className="text-sm text-slate-400 mt-1">Upload SOPs and logs, then run analysis</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6 animate-fade-in">
              <div className="card p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">In-depth ML Metrics</h3>
                <div className="space-y-4">
                  {(data?.recent_analyses || []).map((r) => {
                    const SeverityIcon = severityConfig[r.severity]?.icon || AlertTriangle
                    return (
                      <div
                        key={r.id}
                        className="p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-slate-900">
                              SOP-{r.sop_id} vs Log-{r.log_id}
                            </h4>
                            <p className="text-sm text-slate-500">
                              {new Date(r.analyzed_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500 mb-1">Confidence</div>
                            <div className="text-2xl font-bold gradient-text">
                              {(r.severity_confidence * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="p-4 bg-white rounded-xl border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1">Temporal Consistency</div>
                            <div className="text-xl font-bold text-slate-900">
                              {(r.temporal_consistency || 1).toFixed(2)}
                            </div>
                          </div>
                          <div className="p-4 bg-white rounded-xl border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1">Vector Similarity</div>
                            <div className="text-xl font-bold text-slate-900">
                              {(r.similarity_score || 0).toFixed(4)}
                            </div>
                          </div>
                          <div className="p-4 bg-white rounded-xl border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1">Risk Level</div>
                            <div
                              className={`inline-flex items-center gap-2 text-lg font-bold ${
                                r.severity === 'Low'
                                  ? 'text-emerald-600'
                                  : r.severity === 'Medium'
                                  ? 'text-amber-600'
                                  : 'text-red-600'
                              }`}
                            >
                              <SeverityIcon className="w-5 h-5" />
                              {r.severity}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          <span className="font-semibold text-slate-900">Summary:</span> {r.gap_summary}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sops' && (
            <div className="space-y-6 animate-fade-in">
              <div className="card p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Upload SOP</h3>
                <UploadCard
                  type="sop"
                  title="Standard Operating Procedures"
                  description="Upload PDF or TXT files for vector indexing"
                  icon={FileText}
                  color="primary"
                  onUpload={async (file) => {
                    toast.loading('Uploading SOP...', { id: 'upload' })
                    try {
                      await SopApi.upload(file)
                      toast.success('SOP uploaded successfully', { id: 'upload' })
                      await loadSops()
                      refresh()
                    } catch (e) {
                      toast.error('Upload failed', { id: 'upload' })
                    }
                  }}
                />
              </div>
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Uploaded SOPs</h3>
                  <button onClick={loadSops} className="p-2 hover:bg-slate-100 rounded-xl transition">
                    <RefreshCw className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                {sopsLoading && <p className="text-slate-500">Loading SOPs...</p>}
                {!sopsLoading && sops.length === 0 && (
                  <p className="text-slate-500">No SOPs uploaded yet.</p>
                )}
                {!sopsLoading && sops.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Chunks
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Uploaded
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {sops.map((sop) => (
                          <tr key={sop.id} className="hover:bg-slate-50 transition">
                            <td className="px-4 py-3 font-medium text-slate-900">{sop.title}</td>
                            <td className="px-4 py-3 text-slate-600">{sop.chunk_count}</td>
                            <td className="px-4 py-3 text-slate-600">
                              {new Date(sop.uploaded_at).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => deleteSop(sop.id, sop.title)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-sm font-medium rounded-lg transition"
                                title="Delete SOP"
                              >
                                <X className="w-4 h-4" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6 animate-fade-in">
              <div className="card p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Upload Log</h3>
                <UploadCard
                  type="log"
                  title="Operational Batch Logs"
                  description="Upload CSV or TXT files for compliance analysis"
                  icon={Database}
                  color="accent"
                  onUpload={async (file) => {
                    toast.loading('Uploading Log...', { id: 'upload' })
                    try {
                      await LogApi.upload(file)
                      toast.success('Log uploaded successfully', { id: 'upload' })
                      await loadLogs()
                      refresh()
                    } catch (e) {
                      toast.error('Upload failed', { id: 'upload' })
                    }
                  }}
                />
              </div>
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Uploaded Logs</h3>
                  <button onClick={loadLogs} className="p-2 hover:bg-slate-100 rounded-xl transition">
                    <RefreshCw className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
                {logsLoading && <p className="text-slate-500">Loading Logs...</p>}
                {!logsLoading && logs.length === 0 && (
                  <p className="text-slate-500">No logs uploaded yet.</p>
                )}
                {!logsLoading && logs.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Chunks
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Uploaded
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {logs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition">
                            <td className="px-4 py-3 font-medium text-slate-900">{log.title}</td>
                            <td className="px-4 py-3 text-slate-600">{log.chunk_count}</td>
                            <td className="px-4 py-3 text-slate-600">
                              {new Date(log.uploaded_at).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => deleteLog(log.id, log.title)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-sm font-medium rounded-lg transition"
                                title="Delete Log"
                              >
                                <X className="w-4 h-4" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {reportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Compliance Audit Report (RAG + AI)</h3>
                  <p className="text-sm text-slate-500">Detailed parameter-level comparison with missing parameters</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => downloadReportFromModal('pdf')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button 
                    onClick={() => downloadReportFromModal('json')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition"
                  >
                    <Download className="w-4 h-4" />
                    Download JSON
                  </button>
                  <button 
                    onClick={() => downloadReportFromModal('txt')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition"
                  >
                    <Download className="w-4 h-4" />
                    Download TXT
                  </button>
                  <button onClick={() => setReportOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-8">
                {!reportData && <p className="text-slate-500">No report data available.</p>}
                {reportData && (
                  <>
                    {/* Report Selection */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SOP</label>
                          <select
                            className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={reportSopId ?? ''}
                            onChange={(e) => setReportSopId(e.target.value ? Number(e.target.value) : null)}
                          >
                            {sops.map((sop) => (
                              <option key={sop.id} value={sop.id}>
                                {sop.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Log</label>
                          <select
                            className="mt-2 w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={reportLogId ?? ''}
                            onChange={(e) => setReportLogId(e.target.value ? Number(e.target.value) : null)}
                          >
                            {logs.map((log) => (
                              <option key={log.id} value={log.id}>
                                {log.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => generateReportFor(reportSopId, reportLogId)}
                            disabled={reportGenerating || !reportSopId || !reportLogId}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {reportGenerating ? 'Updating...' : 'Update Report'}
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mt-3">
                        Select the SOP and Log pair to update the report and chart.
                      </div>
                    </div>

                    {/* Executive Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Executive Summary</div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="text-slate-900 leading-relaxed">{reportData.summary}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-white rounded-xl border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1">Severity</div>
                            <div className={`text-xl font-bold ${
                              reportData.severity === 'Low' ? 'text-emerald-600' :
                              reportData.severity === 'Medium' ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {reportData.severity}
                            </div>
                          </div>
                          <div className="p-4 bg-white rounded-xl border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1">Overall Score</div>
                            <div className="text-xl font-bold text-slate-900">
                              {Math.round((reportData.overall_score || 0) * 100)}%
                            </div>
                          </div>
                          <div className="p-4 bg-white rounded-xl border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1">Confidence</div>
                            <div className="text-xl font-bold text-slate-900">
                              {Math.round((reportData.severity_confidence || 0) * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats Cards */}
                      <div className="space-y-4">
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Compliance Stats</div>
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="text-xs text-blue-600 mb-1">Total Parameters</div>
                            <div className="text-2xl font-bold text-blue-900">{reportData.total_parameters || 0}</div>
                          </div>
                          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                            <div className="text-xs text-emerald-600 mb-1">Compliant</div>
                            <div className="text-2xl font-bold text-emerald-900">{reportData.compliant_parameters || 0}</div>
                          </div>
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                            <div className="text-xs text-amber-600 mb-1">Deviations</div>
                            <div className="text-2xl font-bold text-amber-900">{reportData.deviation_parameters || 0}</div>
                          </div>
                          <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                            <div className="text-xs text-red-600 mb-1">Missing</div>
                            <div className="text-2xl font-bold text-red-900">{reportData.missing_parameters?.length || 0}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Missing Parameters Section */}
                    {reportData.missing_parameters && reportData.missing_parameters.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                            Missing Parameters ({reportData.missing_parameters.length})
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {reportData.missing_parameters.map((item, idx) => (
                            <div key={idx} className="p-4 bg-red-50 rounded-xl border border-red-200">
                              <div className="flex items-start justify-between mb-2">
                                <div className="font-semibold text-red-900">{item.parameter}</div>
                                <span className="px-2 py-1 bg-red-200 text-red-800 text-xs font-medium rounded-full">Missing</span>
                              </div>
                              <div className="text-sm text-red-700">
                                <div className="mb-1"><span className="font-medium">Expected:</span> {item.expected}</div>
                                <div className="text-red-600"><span className="font-medium">Reason:</span> {item.reason}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Parameter Comparison Table */}
                    {reportData.parameter_comparison && reportData.parameter_comparison.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                          Detailed Parameter Comparison (Expected vs Actual)
                        </div>
                        <div className="overflow-hidden border border-slate-200 rounded-xl">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>
                                <th className="px-4 py-3 font-semibold text-slate-700">Parameter</th>
                                <th className="px-4 py-3 font-semibold text-slate-700">Expected (SOP)</th>
                                <th className="px-4 py-3 font-semibold text-slate-700">Actual (Log)</th>
                                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                                <th className="px-4 py-3 font-semibold text-slate-700">Score</th>
                                <th className="px-4 py-3 font-semibold text-slate-700">Details</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {reportData.parameter_comparison.map((item, idx) => (
                                <tr 
                                  key={idx} 
                                  className={`hover:bg-slate-50 transition ${
                                    item.status === 'missing' ? 'bg-red-50' : 
                                    item.status === 'deviation' ? 'bg-amber-50' : ''
                                  }`}
                                >
                                  <td className="px-4 py-3 font-medium text-slate-900">{item.parameter}</td>
                                  <td className="px-4 py-3 text-slate-700 font-mono text-xs">{item.expected}</td>
                                  <td className="px-4 py-3 text-slate-700 font-mono text-xs">{item.actual}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      item.status === 'compliant' ? 'bg-emerald-100 text-emerald-700' :
                                      item.status === 'deviation' ? 'bg-amber-100 text-amber-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden max-w-[80px]">
                                        <div
                                          className={`h-full rounded-full transition-all ${
                                            item.score >= 0.7 ? 'bg-emerald-500' :
                                            item.score >= 0.4 ? 'bg-amber-500' : 'bg-red-500'
                                          }`}
                                          style={{ width: `${(item.score || 0) * 100}%` }}
                                        />
                                      </div>
                                      <span className="text-xs font-mono text-slate-600">{Math.round((item.score || 0) * 100)}%</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <details className="text-xs">
                                      <summary className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium">View</summary>
                                      <div className="mt-2 p-2 bg-slate-100 rounded border border-slate-200">
                                        <div className="mb-1"><span className="font-medium text-slate-600">Rule:</span> {item.rule_text?.slice(0, 100)}{item.rule_text?.length > 100 ? '...' : ''}</div>
                                        <div><span className="font-medium text-slate-600">Log:</span> {item.log_text?.slice(0, 100)}{item.log_text?.length > 100 ? '...' : ''}</div>
                                      </div>
                                    </details>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Chart Visualization */}
                    {numericComparisonData.length > 0 ? (
                      <div>
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                          Expected vs Actual (Numeric Parameters)
                        </div>
                        <div style={{ width: '100%', height: 320 }}>
                          <ResponsiveContainer>
                            <ComposedChart data={numericComparisonData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="parameter" tick={{ fontSize: 10, fill: '#64748b' }} angle={-45} textAnchor="end" height={80} />
                              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                              <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                labelStyle={{ fontWeight: '600' }}
                                formatter={(value, name, props) => {
                                  const unit = props?.payload?.unit ? ` ${props.payload.unit}` : ''
                                  const label = name === 'expected' ? 'SOP (Expected)' : 'Log (Actual)'
                                  return [`${value}${unit}`, label]
                                }}
                              />
                              <Legend verticalAlign="top" height={36} />
                              <Bar dataKey="expected" fill="#94a3b8" name="SOP (Expected)" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="actual" fill="#6366f1" name="Log (Actual)" radius={[4, 4, 0, 0]} />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-sm">
                        No numeric parameter pairs with matching units found for charting. Parameters with non-numeric
                        values or mismatched units are skipped.
                      </div>
                    )}

                    {/* Gaps Section */}
                    {reportData.gaps && reportData.gaps.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Detailed Compliance Gaps</div>
                        <div className="overflow-hidden border border-slate-200 rounded-xl">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>
                                <th className="px-4 py-3 font-semibold text-slate-700">Expected (SOP)</th>
                                <th className="px-4 py-3 font-semibold text-slate-700">Observed (Log)</th>
                                <th className="px-4 py-3 font-semibold text-slate-700">Severity</th>
                                <th className="px-4 py-3 font-semibold text-slate-700">Score</th>
                                <th className="px-4 py-3 font-semibold text-slate-700">Recommendation</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {reportData.gaps.map((gap, idx) => {
                                const SeverityIcon = severityConfig[gap.severity]?.icon || AlertTriangle
                                return (
                                  <tr key={idx} className="hover:bg-slate-50 transition">
                                    <td className="px-4 py-3 text-slate-900 font-medium max-w-xs">{gap.expected}</td>
                                    <td className="px-4 py-3 text-slate-600 max-w-xs">{gap.observed}</td>
                                    <td className="px-4 py-3">
                                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                                        severityConfig[gap.severity]?.bg || 'bg-slate-100'
                                      } ${severityConfig[gap.severity]?.text || 'text-slate-700'}`}>
                                        <SeverityIcon className="w-3.5 h-3.5" />
                                        {gap.severity}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="text-xs font-mono text-slate-600">{Math.round((gap.score || 0) * 100)}%</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 max-w-xs">{gap.recommendation}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function UploadCard({ type, title, description, icon: Icon, color, onUpload }) {
  const [uploading, setUploading] = useState(false)

  const handleChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      await onUpload(file)
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
      e.target.value = null
    }
  }

  return (
    <div className="card p-6 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          color === 'primary' ? 'bg-primary-100' : 'bg-accent-100'
        }`}>
          <Icon className={`w-6 h-6 ${color === 'primary' ? 'text-primary-600' : 'text-accent-600'}`} />
        </div>
        {uploading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            Uploading...
          </div>
        )}
      </div>
      <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 mb-4">{description}</p>
      <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl cursor-pointer transition-all">
        <Upload className="w-4 h-4" />
        {uploading ? 'Processing...' : `Upload ${type === 'sop' ? 'SOP' : 'Log'}`}
        <input
          type="file"
          className="hidden"
          onChange={handleChange}
          accept={type === 'sop' ? '.pdf,.txt' : '.csv,.txt'}
        />
      </label>
    </div>
  )
}

function SopSelectCard({ sops, loading, selectedSopId, onSelect, onManage }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-100">
          <FileText className="w-6 h-6 text-primary-600" />
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            Loading...
          </div>
        )}
      </div>
      <h4 className="font-bold text-slate-900 mb-1">Select SOP</h4>
      <p className="text-sm text-slate-500 mb-4">
        Choose an uploaded SOP to run analysis against your log.
      </p>
      {sops.length === 0 && !loading && (
        <div className="text-sm text-slate-500">
          No SOPs found.{' '}
          <button onClick={onManage} className="text-primary-600 hover:text-primary-700 font-semibold">
            Upload one here
          </button>
          .
        </div>
      )}
      {sops.length > 0 && (
        <div className="space-y-3">
          <select
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedSopId ?? ''}
            onChange={(e) => onSelect(e.target.value ? Number(e.target.value) : null)}
          >
            {sops.map((sop) => (
              <option key={sop.id} value={sop.id}>
                {sop.title}
              </option>
            ))}
          </select>
          <div className="text-xs text-slate-500">
            {selectedSopId ? `Selected SOP ID: ${selectedSopId}` : 'Select an SOP to continue.'}
          </div>
        </div>
      )}
    </div>
  )
}
