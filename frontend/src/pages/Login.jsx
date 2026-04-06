import { useState, useContext, useEffect } from 'react';
import { Shield, Users, GraduationCap, ArrowLeft, AlertTriangle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SettingsContext } from '../context/SettingsContext';
import ParticleBackground from '../components/ParticleBackground';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      else if (redirectUrl.startsWith('/librarian')) setSelectedRole('staff');
      else if (redirectUrl.startsWith('/canteen')) setSelectedRole('staff');
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
        // Route based on actual user role
        if (user.role === 'librarian') {
          navigate('/librarian', { replace: true });
        } else {
          navigate(`/${user.role}`, { replace: true });
        }
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
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundImage: settings.loginBackgroundUrl
            ? `url(${settings.loginBackgroundUrl})`
            : 'linear-gradient(135deg, #f0f4ff 0%, #fdf2f8 50%, #f0fdf4 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <ParticleBackground role="default" />
        {!settings.loginBackgroundUrl && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="wg1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c7d7ff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#3859ff" stopOpacity="0.35" />
              </linearGradient>
              <linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="wg3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#3406ff" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <path d="M0,0 C360,90 720,10 1080,70 C1260,100 1380,45 1440,20 L1440,0 Z" fill="url(#wg3)" />
            <path d="M0,300 C200,240 480,390 720,320 C960,250 1200,370 1440,300 L1440,450 C1200,510 960,390 720,450 C480,510 200,390 0,450 Z" fill="url(#wg1)" />
            <path d="M0,680 C300,620 600,750 900,690 C1100,650 1300,710 1440,680 L1440,900 L0,900 Z" fill="url(#wg2)" />
          </svg>
        )}
        
        {/* Abstract Tech Grid Background */}
        {!settings.loginBackgroundUrl && (
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjY2JkNWUxIiBmaWxsLW9wYWNpdHk9IjAuMiIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMCAwaDQwdjQwSDBWMHptMjAgMjBjNS41MjMgMCAxMC00LjQ3NyAxMC0xMHMtNC40NzctMTAtMTAtMTAtMTAgNC40NzctMTAgMTAgNC40NzcgMTAgMTAgMTB6Ii8+PC9nPjwvc3ZnPg==')] opacity-30 mix-blend-multiply pointer-events-none"></div>
        )}

        <div className="relative w-full max-w-6xl" style={{ zIndex: 1 }}>
          <div className="text-center mb-16 relative z-10">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.schoolName} className="h-20 w-auto mx-auto mb-6 object-contain filter drop-shadow-md transition-transform duration-500 hover:scale-105" />
            ) : (
              <div className="inline-block mb-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <GraduationCap className="text-white w-8 h-8" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 tracking-tight">
                    {settings.schoolName}
                  </h1>
                </div>
              </div>
            )}
            <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl mx-auto px-4 bg-white/40 backdrop-blur-sm rounded-full py-2 border border-white/50 shadow-sm inline-block">
              {settings.tagline}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {roleCards.map((card) => (
              <div
                key={card.role}
                onClick={() => handleRoleSelect(card.role)}
                className="group relative h-full rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
              >
                {/* Animated Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${card.gradient} rounded-3xl opacity-0 group-hover:opacity-40 blur-xl transition duration-500`}></div>
                
                {/* Glassmorphism Card */}
                <div className="relative h-full bg-white/70 backdrop-blur-xl border border-white/60 p-8 rounded-3xl flex flex-col items-center justify-center overflow-hidden z-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  
                  {/* Decorative Background Elements */}
                  <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${card.gradient} rounded-full opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
                  <div className={`absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br ${card.gradient} rounded-full opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-700 delay-100`}></div>
                  
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} blur-md opacity-30 rounded-full group-hover:scale-125 transition-transform duration-500`}></div>
                    <div className={`relative w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg border border-gray-100 transform transition-transform duration-500 group-hover:-translate-y-2`}>
                      <card.icon size={40} className={
                        card.role === 'admin' ? 'text-red-500' :
                        card.role === 'staff' ? 'text-emerald-500' :
                        'text-indigo-500'
                      } />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="text-center relative z-10 mb-8 flex-grow">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-colors duration-300">
                      {card.title}
                    </h3>
                    <p className="text-gray-500 font-medium leading-relaxed px-2">
                      {card.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="w-full relative z-10 mt-auto">
                    <div className="w-full py-3.5 rounded-xl bg-gray-50 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 group-hover:bg-white group-hover:shadow-md border border-gray-200 group-hover:border-transparent transition-all duration-300">
                      <span>Access Portal</span>
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${card.gradient} flex items-center justify-center transform transition-transform duration-300 group-hover:translate-x-1`}>
                        <ArrowLeft className="w-3 h-3 text-white rotate-180" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* <div className="mt-12 text-center">
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
          </div> */}
        </div>
      </div>
    );
  }

  const currentCard = roleCards.find(card => card.role === selectedRole);
  const RoleIcon = currentCard.icon;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fdf2f8 50%, #f0fdf4 100%)' }}>
      <ParticleBackground role={selectedRole} />
      <div className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden relative" style={{ zIndex: 1, maxWidth: '780px' }}>
        <div className="grid md:grid-cols-2">
          <div className="p-6 md:p-8">
            <button
              onClick={() => setSelectedRole('')}
              className="text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-2 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Role Selection</span>
            </button>

            <div className="mb-5">
              <div className={`w-12 h-12 mb-3 rounded-xl bg-gradient-to-br ${currentCard.gradient} flex items-center justify-center shadow-lg`}>
                <RoleIcon size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{currentCard.title}</h2>
              <p className="text-sm text-gray-600">Please enter your credentials to continue</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                <AlertTriangle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full pl-11 pr-12 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
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
                className={`w-full bg-gradient-to-r ${currentCard.gradient} text-white py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm`}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={() => setFormData({ email: `${selectedRole}@school.com`, password: `${selectedRole}123`, rememberMe: false })}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
              >
                Use Demo Credentials
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">Demo: {selectedRole}@school.com / {selectedRole}123</p>
            </div>
          </div>

          <div className={`hidden md:flex flex-col justify-center items-center p-8 bg-gradient-to-br ${currentCard.gradient} text-white relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full mt-[11.5vh]" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                <path fill="white" d="M0,200 Q100,100 200,200 T400,200 L400,400 L0,400 Z" />
                <circle cx="100" cy="100" r="80" fill="white" opacity="0.1" />
                <circle cx="350" cy="300" r="100" fill="white" opacity="0.1" />
              </svg>
            </div>
            <div className="relative z-10 text-center">
              <div className="mb-4">
                <RoleIcon size={52} className="mx-auto mb-3" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{settings.welcomeMessage}</h3>
              <p className="text-sm text-white/90 mb-5 max-w-xs">
                {currentCard.description}
              </p>
              <div className="space-y-2 text-left max-w-xs mx-auto">
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-lg p-2.5">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span className="text-sm">Secure & Fast Login</span>
                </div>
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-lg p-2.5">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  <span className="text-sm">Real-time Updates</span>
                </div>
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-lg p-2.5">
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
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