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
                Student Information
              </h3>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField
                    label="Full Name"
                    value={profileData?.name}
                    icon={User}
                  />
                  <InfoField
                    label="Roll Number"
                    value={profileData?.rollNumber}
                    icon={Award}
                  />
                  <InfoField
                    label="Date of Birth"
                    value={profileData?.dateOfBirth}
                    icon={Calendar}
                  />
                  <InfoField
                    label="Gender"
                    value={profileData?.gender || 'Female'}
                    icon={Users}
                  />
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
                    label="Blood Group"
                    value={profileData?.bloodGroup || 'O+'}
                    icon={Droplet}
                  />
                  <InfoField
                    label="Phone"
                    value={profileData?.phone || '+1 234 567 8900'}
                    icon={Phone}
                  />
                  <InfoField
                    label="Email"
                    value={profileData?.email}
                    icon={Mail}
                  />
                  <InfoField
                    label="Address"
                    value={profileData?.address || '123 Main Street, Springfield, IL 62701'}
                    icon={MapPin}
                    fullWidth
                  />
                </div>
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-blue-600 flex items-center gap-2">
                <Users size={24} />
                Parent/Guardian Information
              </h3>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Father's Details</h4>
                    <InfoField
                      label="Father's Name"
                      value={profileData?.fatherName || 'Robert Johnson'}
                      icon={User}
                    />
                    <InfoField
                      label="Father's Occupation"
                      value={profileData?.fatherOccupation || 'Engineer'}
                      icon={Award}
                    />
                    <InfoField
                      label="Contact Number"
                      value={profileData?.fatherPhone || '+1 234 567 8901'}
                      icon={Phone}
                    />
                    <InfoField
                      label="Email"
                      value={profileData?.fatherEmail || 'robert.johnson@email.com'}
                      icon={Mail}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Mother's Details</h4>
                    <InfoField
                      label="Mother's Name"
                      value={profileData?.motherName || 'Emily Johnson'}
                      icon={User}
                    />
                    <InfoField
                      label="Mother's Occupation"
                      value={profileData?.motherOccupation || 'Teacher'}
                      icon={Award}
                    />
                    <InfoField
                      label="Contact Number"
                      value={profileData?.motherPhone || '+1 234 567 8902'}
                      icon={Phone}
                    />
                    <InfoField
                      label="Email"
                      value={profileData?.motherEmail || 'emily.johnson@email.com'}
                      icon={Mail}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-blue-600 flex items-center gap-2">
                <BookOpen size={24} />
                Additional Information
              </h3>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField
                    label="Admission Date"
                    value={profileData?.admissionDate || '01 April 2020'}
                    icon={Calendar}
                  />
                  <InfoField
                    label="Admission Number"
                    value={profileData?.admissionNumber || 'ADM2020001'}
                    icon={Award}
                  />
                  <InfoField
                    label="Religion"
                    value={profileData?.religion || 'Christianity'}
                    icon={Heart}
                  />
                  <InfoField
                    label="Nationality"
                    value={profileData?.nationality || 'American'}
                    icon={Users}
                  />
                  <InfoField
                    label="Emergency Contact"
                    value={profileData?.emergencyContact || '+1 234 567 8903'}
                    icon={Phone}
                  />
                  <InfoField
                    label="Medical Conditions"
                    value={profileData?.medicalConditions || 'None'}
                    icon={Heart}
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
