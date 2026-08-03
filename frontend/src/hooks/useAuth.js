import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * useAuth — reads / writes the JWT token from localStorage.
 * All admin pages import this instead of hardcoding a token constant.
 */
export function useAuth() {
  const [token, setTokenState] = useState(() => localStorage.getItem('token') || '');
  const [adminName, setAdminName] = useState(() => localStorage.getItem('adminName') || '');
  const navigate = useNavigate();

  const login = useCallback((jwt, name) => {
    localStorage.setItem('token', jwt);
    localStorage.setItem('adminName', name || 'Admin');
    setTokenState(jwt);
    setAdminName(name || 'Admin');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminName');
    setTokenState('');
    setAdminName('');
    navigate('/admin/login');
  }, [navigate]);

  return { token, adminName, login, logout, isLoggedIn: !!token };
}
