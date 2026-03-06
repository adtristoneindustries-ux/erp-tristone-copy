import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Prevent browser back button access to previous sessions
  useEffect(() => {
    const handlePopState = () => {
      const token = localStorage.getItem('token');
      const currentRole = sessionStorage.getItem('currentUserRole');
      
      if (!token || !currentRole) {
        window.history.replaceState(null, '', '/login');
        window.location.href = '/login';
        return;
      }
      
      // Ensure user stays within their role's routes
      const currentPath = window.location.pathname;
      // Allow librarian to access staff routes
      const allowedPath = currentRole === 'staff' ? '/staff' : `/${currentRole}`;
      if (!currentPath.startsWith(allowedPath) && currentPath !== '/login') {
        window.history.replaceState(null, '', allowedPath);
        window.location.href = allowedPath;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authAPI.me();
          // Verify session consistency - allow librarian to use staff routes
          const currentRole = sessionStorage.getItem('currentUserRole');
          if (currentRole && currentRole !== res.data.role) {
            // Allow librarian to access staff routes
            if (!(currentRole === 'staff' && res.data.role === 'librarian')) {
              // Role mismatch - clear everything and redirect to login
              localStorage.removeItem('token');
              sessionStorage.clear();
              setUser(null);
              window.history.replaceState(null, '', '/login');
              return;
            }
          }
          setUser(res.data);
        } catch (error) {
          localStorage.removeItem('token');
          sessionStorage.clear();
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    console.log('AuthContext login called with:', credentials);
    try {
      // Clear any existing token before login attempt
      localStorage.removeItem('token');
      sessionStorage.clear();
      setUser(null);
      
      const res = await authAPI.login(credentials);
      console.log('API response:', res.data);
      
      // Validate that the returned user role matches the requested role
      // Allow librarian to login as staff
      if (res.data.user.role !== credentials.role) {
        if (!(credentials.role === 'staff' && res.data.user.role === 'librarian')) {
          throw new Error('Invalid credentials for selected role');
        }
      }
      
      localStorage.setItem('token', res.data.token);
      // Store current session info to prevent cross-session access
      // Use actual user role for routing, not requested role
      const routeRole = res.data.user.role === 'librarian' ? 'staff' : res.data.user.role;
      sessionStorage.setItem('currentUserRole', routeRole);
      sessionStorage.setItem('sessionId', Date.now().toString());
      setUser(res.data.user);
      console.log('User set in context:', res.data.user);
      
      // Clear browser history to prevent accessing previous sessions
      window.history.replaceState(null, '', `/${routeRole}`);
      
      return res.data.user;
    } catch (error) {
      console.error('Login failed:', error);
      // Clear any tokens on failed login
      localStorage.removeItem('token');
      sessionStorage.clear();
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    setUser(null);
    // Clear browser history to prevent back button access
    window.history.replaceState(null, '', '/login');
    window.location.href = '/login';
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, clearAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
