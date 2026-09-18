import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('user');

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      sessionStorage.removeItem('user');
      return null;
    }
  });

  function login(userData) {
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }

  async function logout() {
    const token = user?.token;

    try {
      if (!token) {
        return false;
      }

      const response = await fetch('http://localhost:5000/api/users/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Logout request failed:', error);
      return false;
    } finally {
      sessionStorage.removeItem('user');
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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