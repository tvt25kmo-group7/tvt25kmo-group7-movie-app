import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:5000/api/users';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Palautetaan istunto refresh-cookien avulla.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const response = await fetch(`${API_URL}/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          return;
        }

        const userData = await response.json();

        if (!cancelled) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Session restoration failed:', error);
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Logout request failed:', error);
      return false;
    } finally {
      setUser(null);
    }
  }, []);

  const updateAccessToken = useCallback((response) => {
    const authorization = response.headers.get('Authorization');

    if (!response.ok || !authorization?.startsWith('Bearer ')) {
      return;
    }

    const token = authorization.slice(7);

    setUser(currentUser => {
      if (!currentUser) {
        return currentUser;
      }

      return {
        ...currentUser,
        token,
      };
    });
  }, []);

  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        setUser(null);
        return null;
      }

      const refreshedUser = await response.json();
      setUser(refreshedUser);

      return refreshedUser.token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      setUser(null);
      return null;
    }
  }, []);

  const authenticatedFetch = useCallback(
    async (url, options = {}) => {
      if (!user?.token) {
        throw new Error('Authentication required');
      }

      const headers = new Headers(options.headers);
      headers.set('Authorization', `Bearer ${user.token}`);

      let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      if (response.status !== 401) {
        updateAccessToken(response);
        return response;
      }

      // Access token vanheni.
      const newToken = await refreshAccessToken();

      if (!newToken) {
        return response;
      }

      headers.set('Authorization', `Bearer ${newToken}`);

      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      updateAccessToken(response);

      return response;
    },
    [user?.token, refreshAccessToken, updateAccessToken],
  );

  const contextValue = useMemo(
    () => ({
      user,
      authLoading,
      login,
      logout,
      authenticatedFetch,
    }),
    [
      user,
      authLoading,
      login,
      logout,
      authenticatedFetch,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}