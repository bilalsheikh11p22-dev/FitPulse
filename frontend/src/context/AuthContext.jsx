import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { readStoredUser } from '../api/api';

const AuthContext = createContext();

const persist = (userObj) => {
  if (userObj) localStorage.setItem('fitpulse_user', JSON.stringify(userObj));
  else localStorage.removeItem('fitpulse_user');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('fitpulse_theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('fitpulse_theme', theme);
  }, [theme]);

  const logout = useCallback(() => {
    setUser(null);
    persist(null);
  }, []);

  // Restore the session after a refresh: validate the stored token against the server
  useEffect(() => {
    const verifyUser = async () => {
      const stored = readStoredUser();
      if (stored?.token) {
        try {
          const res = await api.get('/auth/profile');
          const merged = { ...stored, ...res.data, token: stored.token };
          setUser(merged);
          persist(merged);
          if (res.data?.preferences?.theme) setTheme(res.data.preferences.theme);
        } catch (error) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            logout();
          }
          // network errors keep the cached session so a temporary outage does not log the user out
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, [logout]);

  // Global handler for expired tokens / deactivated accounts (dispatched by the axios interceptor)
  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener('fitpulse:unauthorized', onUnauthorized);
    return () => window.removeEventListener('fitpulse:unauthorized', onUnauthorized);
  }, [logout]);

  const startSession = (data) => {
    setUser(data);
    persist(data);
    if (data?.preferences?.theme) setTheme(data.preferences.theme);
    return data;
  };

  const login = async (emailOrUsername, password) => {
    const res = await api.post('/auth/login', { emailOrUsername, password });
    return startSession(res.data);
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    return startSession(res.data);
  };

  const updateUser = async (updatedFields) => {
    const res = await api.put('/auth/profile', updatedFields);
    setUser((prev) => {
      const merged = { ...prev, ...res.data };
      persist(merged);
      return merged;
    });
    return res.data;
  };

  // Re-read the profile (e.g. after a progress check-in changed the weight)
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/profile');
      setUser((prev) => {
        const merged = { ...prev, ...res.data, token: prev?.token };
        persist(merged);
        return merged;
      });
    } catch {
      /* the interceptor handles expired sessions */
    }
  }, []);

  // Header theme button: switch immediately and, for signed-in users, save to preferences.theme
  const changeTheme = (next) => {
    setTheme(next);
    if (readStoredUser()?.token) {
      api.put('/auth/profile', { preferences: { theme: next } })
        .then((res) => {
          setUser((prev) => {
            if (!prev) return prev;
            const merged = { ...prev, preferences: res.data.preferences };
            persist(merged);
            return merged;
          });
        })
        .catch(() => {});
    }
  };

  const toggleTheme = () => changeTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        theme,
        toggleTheme,
        changeTheme,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
