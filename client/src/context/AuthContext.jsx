import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          setIsAuthenticated(true);
          if (res.data.email === 'priya.sharma@splitsync.demo') {
            setIsDemoMode(true);
          }
        } catch (error) {
          console.error('Invalid token', error);
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser({
      _id: res.data._id,
      name: res.data.name,
      email: res.data.email,
      avatar: res.data.avatar,
    });
    setIsAuthenticated(true);
    setIsDemoMode(res.data.email === 'priya.sharma@splitsync.demo');
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', res.data.token);
    setUser({
      _id: res.data._id,
      name: res.data.name,
      email: res.data.email,
      avatar: res.data.avatar,
    });
    setIsAuthenticated(true);
    setIsDemoMode(false);
    return res.data;
  };

  const demoLogin = async () => {
    const res = await api.post('/auth/demo-login');
    localStorage.setItem('token', res.data.token);
    setUser({
      _id: res.data._id,
      name: res.data.name,
      email: res.data.email,
      avatar: res.data.avatar,
    });
    setIsAuthenticated(true);
    setIsDemoMode(true);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setIsDemoMode(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        isDemoMode,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
