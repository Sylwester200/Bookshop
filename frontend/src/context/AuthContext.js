import { createContext, useState } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const register = async (username, password) => {
    try {
      await api.post('/users/register', { username, password });
      return true;
    } catch {
      return false;
    }
  };

  const login = async (username, password) => {
    try {
      const { data } = await api.post('/users/login', { username, password });
      setUser({ id: data.userId, username });
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await api.post('/users/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
