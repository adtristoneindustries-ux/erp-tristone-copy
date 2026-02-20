import { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AuthRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    // Clear any stale redirect URLs when component mounts
    const redirectUrl = sessionStorage.getItem('redirectUrl');
    if (redirectUrl === '/' || redirectUrl === '/login') {
      sessionStorage.removeItem('redirectUrl');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">School ERP System</h2>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // User is authenticated, redirect to their dashboard
    return <Navigate to={`/${user.role}`} replace />;
  }

  // User is not authenticated, redirect to login
  return <Navigate to="/login" replace />;
};

export default AuthRedirect;