import { useState, useContext, useEffect } from 'react';
import { Shield, Users, GraduationCap, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, clearAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  // Clear any stale auth state on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('clearAuth') === 'true') {
      console.log('Clearing authentication state as requested');
      clearAuth();
    }
  }, [clearAuth]);

  // Auto-select role based on intended URL
  useEffect(() => {
    const redirectUrl = sessionStorage.getItem('redirectUrl');
    if (redirectUrl && redirectUrl !== '/login' && redirectUrl !== '/') {
      if (redirectUrl.startsWith('/admin')) {
        setSelectedRole('admin');
      } else if (redirectUrl.startsWith('/staff')) {
        setSelectedRole('staff');
      } else if (redirectUrl.startsWith('/student')) {
        setSelectedRole('student');
      }
    }
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    setFormData({ email: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', { email: formData.email, role: selectedRole });
      const user = await login({ ...formData, role: selectedRole });
      console.log('Login successful, user:', user);
      
      // Navigate to the appropriate dashboard after successful login
      const redirectUrl = sessionStorage.getItem('redirectUrl');
      if (redirectUrl && redirectUrl !== '/login' && redirectUrl !== '/') {
        // If there's a stored redirect URL and it's not login page, go there
        sessionStorage.removeItem('redirectUrl');
        console.log('Redirecting to stored URL:', redirectUrl);
        navigate(redirectUrl, { replace: true });
      } else {
        // Otherwise go to user's default dashboard
        sessionStorage.removeItem('redirectUrl');
        const targetUrl = `/${user.role}`;
        console.log('Navigating to dashboard:', targetUrl);
        navigate(targetUrl, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fillDemoCredentials = (role) => {
    const credentials = {
      admin: { email: 'admin@school.com', password: 'admin123' },
      staff: { email: 'staff@school.com', password: 'staff123' },
      student: { email: 'student@school.com', password: 'student123' }
    };
    setFormData(credentials[role]);
  };

  const roleCards = [
    {
      role: 'admin',
      title: 'Admin Login',
      icon: Shield,
      description: 'Manage students, staff, and system settings',
      bgColor: 'from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700'
    },
    {
      role: 'staff',
      title: 'Staff Login',
      icon: Users,
      description: 'Manage attendance, marks, and materials',
      bgColor: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      role: 'student',
      title: 'Student Login',
      icon: GraduationCap,
      description: 'View marks, attendance, and materials',
      bgColor: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    }
  ];

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">School ERP System</h1>
            <p className="text-lg text-gray-600">Choose your login portal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {roleCards.map((card) => (
              <div
                key={card.role}
                onClick={() => handleRoleSelect(card.role)}
                className={`bg-gradient-to-br ${card.bgColor} ${card.hoverColor} text-white rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl p-8`}
              >
                <div className="text-center">
                  <div className="mb-6">
                    <card.icon size={64} className="mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{card.title}</h3>
                  <p className="text-white/90 mb-6">{card.description}</p>
                  <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-sm font-medium">Click to Login</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Demo Credentials</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-medium text-red-600">Admin</p>
                  <p className="text-gray-600">admin@school.com</p>
                  <p className="text-gray-600">admin123</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-green-600">Staff</p>
                  <p className="text-gray-600">staff@school.com</p>
                  <p className="text-gray-600">staff123</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-blue-600">Student</p>
                  <p className="text-gray-600">student@school.com</p>
                  <p className="text-gray-600">student123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = roleCards.find(card => card.role === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <button
            onClick={() => setSelectedRole('')}
            className="text-gray-500 hover:text-gray-700 mb-4 flex items-center mx-auto gap-2"
          >
            <ArrowLeft size={16} />
            Back to Role Selection
          </button>
          <div className="mb-4">
            <currentCard.icon size={48} className="mx-auto text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentCard.title}</h2>
          <p className="text-gray-600">{currentCard.description}</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="button"
            onClick={() => fillDemoCredentials(selectedRole)}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Fill Demo Credentials
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r ${currentCard.bgColor} text-white py-3 px-4 rounded-lg ${currentCard.hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 font-medium transition-all duration-200`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;