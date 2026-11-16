import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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

// Intercept requests to add JWT token from localStorage
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

// An expired / invalid token (401) or a deactivated account (403 on a token-bearing request)
// ends the session. Login/register failures are left alone so the form can show the message.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthForm = url.includes('/auth/login') || url.includes('/auth/register');
    const hadToken = Boolean(error.config?.headers?.Authorization);
    const deactivated = status === 403 && /deactivated/i.test(error.response?.data?.message || '');
    if (!isAuthForm && hadToken && (status === 401 || deactivated)) {
      window.dispatchEvent(new CustomEvent('fitpulse:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
