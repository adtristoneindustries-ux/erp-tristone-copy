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
                  <InfoField label="Full Name" value={profileData?.name} icon={User} />
                  <InfoField label="Date of Birth" value={profileData?.dateOfBirth ? new Date(profileData.dateOfBirth).toLocaleDateString('en-IN') : 'N/A'} icon={Calendar} />
                  <InfoField label="Gender" value={profileData?.gender} icon={Users} />
                  <InfoField label="Blood Group" value={profileData?.bloodGroup} icon={Droplet} />
                  <InfoField label="Aadhaar Number" value={profileData?.aadhaarNumber} icon={Award} />
                  <InfoField label="EMIS Number" value={profileData?.emisNumber} icon={Award} />
                  <InfoField label="Nationality" value={profileData?.nationality} icon={Users} />
                  <InfoField label="Religion" value={profileData?.religion} icon={Heart} />
                  <InfoField label="Caste Category" value={profileData?.casteCategory} icon={Award} />
                  <InfoField label="Community" value={profileData?.community} icon={Users} />
                  <InfoField label="Mother Tongue" value={profileData?.motherTongue} icon={BookOpen} />
                  <InfoField label="Identification Mark 1" value={profileData?.identificationMark1} icon={Award} />
                  <InfoField label="Identification Mark 2" value={profileData?.identificationMark2} icon={Award} />
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
                  <InfoField label="Class" value={profileData?.class} icon={BookOpen} />
                  <InfoField label="Section" value={profileData?.section} icon={BookOpen} />
                  <InfoField label="Roll Number" value={profileData?.rollNumber} icon={Award} />
                  <InfoField label="Admission Number" value={profileData?.admissionNumber} icon={Award} />
                  <InfoField label="Admission Date" value={profileData?.admissionDate ? new Date(profileData.admissionDate).toLocaleDateString('en-IN') : 'N/A'} icon={Calendar} />
                  <InfoField label="Academic Year" value={profileData?.academicYear} icon={BookOpen} />
                  <InfoField label="Stream" value={profileData?.stream} icon={BookOpen} />
                  <InfoField label="Previous School" value={profileData?.previousSchool} icon={BookOpen} />
                  <InfoField label="Previous Class" value={profileData?.previousClass} icon={BookOpen} />
                  <InfoField label="Medium of Instruction" value={profileData?.mediumOfInstruction} icon={BookOpen} />
                  <InfoField label="Second Language" value={profileData?.secondLanguage} icon={BookOpen} />
                  <InfoField label="Scholarship Category" value={profileData?.scholarshipCategory} icon={Award} />
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
                  <InfoField label="Student Phone" value={profileData?.studentPhone} icon={Phone} />
                  <InfoField label="Student Email" value={profileData?.studentEmail || profileData?.email} icon={Mail} />
                  <InfoField label="Emergency Contact Name" value={profileData?.emergencyContactName} icon={User} />
                  <InfoField label="Emergency Contact Number" value={profileData?.emergencyContactNumber} icon={Phone} />
                  <InfoField label="Alternate Contact" value={profileData?.alternateContact} icon={Phone} />
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
                      <InfoField label="Father's Name" value={profileData?.fatherName} icon={User} />
                      <InfoField label="Occupation" value={profileData?.fatherOccupation} icon={Award} />
                      <InfoField label="Qualification" value={profileData?.fatherQualification} icon={BookOpen} />
                      <InfoField label="Annual Income" value={profileData?.fatherIncome} icon={Award} />
                      <InfoField label="Contact Number" value={profileData?.fatherContact} icon={Phone} />
                      <InfoField label="Email" value={profileData?.fatherEmail} icon={Mail} />
                      <InfoField label="Aadhaar" value={profileData?.fatherAadhaar} icon={Award} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-4 text-lg border-b pb-2">Mother's Details</h4>
                    <div className="space-y-3">
                      <InfoField label="Mother's Name" value={profileData?.motherName} icon={User} />
                      <InfoField label="Occupation" value={profileData?.motherOccupation} icon={Award} />
                      <InfoField label="Qualification" value={profileData?.motherQualification} icon={BookOpen} />
                      <InfoField label="Annual Income" value={profileData?.motherIncome} icon={Award} />
                      <InfoField label="Contact Number" value={profileData?.motherContact} icon={Phone} />
                      <InfoField label="Email" value={profileData?.motherEmail} icon={Mail} />
                      <InfoField label="Aadhaar" value={profileData?.motherAadhaar} icon={Award} />
                    </div>
                  </div>
                </div>
                {profileData?.guardianName && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold text-gray-700 mb-4 text-lg">Guardian Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InfoField label="Guardian Name" value={profileData?.guardianName} icon={User} />
                      <InfoField label="Relationship" value={profileData?.guardianRelationship} icon={Users} />
                      <InfoField label="Contact" value={profileData?.guardianContact} icon={Phone} />
                      <InfoField label="Occupation" value={profileData?.guardianOccupation} icon={Award} />
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
                  <InfoField label="Permanent Address" value={profileData?.permanentAddress || profileData?.address} icon={MapPin} fullWidth />
                  <InfoField label="Current Address" value={profileData?.currentAddress || 'Same as permanent address'} icon={MapPin} fullWidth />
                  <InfoField label="City" value={profileData?.city} icon={MapPin} />
                  <InfoField label="District" value={profileData?.district} icon={MapPin} />
                  <InfoField label="State" value={profileData?.state} icon={MapPin} />
                  <InfoField label="Pincode" value={profileData?.pincode} icon={MapPin} />
                  <InfoField label="Country" value={profileData?.country} icon={MapPin} />
                </div>
              </div>
            </div>

            {/* Medical & Health Information */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4 text-red-600 flex items-center gap-2">
                <Heart size={24} />
                Medical & Health Information
              </h3>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField label="Medical Conditions" value={profileData?.medicalConditions || 'None'} icon={Heart} fullWidth />
                  <InfoField label="Allergies" value={profileData?.allergies || 'None'} icon={Heart} fullWidth />
                  {profileData?.disability && <InfoField label="Disability Details" value={profileData?.disabilityDetails} icon={Heart} fullWidth />}
                  <InfoField label="Height" value={profileData?.height ? `${profileData.height} cm` : 'N/A'} icon={Award} />
                  <InfoField label="Weight" value={profileData?.weight ? `${profileData.weight} kg` : 'N/A'} icon={Award} />
                  <InfoField label="Vaccination Status" value={profileData?.vaccinationStatus} icon={Heart} />
                  <InfoField label="Doctor Name" value={profileData?.doctorName} icon={User} />
                  <InfoField label="Doctor Contact" value={profileData?.doctorContact} icon={Phone} />
                  <InfoField label="Health Insurance" value={profileData?.healthInsurance} icon={Award} fullWidth />
                </div>
              </div>
            </div>

            {/* Transport & Hostel Information */}
            {(profileData?.routeNumber || profileData?.hostelName) && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 text-orange-600 flex items-center gap-2">
                  <Award size={24} />
                  Transport & Hostel Information
                </h3>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {profileData?.routeNumber && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-4 text-lg border-b pb-2">Transport Details</h4>
                        <div className="space-y-3">
                          <InfoField label="Route Number" value={profileData?.routeNumber} icon={Award} />
                          <InfoField label="Pickup Point" value={profileData?.pickupPoint} icon={MapPin} />
                          <InfoField label="Driver Name" value={profileData?.driverName} icon={User} />
                          <InfoField label="Driver Contact" value={profileData?.driverContact} icon={Phone} />
                          <InfoField label="Bus Number" value={profileData?.busNumber} icon={Award} />
                          <InfoField label="Transport Fee" value={profileData?.transportFee} icon={Award} />
                        </div>
                      </div>
                    )}
                    {profileData?.hostelName && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-4 text-lg border-b pb-2">Hostel Details</h4>
                        <div className="space-y-3">
                          <InfoField label="Hostel Name" value={profileData?.hostelName} icon={Award} />
                          <InfoField label="Room Number" value={profileData?.roomNumber} icon={Award} />
                          <InfoField label="Bed Number" value={profileData?.bedNumber} icon={Award} />
                          <InfoField label="Warden Name" value={profileData?.wardenName} icon={User} />
                          <InfoField label="Warden Contact" value={profileData?.wardenContact} icon={Phone} />
                          <InfoField label="Room Type" value={profileData?.roomType} icon={Award} />
                          <InfoField label="Mess Plan" value={profileData?.messPlan} icon={Award} />
                          <InfoField label="Hostel Fee" value={profileData?.hostelFee} icon={Award} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bank Details */}
            {profileData?.bankName && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 text-cyan-600 flex items-center gap-2">
                  <Award size={24} />
                  Bank Details
                </h3>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label="Bank Name" value={profileData?.bankName} icon={Award} />
                    <InfoField label="Account Holder" value={profileData?.accountHolder} icon={User} />
                    <InfoField label="Account Number" value={profileData?.accountNumber} icon={Award} />
                    <InfoField label="IFSC Code" value={profileData?.ifscCode} icon={Award} />
                    <InfoField label="Branch Name" value={profileData?.branchName} icon={MapPin} />
                    <InfoField label="UPI ID" value={profileData?.upiId} icon={Award} />
                  </div>
                </div>
              </div>
            )}
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
