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
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);

  // Use user data immediately if available
  const displayData = profileData || user;

  useEffect(() => {
    const initializeProfile = async () => {
      if (user) {
        // Set initial data immediately to prevent blinking
        setProfileData(user);
        setLoading(false);
        
        // Then fetch updated data in background
        if (user._id || user.id) {
          try {
            const userId = user._id || user.id;
            const response = await userAPI.getUser(userId);
            if (response.data && response.data.data) {
              setProfileData(response.data.data);
              if (setUser) {
                setUser(response.data.data);
              }
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
            // Keep using initial user data on error
          }
        }
      } else {
        setLoading(false);
      }
    };

    initializeProfile();
    
    if (socket) {
      socket.on('staffUpdate', (data) => {
        if (data.staffId === (user?._id || user?.id)) {
          setProfileData(data.updatedData);
          if (setUser) {
            setUser(data.updatedData);
          }
        }
      });
    }
    
    return () => {
      if (socket) {
        socket.off('staffUpdate');
      }
    };
  }, [user?._id, socket]);

  const Field = ({ label, value }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <p className="text-sm font-medium text-gray-900">{value || 'Not provided'}</p>
    </div>
  );

  // Show loading only if we have no data at all
  if (loading && !displayData) {
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

  // If no data available at all, show error
  if (!displayData) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Navbar />
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-gray-600">Unable to load profile data. Please try refreshing the page.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Refresh Page
              </button>
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
                {displayData?.passportPhoto?.data && displayData?.passportPhoto?.contentType ? (
                  <img src={`data:${displayData.passportPhoto.contentType};base64,${displayData.passportPhoto.data}`} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <User size={48} className="text-blue-600" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{displayData?.name || 'Staff Member'}</h1>
                <p className="text-blue-100 text-lg mb-1">{displayData?.designation || displayData?.role || 'Staff'} • {displayData?.department || 'N/A'}</p>
                <p className="text-blue-200 text-sm">Staff ID: {displayData?.staffId || 'N/A'}</p>
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
                  <p className="text-sm font-medium">{displayData?.email || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Phone className="text-green-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{displayData?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Calendar className="text-purple-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Joining Date</p>
                  <p className="text-sm font-medium">{displayData?.joiningDate ? new Date(displayData.joiningDate).toLocaleDateString() : (displayData?.dateOfJoining ? new Date(displayData.dateOfJoining).toLocaleDateString() : 'N/A')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Briefcase className="text-orange-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Experience</p>
                  <p className="text-sm font-medium">{displayData?.yearsOfExperience ? `${displayData.yearsOfExperience} years` : 'N/A'}</p>
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
                  <Field label="Full Name" value={displayData?.name || displayData?.fullName} />
                  <Field label="Email" value={displayData?.email} />
                  <Field label="Phone" value={displayData?.phone} />
                  <Field label="Date of Birth" value={displayData?.dob ? new Date(displayData.dob).toLocaleDateString() : (displayData?.dateOfBirth ? new Date(displayData.dateOfBirth).toLocaleDateString() : null)} />
                  <Field label="Gender" value={displayData?.gender} />
                  <Field label="Blood Group" value={displayData?.bloodGroup} />
                  <Field label="Aadhaar Number" value={displayData?.aadhaarNumber} />
                  <Field label="PAN Number" value={displayData?.panNumber} />
                  <Field label="Marital Status" value={displayData?.maritalStatus} />
                  <Field label="Nationality" value={displayData?.nationality} />
                  <Field label="Religion" value={displayData?.religion} />
                  <Field label="Caste Category" value={displayData?.casteCategory} />
                  <Field label="Identification Mark 1" value={displayData?.identificationMark1} />
                  <Field label="Identification Mark 2" value={displayData?.identificationMark2} />
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Briefcase className="text-blue-600" size={20} />
                  Professional Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Staff ID" value={displayData?.staffId} />
                  <Field label="Employee Code" value={displayData?.employeeCode} />
                  <Field label="Department" value={displayData?.department} />
                  <Field label="Designation" value={displayData?.designation} />
                  <Field label="Employment Type" value={displayData?.employmentType} />
                  <Field label="Qualification" value={displayData?.qualification} />
                  <Field label="Date of Joining" value={displayData?.joiningDate ? new Date(displayData.joiningDate).toLocaleDateString() : (displayData?.dateOfJoining ? new Date(displayData.dateOfJoining).toLocaleDateString() : null)} />
                  <Field label="Years of Experience" value={displayData?.yearsOfExperience} />
                  <Field label="Previous Institution" value={displayData?.previousInstitution} />
                  <Field label="Specialization" value={displayData?.specialization} />
                  <Field label="Employee Status" value={displayData?.status || displayData?.employeeStatus} />
                </div>
              </div>

              {/* Payroll Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="text-blue-600" size={20} />
                  Salary & Payroll
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Basic Salary" value={displayData?.basicSalary ? `₹${displayData.basicSalary}` : null} />
                  <Field label="Allowances" value={displayData?.allowances ? `₹${displayData.allowances}` : null} />
                  <Field label="PF Number" value={displayData?.pfNumber} />
                  <Field label="ESI Number" value={displayData?.esiNumber} />
                  <Field label="UAN Number" value={displayData?.uanNumber} />
                  <div className="md:col-span-2">
                    <Field label="Tax Deduction Details" value={displayData?.taxDeduction} />
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
                  <Field label="Alternate Contact" value={displayData?.alternateContact} />
                  <Field label="Emergency Contact Name" value={displayData?.emergencyContactName} />
                  <Field label="Emergency Contact Number" value={displayData?.emergencyContactNumber} />
                  <div className="md:col-span-2">
                    <Field label="Permanent Address" value={displayData?.permanentAddress || displayData?.address} />
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Current Address" value={displayData?.currentAddress} />
                  </div>
                  <Field label="City" value={displayData?.city} />
                  <Field label="State" value={displayData?.state} />
                  <Field label="Pincode" value={displayData?.pincode} />
                  <Field label="Country" value={displayData?.country} />
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
                    <p className="text-lg font-bold text-green-600">{displayData?.basicSalary ? `₹${displayData.basicSalary}` : 'N/A'}</p>
                  </div>
                  <Field label="Bank Name" value={displayData?.bankName} />
                  <Field label="Account Number" value={displayData?.salaryAccountNumber} />
                  <Field label="IFSC Code" value={displayData?.ifscCode} />
                  <Field label="Branch" value={displayData?.branchName} />
                </div>
              </div>

              {/* Medical Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Heart className="text-blue-600" size={20} />
                  Medical Information
                </h2>
                <div className="space-y-4">
                  <Field label="Medical Conditions" value={displayData?.medicalConditions} />
                  <Field label="Health Insurance" value={displayData?.healthInsurance} />
                  <Field label="Emergency Medical Contact" value={displayData?.emergencyMedicalContact} />
                  {displayData?.disability && (
                    <Field label="Disability Details" value={displayData?.disabilityDetails} />
                  )}
                </div>
              </div>

              {/* Accommodation */}
              {displayData?.accommodationRequired && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <MapPin className="text-blue-600" size={20} />
                    Accommodation Details
                  </h2>
                  <div className="space-y-4">
                    <Field label="Room Number" value={displayData?.accommodationRoomNumber} />
                    <Field label="Block" value={displayData?.accommodationBlock} />
                    <Field label="Warden Name" value={displayData?.accommodationWardenName} />
                  </div>
                </div>
              )}

              {/* Documents */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FileText className="text-blue-600" size={20} />
                  Documents
                </h2>
                {displayData?.documents && displayData.documents.length > 0 ? (
                  <div className="space-y-2">
                    {displayData.documents.map((doc, idx) => (
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
