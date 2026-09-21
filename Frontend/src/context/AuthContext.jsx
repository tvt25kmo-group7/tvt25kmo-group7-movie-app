import { createContext, useContext, useEffect, useRef, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const sessionVersion = useRef(0);

  useEffect(() => {
    const version = ++sessionVersion.current;

    async function restoreSession() {
      try {
        const response = await fetch('http://localhost:5000/api/users/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          return;
        }

        const userData = await response.json();

        if (sessionVersion.current === version) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Session restoration failed:', error);
      }
    }

    restoreSession();

    return () => {
      sessionVersion.current += 1;
    };
  }, []);

  function login(userData) {
    sessionVersion.current += 1;
    setUser(userData);
  }

  async function logout() {
    const version = ++sessionVersion.current;

    try {
      const response = await fetch('http://localhost:5000/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      });

      return response.ok;
    } catch (error) {
      console.error('Logout request failed:', error);
      return false;
    } finally {
      if (sessionVersion.current === version) {
        setUser(null);
      }
    }
  }

  async function authenticatedFetch(url, options = {}) {
    if (!user?.token) {
      throw new Error('Authentication required');
    }

    const version = sessionVersion.current;
    const currentToken = user.token;

    async function sendRequest(token) {
      const headers = new Headers(options.headers);
      headers.set('Authorization', `Bearer ${token}`);

      return fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    }

    function saveRecycledToken(response, sentToken) {
      const authorization = response.headers.get('Authorization');

      if (
        !response.ok ||
        !authorization?.startsWith('Bearer ') ||
        sessionVersion.current !== version
      ) {
        return;
      }

      const newToken = authorization.slice(7);

      setUser(currentUser => {
        if (!currentUser || currentUser.token !== sentToken) {
          return currentUser;
        }

        return { ...currentUser, token: newToken };
      });
    }

    const response = await sendRequest(currentToken);

    if (response.status !== 401) {
      saveRecycledToken(response, currentToken);
      return response;
    }

    // Älä uusi vanhaa istuntoa, jos käyttäjä ehti vaihtua.
    if (sessionVersion.current !== version) {
      return response;
    }

    // Access token ei kelvannut: kokeillaan refresh cookieta.
    const refreshResponse = await fetch(
      'http://localhost:5000/api/users/refresh',
      {
        method: 'POST',
        credentials: 'include',
      },
    );

    if (sessionVersion.current !== version) {
      return response;
    }

    if (!refreshResponse.ok) {
      if (refreshResponse.status === 401) {
        setUser(null);
      }

      return response;
    }

    const refreshedUser = await refreshResponse.json();

    if (sessionVersion.current !== version) {
      return response;
    }

    setUser(refreshedUser);

    // Yritä alkuperäistä pyyntöä uudella tokenilla vain kerran.
    const retryResponse = await sendRequest(refreshedUser.token);

    saveRecycledToken(retryResponse, refreshedUser.token);

    return retryResponse;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, authenticatedFetch }}>
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