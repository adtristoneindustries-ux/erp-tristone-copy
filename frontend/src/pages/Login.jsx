import { useState, useContext, useEffect } from 'react';
import { Shield, Users, GraduationCap, ArrowLeft, AlertTriangle, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, clearAuth } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('clearAuth') === 'true') {
      clearAuth();
    }
  }, [clearAuth]);

  useEffect(() => {
    const redirectUrl = sessionStorage.getItem('redirectUrl');
    if (redirectUrl && redirectUrl !== '/login' && redirectUrl !== '/') {
      if (redirectUrl.startsWith('/admin')) setSelectedRole('admin');
      else if (redirectUrl.startsWith('/staff')) setSelectedRole('staff');
      else if (redirectUrl.startsWith('/student')) setSelectedRole('student');
    }
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    setFormData({ email: '', password: '', rememberMe: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login({ email: formData.email, password: formData.password, role: selectedRole });
      const redirectUrl = sessionStorage.getItem('redirectUrl');
      if (redirectUrl && redirectUrl !== '/login' && redirectUrl !== '/') {
        sessionStorage.removeItem('redirectUrl');
        navigate(redirectUrl, { replace: true });
      } else {
        sessionStorage.removeItem('redirectUrl');
        navigate(`/${user.role}`, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const roleCards = [
    { role: 'admin', title: 'Admin Login', icon: Shield, description: 'Manage students, staff, and system settings', gradient: 'from-red-500 to-pink-600' },
    { role: 'staff', title: 'Staff Login', icon: Users, description: 'Manage attendance, marks, and materials', gradient: 'from-green-500 to-emerald-600' },
    { role: 'student', title: 'Student Login', icon: GraduationCap, description: 'View marks, attendance, and materials', gradient: 'from-blue-500 to-indigo-600' }
  ];

  if (!selectedRole) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          backgroundImage: settings.loginBackgroundUrl ? `url(${settings.loginBackgroundUrl})` : 'linear-gradient(to bottom right, #f9fafb, #e5e7eb)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="w-full max-w-6xl">
          <div className="text-center mb-12">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.schoolName} className="h-16 w-auto mx-auto mb-4 object-contain" />
            ) : (
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">{settings.schoolName}</h1>
            )}
            <p className="text-lg text-gray-600">{settings.tagline}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {roleCards.map((card) => (
              <div
                key={card.role}
                onClick={() => handleRoleSelect(card.role)}
                className={`bg-gradient-to-br ${card.gradient} text-white rounded-xl shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl p-8`}
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
                {roleCards.map((card) => (
                  <div key={card.role} className="text-center">
                    <p className={`font-medium ${card.role === 'admin' ? 'text-red-600' : card.role === 'staff' ? 'text-green-600' : 'text-blue-600'}`}>
                      {card.title.replace(' Login', '')}
                    </p>
                    <p className="text-gray-600">{card.role}@school.com</p>
                    <p className="text-gray-600">{card.role}123</p>
                    <button
                      onClick={() => {
                        handleRoleSelect(card.role);
                        setFormData({ email: `${card.role}@school.com`, password: `${card.role}123`, rememberMe: false });
                      }}
                      className={`mt-2 px-4 py-2 rounded-lg text-white text-xs font-medium bg-gradient-to-r ${card.gradient} hover:opacity-90 transition-opacity`}
                    >
                      Use Demo Login
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = roleCards.find(card => card.role === selectedRole);
  const RoleIcon = currentCard.icon;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentCard.gradient} flex items-center justify-center p-4`}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-12">
            <button
              onClick={() => setSelectedRole('')}
              className="text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Role Selection</span>
            </button>

            <div className="mb-8">
              <div className={`w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br ${currentCard.gradient} flex items-center justify-center shadow-lg`}>
                <RoleIcon size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{currentCard.title}</h2>
              <p className="text-gray-600">Please enter your credentials to continue</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                <AlertTriangle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember me</span>
                </label>
                <a href="#" className="text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r ${currentCard.gradient} text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={() => setFormData({ email: `${selectedRole}@school.com`, password: `${selectedRole}123`, rememberMe: false })}
                className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
              >
                Use Demo Credentials
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">Demo: {selectedRole}@school.com / {selectedRole}123</p>
            </div>
          </div>

          <div className={`hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br ${currentCard.gradient} text-white relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                <path fill="white" d="M0,200 Q100,100 200,200 T400,200 L400,400 L0,400 Z" />
                <circle cx="100" cy="100" r="80" fill="white" opacity="0.1" />
                <circle cx="350" cy="300" r="100" fill="white" opacity="0.1" />
              </svg>
            </div>
            <div className="relative z-10 text-center">
              <div className="mb-6">
                <RoleIcon size={80} className="mx-auto mb-4" />
              </div>
              <h3 className="text-4xl font-bold mb-4">{settings.welcomeMessage}</h3>
              <p className="text-lg text-white/90 mb-6 max-w-sm">
                {currentCard.description}
              </p>
              <div className="space-y-3 text-left max-w-sm mx-auto">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Secure & Fast Login</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Real-time Updates</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Easy to Use Dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
