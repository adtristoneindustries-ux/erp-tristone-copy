import { useState, useEffect, useContext } from 'react';
import { Settings as SettingsIcon, Upload, Save, Image, Palette, Globe, Shield, CheckCircle, RotateCcw, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { SettingsContext } from '../context/SettingsContext';

const AdminSettings = () => {
  const { refreshSettings } = useContext(SettingsContext);
  const [formData, setFormData] = useState({
    schoolName: '',
    tagline: '',
    logoUrl: '',
    faviconUrl: '',
    address: '',
    email: '',
    phone: '',
    primaryColor: '#3B82F6',
    sidebarColor: '#2563EB',
    buttonColor: '#3B82F6',
    loginBackgroundUrl: '',
    welcomeMessage: '',
    enableStudentLogin: true,
    enableStaffLogin: true,
    enableNotifications: true,
    academicYear: '2024-2025'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('branding');
  const [dragActive, setDragActive] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setFormData(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleFileUpload = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(field, file);
    }
  };

  const processFile = (field, file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (field, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive({ ...dragActive, [field]: true });
    } else if (e.type === 'dragleave') {
      setDragActive({ ...dragActive, [field]: false });
    }
  };

  const handleDrop = (field, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({ ...dragActive, [field]: false });
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(field, e.dataTransfer.files[0]);
    }
  };

  const resetThemeColors = () => {
    setFormData({
      ...formData,
      primaryColor: '#3B82F6',
      sidebarColor: '#2563EB',
      buttonColor: '#3B82F6'
    });
  };

  const deleteImage = (field) => {
    setFormData({ ...formData, [field]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.put('/settings', formData);
      setMessage('Settings saved successfully!');
      await refreshSettings();
      setTimeout(() => {
        setMessage('');
        window.location.reload();
      }, 1500);
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Image },
    { id: 'school', label: 'School Info', icon: Globe },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'login', label: 'Login Page', icon: Shield },
    { id: 'access', label: 'Access Control', icon: CheckCircle }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <SettingsIcon size={28} className="text-gray-700 md:block hidden" />
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">System Settings</h1>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {message}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="flex border-b overflow-x-auto scrollbar-hide">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 font-semibold transition-colors whitespace-nowrap text-sm md:text-base ${
                      activeTab === id
                        ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} className="md:w-[18px] md:h-[18px]" />
                    {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="p-4 md:p-8">
                {activeTab === 'branding' && (
                  <div className="space-y-6">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Branding Settings</h2>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">School Logo</label>
                      <div
                        onDragEnter={(e) => handleDrag('logoUrl', e)}
                        onDragLeave={(e) => handleDrag('logoUrl', e)}
                        onDragOver={(e) => handleDrag('logoUrl', e)}
                        onDrop={(e) => handleDrop('logoUrl', e)}
                        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                          dragActive.logoUrl ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-4">
                          {formData.logoUrl && (
                            <div className="relative">
                              <img src={formData.logoUrl} alt="Logo" className="h-20 w-auto object-contain" />
                              <button
                                type="button"
                                onClick={() => deleteImage('logoUrl')}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                title="Delete logo"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                          <div className="text-center">
                            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">Drag and drop your logo here, or</p>
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors text-sm">
                              <span>Browse Files</span>
                              <input type="file" accept="image/*" onChange={(e) => handleFileUpload('logoUrl', e)} className="hidden" />
                            </label>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Recommended: 200x60px, PNG with transparent background</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Favicon</label>
                      <div
                        onDragEnter={(e) => handleDrag('faviconUrl', e)}
                        onDragLeave={(e) => handleDrag('faviconUrl', e)}
                        onDragOver={(e) => handleDrag('faviconUrl', e)}
                        onDrop={(e) => handleDrop('faviconUrl', e)}
                        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                          dragActive.faviconUrl ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-4">
                          {formData.faviconUrl && (
                            <div className="relative">
                              <img src={formData.faviconUrl} alt="Favicon" className="h-12 w-12 object-contain" />
                              <button
                                type="button"
                                onClick={() => deleteImage('faviconUrl')}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                title="Delete favicon"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                          <div className="text-center">
                            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">Drag and drop your favicon here, or</p>
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors text-sm">
                              <span>Browse Files</span>
                              <input type="file" accept="image/*" onChange={(e) => handleFileUpload('faviconUrl', e)} className="hidden" />
                            </label>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Recommended: 32x32px or 64x64px, ICO or PNG format</p>
                    </div>
                  </div>
                )}

                {activeTab === 'school' && (
                  <div className="space-y-6">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">School Information</h2>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">School Name</label>
                      <input
                        type="text"
                        value={formData.schoolName}
                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter school name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tagline</label>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter tagline"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter school address"
                        rows="3"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="school@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'theme' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-800">Theme Settings</h2>
                      <button
                        type="button"
                        onClick={resetThemeColors}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        <RotateCcw size={16} />
                        <span>Reset to Default</span>
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Sidebar Color</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={formData.sidebarColor}
                          onChange={(e) => setFormData({ ...formData, sidebarColor: e.target.value })}
                          className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.sidebarColor}
                          onChange={(e) => setFormData({ ...formData, sidebarColor: e.target.value })}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Button Color</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={formData.buttonColor}
                          onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                          className="h-12 w-20 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.buttonColor}
                          onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'login' && (
                  <div className="space-y-6">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">Login Page Settings</h2>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Login Background Image</label>
                      <div
                        onDragEnter={(e) => handleDrag('loginBackgroundUrl', e)}
                        onDragLeave={(e) => handleDrag('loginBackgroundUrl', e)}
                        onDragOver={(e) => handleDrag('loginBackgroundUrl', e)}
                        onDrop={(e) => handleDrop('loginBackgroundUrl', e)}
                        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                          dragActive.loginBackgroundUrl ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-4">
                          {formData.loginBackgroundUrl && (
                            <img src={formData.loginBackgroundUrl} alt="Background" className="h-32 w-48 object-cover rounded-lg" />
                          )}
                          <div className="text-center">
                            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">Drag and drop your background image here, or</p>
                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors text-sm">
                              <span>Browse Files</span>
                              <input type="file" accept="image/*" onChange={(e) => handleFileUpload('loginBackgroundUrl', e)} className="hidden" />
                            </label>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Recommended: 1920x1080px for best quality</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Welcome Message</label>
                      <input
                        type="text"
                        value={formData.welcomeMessage}
                        onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Welcome Back!"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'access' && (
                  <div className="space-y-6">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">System Access Controls</h2>
                    
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={formData.enableStudentLogin}
                          onChange={(e) => setFormData({ ...formData, enableStudentLogin: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">Enable Student Login</p>
                          <p className="text-sm text-gray-600">Allow students to access the system</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={formData.enableStaffLogin}
                          onChange={(e) => setFormData({ ...formData, enableStaffLogin: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">Enable Staff Login</p>
                          <p className="text-sm text-gray-600">Allow staff members to access the system</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={formData.enableNotifications}
                          onChange={(e) => setFormData({ ...formData, enableNotifications: e.target.checked })}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">Enable Notifications</p>
                          <p className="text-sm text-gray-600">Send system notifications to users</p>
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Year</label>
                      <select
                        value={formData.academicYear}
                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="2023-2024">2023-2024</option>
                        <option value="2024-2025">2024-2025</option>
                        <option value="2025-2026">2025-2026</option>
                        <option value="2026-2027">2026-2027</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="mt-6 md:mt-8 pt-6 border-t">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 font-semibold"
                  >
                    <Save size={20} />
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
