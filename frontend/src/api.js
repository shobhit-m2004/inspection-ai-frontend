import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export function setToken(token) {
  if (token) {
    localStorage.setItem('auth_token', token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    localStorage.removeItem('auth_token')
    delete api.defaults.headers.common.Authorization
  }
}

export function getToken() {
  return localStorage.getItem('auth_token')
}

export const AuthApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
}

export const SopApi = {
  upload: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/sops/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  list: () => api.get('/sops'),
  get: (id) => api.get(`/sops/${id}`),
  delete: (id) => api.delete(`/sops/${id}`),
}

export const LogApi = {
  upload: (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/logs/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  list: () => api.get('/logs'),
  get: (id) => api.get(`/logs/${id}`),
  delete: (id) => api.delete(`/logs/${id}`),
}

export const AnalyzeApi = {
  run: (payload = {}) => api.post('/analyze', payload),
}

export const DashboardApi = {
  get: () => api.get('/dashboard'),
  summary: () => api.get('/dashboard/summary'),
}

export const ReportApi = {
  generate: (payload) => api.post('/reports/generate', payload),
  download: (reportId, format = 'pdf') => 
    api.get(`/reports/download/${reportId}?format=${format}`, { 
      responseType: 'blob',
      headers: {
        'Accept': format === 'json' ? 'application/json' : (format === 'txt' ? 'text/plain' : 'application/pdf')
      }
    }),
  downloadJSON: (reportId) => ReportApi.download(reportId, 'json'),
  downloadTXT: (reportId) => ReportApi.download(reportId, 'txt'),
  downloadPDF: (reportId) => ReportApi.download(reportId, 'pdf'),
}

export const HealthApi = {
  check: () => api.get('/health'),
}

export default api
