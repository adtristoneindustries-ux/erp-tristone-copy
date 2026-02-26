import { useState, useEffect, useContext } from 'react';
  import { User, Mail, Phone, MapPin, BookOpen, Award, Calendar, FileText, Image as ImageIcon, Eye } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { userAPI } from '../services/api';

const StaffProfile = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    if (!user?._id) {
      setProfileData(user);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await userAPI.getUser(user._id);
      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setProfileData(user); // Fallback to user from context
    } finally {
      setLoading(false);
    }
  };

  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: BookOpen },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  const openDocumentViewer = (doc) => {
    setViewingDocument(doc);
    setDocumentViewerOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Navbar />
          <div className="p-4 lg:p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profile = profileData || user;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <h1 className="text-2xl font-bold mb-6">My Profile</h1>

          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                {profile?.passportPhoto ? (
                  <img
                    src={`data:${profile.passportPhoto.contentType};base64,${profile.passportPhoto.data}`}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-blue-600" />
                )}
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900">{profile?.name || 'N/A'}</h2>
                <p className="text-lg text-gray-600 mb-2">{profile?.role || 'Staff Member'} • {profile?.department || 'N/A'}</p>
                {profile?.staffId && <p className="text-sm text-gray-500">Staff ID: {profile.staffId}</p>}
                <div className="flex flex-col md:flex-row gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>{profile?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} />
                    <span>{profile?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex border-b overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === 'personal' && (
              <div>
                <h3 className="text-xl font-bold mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        {profile?.name || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        {profile?.email || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        {profile?.phone || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Staff ID</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        {profile?.staffId || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        {profile?.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        {profile?.gender || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    {profile?.address || 'N/A'}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'professional' && (
              <div>
                <h3 className="text-xl font-bold mb-6">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Staff ID</label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      {profile?.staffId || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      {profile?.role || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      {profile?.department || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      {profile?.qualification || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      {profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        profile?.status === 'Active' ? 'bg-green-100 text-green-800' :
                        profile?.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {profile?.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                    Passport Photo
                  </h4>
                  {profile?.passportPhoto ? (
                    <div className="flex items-center gap-6">
                      <img 
                        src={`data:${profile.passportPhoto.contentType};base64,${profile.passportPhoto.data}`}
                        alt="Passport Photo" 
                        className="w-32 h-32 object-cover rounded-xl border-4 border-white shadow-lg cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => openDocumentViewer({
                          ...profile.passportPhoto,
                          name: 'Passport Photo',
                          type: 'passport'
                        })}
                      />
                      <div className="bg-white p-4 rounded-lg shadow-sm flex-1">
                        <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Filename:</span> {profile.passportPhoto.filename}</p>
                        <p className="text-sm text-gray-600"><span className="font-medium">Upload Date:</span> {new Date(profile.passportPhoto.uploadDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 italic">No passport photo uploaded</p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    Official Documents
                  </h4>
                  {profile?.documents && profile.documents.length > 0 ? (
                    <div className="space-y-4">
                      {profile.documents.map((doc, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 cursor-pointer" onClick={() => openDocumentViewer(doc)}>
                              {doc.contentType.startsWith('image/') ? (
                                <img 
                                  src={`data:${doc.contentType};base64,${doc.data}`}
                                  alt={doc.name} 
                                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-red-50 rounded-lg border-2 border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors">
                                  <FileText className="w-10 h-10 text-red-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-800 mb-1">{doc.name}</h5>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                                  {doc.type.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                                <span>Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openDocumentViewer(doc)}
                                className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                              >
                                <Eye size={14} /> View
                              </button>
                              <button 
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = `data:${doc.contentType};base64,${doc.data}`;
                                  link.download = doc.name;
                                  link.click();
                                }}
                                className="px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No documents uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* View-Only Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <User size={16} className="text-blue-600" />
              <p className="text-blue-800 text-sm font-medium">
                This profile is view-only. Contact the administrator to update your information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {documentViewerOpen && viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{viewingDocument.name}</h3>
                <p className="text-sm text-gray-600">
                  {viewingDocument.type !== 'passport' && (
                    <span className="capitalize">{viewingDocument.type.replace(/([A-Z])/g, ' $1').trim()} • </span>
                  )}
                  {viewingDocument.contentType}
                </p>
              </div>
              <button 
                onClick={() => setDocumentViewerOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-all"
              >
                ✕
              </button>
            </div>
            <div className="p-4 max-h-[calc(95vh-180px)] overflow-auto">
              {viewingDocument.contentType.startsWith('image/') ? (
                <div className="flex justify-center">
                  <img 
                    src={`data:${viewingDocument.contentType};base64,${viewingDocument.data}`}
                    alt={viewingDocument.name}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                </div>
              ) : viewingDocument.contentType === 'application/pdf' ? (
                <div className="w-full h-[600px]">
                  <iframe
                    src={`data:${viewingDocument.contentType};base64,${viewingDocument.data}`}
                    className="w-full h-full border rounded-lg"
                    title={viewingDocument.name}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Cannot preview this file type</p>
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `data:${viewingDocument.contentType};base64,${viewingDocument.data}`;
                      link.download = viewingDocument.name;
                      link.click();
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-4 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                {viewingDocument.size && (
                  <span>Size: {(viewingDocument.size / 1024 / 1024).toFixed(2)} MB</span>
                )}
                {viewingDocument.uploadDate && (
                  <span className={viewingDocument.size ? 'ml-4' : ''}>Uploaded: {new Date(viewingDocument.uploadDate).toLocaleDateString()}</span>
                )}
              </div>
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `data:${viewingDocument.contentType};base64,${viewingDocument.data}`;
                  link.download = viewingDocument.name;
                  link.click();
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffProfile;