import axios from 'axios';

// Backend root from .env, e.g. VITE_API_URL=http://localhost:5000 → requests go to http://localhost:5000/api/...
// When it is empty, requests stay on this site (/api/...) and Vite's dev proxy forwards them.
const BACKEND_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 15000,
});

// "All" filters are empty strings in the UI; don't send them as e.g. ?type=
api.interceptors.request.use((config) => {
  if (config.params) {
    config.params = Object.fromEntries(
      Object.entries(config.params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
    );
  }
  return config;
});

// Success: resolve with `data` from the backend's { success, data } envelope,
//   so `const products = await api.get('/products')` is the list itself.
// Failure: reject with an ApiError carrying the backend's message, status and code (e.g. NOT_REGISTERED).
api.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    if (!error.response) {
      return Promise.reject(
        new ApiError(`Cannot reach the server${BACKEND_URL ? ` at ${BACKEND_URL}` : ''}. Is the backend running?`)
      );
    }

    const { status, data: payload } = error.response;
    // A validation error's first field message says exactly what to fix.
    const message = payload?.details?.[0]?.message ?? payload?.message ?? `Request failed (HTTP ${status})`;

    return Promise.reject(new ApiError(message, { status, code: payload?.code, details: payload?.details }));
  }
);

export default api;
