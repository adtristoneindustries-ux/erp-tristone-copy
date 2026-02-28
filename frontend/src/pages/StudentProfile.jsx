import { useState, useEffect, useContext } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Users, Heart, Droplet, BookOpen, Award } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { userAPI } from '../services/api';

const StudentProfile = () => {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await userAPI.getUserById(user?.id);
      const data = res.data;
      if (data.dateOfBirth) {
        data.dateOfBirth = new Date(data.dateOfBirth).toISOString().split('T')[0];
      }
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold">Student Profile</h1>
            </div>

            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden bg-gray-200 border-4 border-blue-500">
                {profileData?.profilePicture ? (
                  <img src={profileData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={64} className="text-gray-400" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold mt-4">{profileData?.name || 'Student Name'}</h2>
              <p className="text-gray-600">{profileData?.rollNumber || 'Roll Number'}</p>
              <p className="text-sm text-gray-500">Class {profileData?.class} - Section {profileData?.section}</p>
            </div>

            {/* Student Information */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-blue-600 flex items-center gap-2">
                <User size={24} />
                Basic Student Information
              </h3>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InfoField
                    label="Full Name"
                    value={profileData?.name}
                    icon={User}
                  />
                  <InfoField
                    label="Date of Birth"
                    value={profileData?.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString('en-IN') : 'N/A'}
                    icon={Calendar}
                  />
                  <InfoField
                    label="Gender"
                    value={profileData?.gender}
                    icon={Users}
                  />
                  <InfoField
                    label="Blood Group"
                    value={profileData?.bloodGroup}
                    icon={Droplet}
                  />
                  <InfoField
                    label="Aadhaar Number"
                    value={profileData?.aadhaarNumber}
                    icon={Award}
                  />
                  <InfoField
                    label="EMIS Number"
                    value={profileData?.emisNumber}
                    icon={Award}
                  />
                  <InfoField
                    label="Nationality"
                    value={profileData?.nationality}
                    icon={Users}
                  />
                  <InfoField
                    label="Religion"
                    value={profileData?.religion}
                    icon={Heart}
                  />
                  <InfoField
                    label="Caste Category"
                    value={profileData?.casteCategory}
                    icon={Award}
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-green-600 flex items-center gap-2">
                <BookOpen size={24} />
                Academic Information
              </h3>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InfoField
                    label="Class"
                    value={profileData?.class}
                    icon={BookOpen}
                  />
                  <InfoField
                    label="Section"
                    value={profileData?.section}
                    icon={BookOpen}
                  />
                  <InfoField
                    label="Roll Number"
                    value={profileData?.rollNumber}
                    icon={Award}
                  />
                  <InfoField
                    label="Admission Number"
                    value={profileData?.admissionNumber}
                    icon={Award}
                  />
                  <InfoField
                    label="Admission Date"
                    value={profileData?.admissionDate ? new Date(profileData.admissionDate).toLocaleDateString('en-IN') : 'N/A'}
                    icon={Calendar}
                  />
                  <InfoField
                    label="Previous School"
                    value={profileData?.previousSchool}
                    icon={BookOpen}
                  />
                  <InfoField
                    label="Previous Class"
                    value={profileData?.previousClass}
                    icon={BookOpen}
                  />
                  <InfoField
                    label="Medium of Instruction"
                    value={profileData?.mediumOfInstruction}
                    icon={BookOpen}
                  />
                  <InfoField
                    label="Second Language"
                    value={profileData?.secondLanguage}
                    icon={BookOpen}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-purple-600 flex items-center gap-2">
                <Phone size={24} />
                Contact Information
              </h3>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField
                    label="Phone"
                    value={profileData?.phone}
                    icon={Phone}
                  />
                  <InfoField
                    label="Email"
                    value={profileData?.email}
                    icon={Mail}
                  />
                  <InfoField
                    label="Emergency Contact"
                    value={profileData?.emergencyContact}
                    icon={Phone}
                  />
                </div>
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-yellow-600 flex items-center gap-2">
                <Users size={24} />
                Parent/Guardian Information
              </h3>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4 text-lg border-b pb-2">Father's Details</h4>
                    <div className="space-y-3">
                      <InfoField
                        label="Father's Name"
                        value={profileData?.fatherName}
                        icon={User}
                      />
                      <InfoField
                        label="Father's Occupation"
                        value={profileData?.fatherOccupation}
                        icon={Award}
                      />
                      <InfoField
                        label="Contact Number"
                        value={profileData?.fatherPhone}
                        icon={Phone}
                      />
                      <InfoField
                        label="Email"
                        value={profileData?.fatherEmail}
                        icon={Mail}
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4 text-lg border-b pb-2">Mother's Details</h4>
                    <div className="space-y-3">
                      <InfoField
                        label="Mother's Name"
                        value={profileData?.motherName}
                        icon={User}
                      />
                      <InfoField
                        label="Mother's Occupation"
                        value={profileData?.motherOccupation}
                        icon={Award}
                      />
                      <InfoField
                        label="Contact Number"
                        value={profileData?.motherPhone}
                        icon={Phone}
                      />
                      <InfoField
                        label="Email"
                        value={profileData?.motherEmail}
                        icon={Mail}
                      />
                    </div>
                  </div>
                </div>
                
                {(profileData?.guardianName || profileData?.guardianContact) && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold text-gray-700 mb-4 text-lg">Guardian Details (if different)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InfoField
                        label="Guardian Name"
                        value={profileData?.guardianName}
                        icon={User}
                      />
                      <InfoField
                        label="Guardian Contact"
                        value={profileData?.guardianContact}
                        icon={Phone}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-indigo-600 flex items-center gap-2">
                <MapPin size={24} />
                Address Information
              </h3>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField
                    label="Permanent Address"
                    value={profileData?.permanentAddress || profileData?.address}
                    icon={MapPin}
                    fullWidth
                  />
                  <InfoField
                    label="Current Address"
                    value={profileData?.currentAddress || 'Same as permanent address'}
                    icon={MapPin}
                    fullWidth
                  />
                  <InfoField
                    label="City"
                    value={profileData?.city}
                    icon={MapPin}
                  />
                  <InfoField
                    label="District"
                    value={profileData?.district}
                    icon={MapPin}
                  />
                  <InfoField
                    label="State"
                    value={profileData?.state}
                    icon={MapPin}
                  />
                  <InfoField
                    label="Pincode"
                    value={profileData?.pincode}
                    icon={MapPin}
                  />
                </div>
              </div>
            </div>

            {/* Transport & Hostel Information */}
            {(profileData?.busRoute || profileData?.roomNumber) && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 text-orange-600 flex items-center gap-2">
                  <Award size={24} />
                  Transport & Hostel Information
                </h3>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {profileData?.busRoute && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-4 text-lg border-b pb-2">Transport Details</h4>
                        <div className="space-y-3">
                          <InfoField
                            label="Bus Route"
                            value={profileData?.busRoute}
                            icon={Award}
                          />
                          <InfoField
                            label="Boarding Point"
                            value={profileData?.boardingPoint}
                            icon={MapPin}
                          />
                          <InfoField
                            label="Drop Point"
                            value={profileData?.dropPoint}
                            icon={MapPin}
                          />
                        </div>
                      </div>
                    )}
                    
                    {profileData?.roomNumber && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-4 text-lg border-b pb-2">Hostel Details</h4>
                        <div className="space-y-3">
                          <InfoField
                            label="Room Number"
                            value={profileData?.roomNumber}
                            icon={Award}
                          />
                          <InfoField
                            label="Warden Name"
                            value={profileData?.wardenName}
                            icon={User}
                          />
                          <InfoField
                            label="Mess Type"
                            value={profileData?.messType}
                            icon={Award}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-red-600 flex items-center gap-2">
                <Heart size={24} />
                Medical & Additional Information
              </h3>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField
                    label="Medical Conditions"
                    value={profileData?.medicalConditions || 'None'}
                    icon={Heart}
                    fullWidth
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoField = ({ label, value, icon: Icon, fullWidth = false }) => {
  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <Icon size={18} className="text-gray-400" />
        <span className="text-gray-800">{value || 'N/A'}</span>
      </div>
    </div>
  );
};

export default StudentProfile;
