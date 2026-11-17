
import axios from 'axios';

// Production uses the deployed backend.
// Development uses the local backend.
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://pulsefit-5wbi.vercel.app/api'
    : 'http://localhost:5001/api');

console.log('[FitPulse API] Using:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('fitpulse_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem('fitpulse_user');
    return null;
  }
};

// Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const parsed = readStoredUser();

    if (parsed?.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired or deactivated sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    const isAuthForm =
      url.includes('/auth/login') ||
      url.includes('/auth/register');

    const hadToken = Boolean(
      error.config?.headers?.Authorization
    );

    const deactivated =
      status === 403 &&
      /deactivated/i.test(
        error.response?.data?.message || ''
      );

    if (!isAuthForm && hadToken && (status === 401 || deactivated)) {
      window.dispatchEvent(
        new CustomEvent('fitpulse:unauthorized')
      );
    }

    return Promise.reject(error);
  }
);

export default api;
