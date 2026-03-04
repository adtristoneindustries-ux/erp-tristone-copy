import { useState, useEffect, useContext } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, CreditCard, Heart, FileText, Eye, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { userAPI } from '../services/api';

const StaffProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [profileData, setProfileData] = useState(user);
  const [loading, setLoading] = useState(false);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);

  useEffect(() => {
    console.log('StaffProfile mounted, user:', user);
    if (user?._id || user?.id) {
      fetchProfileData();
    } else {
      console.log('No user ID found in context');
    }
    
    if (socket) {
      socket.on('staffUpdate', (data) => {
        console.log('Staff update received:', data);
        if (data.staffId === (user?._id || user?.id)) {
          console.log('Updating profile with:', data.updatedData);
          setProfileData(data.updatedData);
          setUser(data.updatedData);
        }
      });
    }
    
    return () => {
      if (socket) {
        socket.off('staffUpdate');
      }
    };
  }, [user?._id, user?.id, socket]);

  const fetchProfileData = async () => {
    const userId = user?._id || user?.id;
    if (!userId) {
      console.log('No user ID found, user:', user);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching profile for user ID:', userId);
      const response = await userAPI.getUser(userId);
      console.log('Profile data received:', response.data);
      
      // Update both profileData and user context
      setProfileData(response.data);
      if (setUser) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      console.log('Falling back to user context data:', user);
      setProfileData(user);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, value }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <p className="text-sm font-medium text-gray-900">{value || 'Not provided'}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Navbar />
          <div className="p-6 flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Navbar />
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-gray-600">Unable to load profile data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 mb-6 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                {profileData?.passportPhoto?.data && profileData?.passportPhoto?.contentType ? (
                  <img src={`data:${profileData.passportPhoto.contentType};base64,${profileData.passportPhoto.data}`} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <User size={48} className="text-blue-600" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{profileData?.name || 'Staff Member'}</h1>
                <p className="text-blue-100 text-lg mb-1">{profileData?.designation || profileData?.role || 'Staff'} • {profileData?.department || 'N/A'}</p>
                <p className="text-blue-200 text-sm">Staff ID: {profileData?.staffId || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Mail className="text-blue-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">{profileData?.email || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Phone className="text-green-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{profileData?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Calendar className="text-purple-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Joining Date</p>
                  <p className="text-sm font-medium">{profileData?.joiningDate ? new Date(profileData.joiningDate).toLocaleDateString() : (profileData?.dateOfJoining ? new Date(profileData.dateOfJoining).toLocaleDateString() : 'N/A')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Briefcase className="text-orange-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Experience</p>
                  <p className="text-sm font-medium">{profileData?.yearsOfExperience ? `${profileData.yearsOfExperience} years` : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <User className="text-blue-600" size={20} />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Full Name" value={profileData?.name || profileData?.fullName} />
                  <Field label="Email" value={profileData?.email} />
                  <Field label="Phone" value={profileData?.phone} />
                  <Field label="Date of Birth" value={profileData?.dob ? new Date(profileData.dob).toLocaleDateString() : (profileData?.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString() : null)} />
                  <Field label="Gender" value={profileData?.gender} />
                  <Field label="Blood Group" value={profileData?.bloodGroup} />
                  <Field label="Aadhaar Number" value={profileData?.aadhaarNumber} />
                  <Field label="PAN Number" value={profileData?.panNumber} />
                  <Field label="Marital Status" value={profileData?.maritalStatus} />
                  <Field label="Nationality" value={profileData?.nationality} />
                  <Field label="Religion" value={profileData?.religion} />
                  <Field label="Caste Category" value={profileData?.casteCategory} />
                  <Field label="Identification Mark 1" value={profileData?.identificationMark1} />
                  <Field label="Identification Mark 2" value={profileData?.identificationMark2} />
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Briefcase className="text-blue-600" size={20} />
                  Professional Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Staff ID" value={profileData?.staffId} />
                  <Field label="Employee Code" value={profileData?.employeeCode} />
                  <Field label="Department" value={profileData?.department} />
                  <Field label="Designation" value={profileData?.designation} />
                  <Field label="Employment Type" value={profileData?.employmentType} />
                  <Field label="Qualification" value={profileData?.qualification} />
                  <Field label="Date of Joining" value={profileData?.joiningDate ? new Date(profileData.joiningDate).toLocaleDateString() : (profileData?.dateOfJoining ? new Date(profileData.dateOfJoining).toLocaleDateString() : null)} />
                  <Field label="Years of Experience" value={profileData?.yearsOfExperience} />
                  <Field label="Previous Institution" value={profileData?.previousInstitution} />
                  <Field label="Specialization" value={profileData?.specialization} />
                  <Field label="Employee Status" value={profileData?.status || profileData?.employeeStatus} />
                </div>
              </div>

              {/* Payroll Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="text-blue-600" size={20} />
                  Salary & Payroll
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Basic Salary" value={profileData?.basicSalary ? `₹${profileData.basicSalary}` : null} />
                  <Field label="Allowances" value={profileData?.allowances ? `₹${profileData.allowances}` : null} />
                  <Field label="PF Number" value={profileData?.pfNumber} />
                  <Field label="ESI Number" value={profileData?.esiNumber} />
                  <Field label="UAN Number" value={profileData?.uanNumber} />
                  <div className="md:col-span-2">
                    <Field label="Tax Deduction Details" value={profileData?.taxDeduction} />
                  </div>
                </div>
              </div>

              {/* Contact & Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MapPin className="text-blue-600" size={20} />
                  Contact & Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Alternate Contact" value={profileData?.alternateContact} />
                  <Field label="Emergency Contact Name" value={profileData?.emergencyContactName} />
                  <Field label="Emergency Contact Number" value={profileData?.emergencyContactNumber} />
                  <div className="md:col-span-2">
                    <Field label="Permanent Address" value={profileData?.permanentAddress || profileData?.address} />
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Current Address" value={profileData?.currentAddress} />
                  </div>
                  <Field label="City" value={profileData?.city} />
                  <Field label="State" value={profileData?.state} />
                  <Field label="Pincode" value={profileData?.pincode} />
                  <Field label="Country" value={profileData?.country} />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Bank Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="text-blue-600" size={20} />
                  Bank Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">Basic Salary</p>
                    <p className="text-lg font-bold text-green-600">{profileData?.basicSalary ? `₹${profileData.basicSalary}` : 'N/A'}</p>
                  </div>
                  <Field label="Bank Name" value={profileData?.bankName} />
                  <Field label="Account Number" value={profileData?.salaryAccountNumber} />
                  <Field label="IFSC Code" value={profileData?.ifscCode} />
                  <Field label="Branch" value={profileData?.branchName} />
                </div>
              </div>

              {/* Medical Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Heart className="text-blue-600" size={20} />
                  Medical Information
                </h2>
                <div className="space-y-4">
                  <Field label="Medical Conditions" value={profileData?.medicalConditions} />
                  <Field label="Health Insurance" value={profileData?.healthInsurance} />
                  <Field label="Emergency Medical Contact" value={profileData?.emergencyMedicalContact} />
                  {profileData?.disability && (
                    <Field label="Disability Details" value={profileData?.disabilityDetails} />
                  )}
                </div>
              </div>

              {/* Accommodation */}
              {profileData?.accommodationRequired && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <MapPin className="text-blue-600" size={20} />
                    Accommodation Details
                  </h2>
                  <div className="space-y-4">
                    <Field label="Room Number" value={profileData?.accommodationRoomNumber} />
                    <Field label="Block" value={profileData?.accommodationBlock} />
                    <Field label="Warden Name" value={profileData?.accommodationWardenName} />
                  </div>
                </div>
              )}

              {/* Documents */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FileText className="text-blue-600" size={20} />
                  Documents
                </h2>
                {profileData?.documents && profileData.documents.length > 0 ? (
                  <div className="space-y-2">
                    {profileData.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-gray-600" />
                          <span className="text-sm truncate">{doc.name}</span>
                        </div>
                        <button onClick={() => { setViewingDocument(doc); setDocumentViewerOpen(true); }} className="text-blue-600 hover:text-blue-700">
                          <Eye size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No documents uploaded</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {documentViewerOpen && viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">{viewingDocument.name}</h3>
              <button onClick={() => setDocumentViewerOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 max-h-[calc(95vh-120px)] overflow-auto">
              {viewingDocument.contentType.startsWith('image/') ? (
                <img src={`data:${viewingDocument.contentType};base64,${viewingDocument.data}`} alt={viewingDocument.name} className="max-w-full mx-auto" />
              ) : viewingDocument.contentType === 'application/pdf' ? (
                <iframe src={`data:${viewingDocument.contentType};base64,${viewingDocument.data}`} className="w-full h-[600px]" title={viewingDocument.name} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">Cannot preview this file type</p>
                  <button onClick={() => {
                    const link = document.createElement('a');
                    link.href = `data:${viewingDocument.contentType};base64,${viewingDocument.data}`;
                    link.download = viewingDocument.name;
                    link.click();
                  }} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Download</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffProfile;
