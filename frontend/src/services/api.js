import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login/json', { email, password }),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const dashboardAPI = {
  summary: () => api.get('/dashboard/summary'),
  kpis: () => api.get('/dashboard/kpis'),
};

export const inventoryAPI = {
  list: (params) => api.get('/inventory', { params }),
  alerts: () => api.get('/inventory/alerts'),
  recommendations: () => api.get('/inventory/recommendations'),
};

export const suppliersAPI = {
  list: () => api.get('/suppliers'),
  recommendations: () => api.get('/suppliers/recommendation'),
};

export const logisticsAPI = {
  shipments: () => api.get('/shipments'),
  routes: () => api.get('/shipments/routes'),
  delayed: () => api.get('/shipments/delayed'),
};

export const riskAPI = {
  overview: () => api.get('/risk/overview'),
  predictions: () => api.get('/risk/predictions'),
};

export const forecastAPI = {
  products: (horizon = 30) => api.get('/forecast/products', { params: { horizon } }),
  accuracy: () => api.get('/forecast/accuracy'),
  product: (id, horizon = 30) => api.get(`/forecast/product/${id}`, { params: { horizon } }),
};

export const costAPI = {
  overview: () => api.get('/cost/overview'),
  trends: () => api.get('/cost/trends'),
};

export const assistantAPI = {
  query: (query) => api.post('/ai/assistant', { query }),
};

export const simulationAPI = {
  run: (data) => api.post('/simulation/run', data),
};

export const reportsAPI = {
  download: (key) =>
    api.get(`/reports/${key}`, { responseType: 'blob' }),
};

export default api;
