import { useState, useEffect, useContext } from 'react';
import { User, Mail, Phone, Edit2, Save, X, MapPin, Briefcase, Calendar, CreditCard, Heart, FileText, Eye } from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [errors, setErrors] = useState({});
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);

  useEffect(() => {
    fetchProfileData();
    
    if (socket) {
      socket.on('staffUpdate', (data) => {
        if (data.staffId === user?._id) {
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
  }, [user?._id, socket]);

  const fetchProfileData = async () => {
    if (!user?._id) {
      setProfileData(user);
      setEditData(user);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await userAPI.getUser(user._id);
      setProfileData(response.data);
      setEditData(response.data);
    } catch (error) {
      console.error('Error:', error);
      setProfileData(user);
      setEditData(user);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!editData.name) newErrors.name = 'Name is required';
    if (!editData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(editData.email)) newErrors.email = 'Invalid email';
    if (editData.phone && !/^\d{10}$/.test(editData.phone)) newErrors.phone = 'Must be 10 digits';
    if (editData.aadhaarNumber && !/^\d{12}$/.test(editData.aadhaarNumber)) newErrors.aadhaarNumber = 'Must be 12 digits';
    if (editData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(editData.panNumber)) newErrors.panNumber = 'Invalid PAN';
    if (editData.pincode && !/^\d{6}$/.test(editData.pincode)) newErrors.pincode = 'Must be 6 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await userAPI.updateUser(user._id, editData);
      setProfileData(response.data);
      setUser(response.data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const Field = ({ label, value, name, type = 'text', editable = true, options = null }) => (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {isEditing && editable ? (
        options ? (
          <select name={name} value={value || ''} onChange={handleChange} className="w-full p-2 border rounded-lg text-sm">
            <option value="">Select</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : type === 'textarea' ? (
          <textarea name={name} value={value || ''} onChange={handleChange} rows="2" className="w-full p-2 border rounded-lg text-sm" />
        ) : (
          <input type={type} name={name} value={value || ''} onChange={handleChange} className="w-full p-2 border rounded-lg text-sm" maxLength={name === 'phone' || name === 'alternateContact' || name === 'emergencyContactNumber' ? '10' : name === 'aadhaarNumber' ? '12' : name === 'panNumber' ? '10' : name === 'pincode' ? '6' : undefined} />
        )
      ) : (
        <p className="text-sm font-medium text-gray-900">{value || 'Not provided'}</p>
      )}
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  if (loading && !profileData) {
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

  const profile = isEditing ? editData : profileData;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 mb-6 text-white">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                  {profile?.passportPhoto ? (
                    <img src={`data:${profile.passportPhoto.contentType};base64,${profile.passportPhoto.data}`} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                  ) : (
                    <User size={48} className="text-blue-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{profile?.name || 'Staff Member'}</h1>
                  <p className="text-blue-100 text-lg mb-1">{profile?.designation || profile?.role} • {profile?.department}</p>
                  <p className="text-blue-200 text-sm">Staff ID: {profile?.staffId || 'N/A'}</p>
                </div>
              </div>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 flex items-center gap-2">
                  <Edit2 size={18} /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setIsEditing(false); setEditData(profileData); setErrors({}); }} className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 flex items-center gap-2">
                    <X size={18} /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={loading} className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 flex items-center gap-2 disabled:opacity-50">
                    <Save size={18} /> {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Mail className="text-blue-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">{profile?.email || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Phone className="text-green-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{profile?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Calendar className="text-purple-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Joining Date</p>
                  <p className="text-sm font-medium">{profile?.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center gap-3">
                <Briefcase className="text-orange-600" size={24} />
                <div>
                  <p className="text-xs text-gray-500">Experience</p>
                  <p className="text-sm font-medium">{profile?.yearsOfExperience ? `${profile.yearsOfExperience} years` : 'N/A'}</p>
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
                  <Field label="Full Name" value={profile?.name} name="name" />
                  <Field label="Email" value={profile?.email} name="email" type="email" />
                  <Field label="Phone" value={profile?.phone} name="phone" />
                  <Field label="Date of Birth" value={profile?.dateOfBirth?.split('T')[0]} name="dateOfBirth" type="date" />
                  <Field label="Gender" value={profile?.gender} name="gender" options={['Male', 'Female', 'Other']} />
                  <Field label="Blood Group" value={profile?.bloodGroup} name="bloodGroup" options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} />
                  <Field label="Aadhaar Number" value={profile?.aadhaarNumber} name="aadhaarNumber" />
                  <Field label="PAN Number" value={profile?.panNumber} name="panNumber" />
                  <Field label="Marital Status" value={profile?.maritalStatus} name="maritalStatus" options={['Single', 'Married', 'Divorced', 'Widowed']} />
                  <Field label="Nationality" value={profile?.nationality} name="nationality" />
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Briefcase className="text-blue-600" size={20} />
                  Professional Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Staff ID" value={profile?.staffId} name="staffId" editable={false} />
                  <Field label="Department" value={profile?.department} name="department" options={['Mathematics', 'Science', 'English', 'Admin', 'Accounts', 'Library']} />
                  <Field label="Designation" value={profile?.designation} name="designation" options={['Teacher', 'HOD', 'Principal', 'Clerk', 'Accountant']} />
                  <Field label="Qualification" value={profile?.qualification} name="qualification" />
                  <Field label="Date of Joining" value={profile?.dateOfJoining?.split('T')[0]} name="dateOfJoining" type="date" />
                  <Field label="Years of Experience" value={profile?.yearsOfExperience} name="yearsOfExperience" type="number" />
                  <Field label="Previous Institution" value={profile?.previousInstitution} name="previousInstitution" />
                  <Field label="Specialization" value={profile?.specialization} name="specialization" />
                </div>
              </div>

              {/* Contact & Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MapPin className="text-blue-600" size={20} />
                  Contact & Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Alternate Contact" value={profile?.alternateContact} name="alternateContact" />
                  <Field label="Emergency Contact Name" value={profile?.emergencyContactName} name="emergencyContactName" />
                  <Field label="Emergency Contact Number" value={profile?.emergencyContactNumber} name="emergencyContactNumber" />
                  <div className="md:col-span-2">
                    <Field label="Permanent Address" value={profile?.permanentAddress} name="permanentAddress" type="textarea" />
                  </div>
                  <div className="md:col-span-2">
                    <Field label="Current Address" value={profile?.currentAddress} name="currentAddress" type="textarea" />
                  </div>
                  <Field label="City" value={profile?.city} name="city" />
                  <Field label="State" value={profile?.state} name="state" />
                  <Field label="Pincode" value={profile?.pincode} name="pincode" />
                  <Field label="Country" value={profile?.country} name="country" />
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
                    <p className="text-lg font-bold text-green-600">{profile?.basicSalary ? `₹${profile.basicSalary}` : 'N/A'}</p>
                  </div>
                  <Field label="Bank Name" value={profile?.bankName} name="bankName" />
                  <Field label="Account Number" value={profile?.salaryAccountNumber} name="salaryAccountNumber" />
                  <Field label="IFSC Code" value={profile?.ifscCode} name="ifscCode" />
                  <Field label="Branch" value={profile?.branchName} name="branchName" />
                </div>
              </div>

              {/* Medical Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Heart className="text-blue-600" size={20} />
                  Medical Information
                </h2>
                <div className="space-y-4">
                  <Field label="Medical Conditions" value={profile?.medicalConditions} name="medicalConditions" type="textarea" />
                  <Field label="Health Insurance" value={profile?.healthInsurance} name="healthInsurance" />
                  {profile?.disability && (
                    <Field label="Disability Details" value={profile?.disabilityDetails} name="disabilityDetails" type="textarea" />
                  )}
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FileText className="text-blue-600" size={20} />
                  Documents
                </h2>
                {profile?.documents && profile.documents.length > 0 ? (
                  <div className="space-y-2">
                    {profile.documents.map((doc, idx) => (
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
