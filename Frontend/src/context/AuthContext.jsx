import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:5000/api/users';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Palautetaan istunto, jos selaimessa on voimassa oleva refresh-cookie.
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
        setUser(userData);
      } catch (error) {
        console.error('Session restoration failed:', error);
      }
    }

    restoreSession();
  }, []);

  // Tallennetaan backendiltä kirjautumisen jälkeen saadut käyttäjä- ja token-tiedot.
  function login(userData) {
    setUser(userData);
  }

  // Mitätöidään refresh token backendissä ja tyhjennetään käyttäjä paikallisesti.
  async function logout() {
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
  }

  // Tallennetaan Authorization-headerissa palautettu uusi access token.
  function updateAccessToken(response) {
    const authorization = response.headers.get('Authorization');

    if (!response.ok || !authorization?.startsWith('Bearer ')) {
      return;
    }

    const token = authorization.slice(7);
    setUser(currentUser => ({ ...currentUser, token }));
  }

  // Haetaan refresh-cookien avulla uusi access token ja käyttäjätiedot.
  async function refreshAccessToken() {
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
  }

  // Lähetetään suojattu pyyntö ja uusitaan token kerran, jos se on vanhentunut.
  async function authenticatedFetch(url, options = {}) {
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

    // Access token vanheni, joten haetaan uusi token refresh-cookien avulla.
    const newToken = await refreshAccessToken();

    if (!newToken) {
      return response;
    }

    // Yritetään alkuperäinen pyyntö kerran uudelleen uudella access tokenilla.
    headers.set('Authorization', `Bearer ${newToken}`);
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    updateAccessToken(response);
    return response;
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