import { X, User, Phone, Mail, MapPin, Home, GraduationCap, Bus, Building } from 'lucide-react';

const InfoRow = ({ label, value, fullWidth }) => (
  <div className={fullWidth ? 'col-span-2' : ''}>
    <span className="font-medium text-gray-700">{label}:</span>
    <span className="ml-2 text-gray-600">{value || 'N/A'}</span>
  </div>
);

const StudentDetailsModal = ({ student, isOpen, onClose }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {student.profilePhoto ? (
                <img src={student.profilePhoto} alt={student.name} className="w-16 h-16 rounded-full object-cover border-2 border-white" />
              ) : (
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User size={32} />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <p className="text-blue-100">Class {student.class} - Section {student.section}{student.rollNumber && ` • Roll: ${student.rollNumber}`}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-blue-50 rounded-lg p-5">
              <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                <User size={20} /> Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <InfoRow label="Full Name" value={student.name} />
                <InfoRow label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'} />
                <InfoRow label="Gender" value={student.gender} />
                <InfoRow label="Blood Group" value={student.bloodGroup} />
                <InfoRow label="Aadhaar Number" value={student.aadhaarNumber} />
                <InfoRow label="EMIS Number" value={student.emisNumber} />
                <InfoRow label="Nationality" value={student.nationality} />
                <InfoRow label="Religion" value={student.religion} />
                <InfoRow label="Caste Category" value={student.casteCategory} />
                <InfoRow label="Community" value={student.community} />
                <InfoRow label="Mother Tongue" value={student.motherTongue} />
                <InfoRow label="Identification Mark 1" value={student.identificationMark1} />
                <InfoRow label="Identification Mark 2" value={student.identificationMark2} />
              </div>
            </div>

            {/* Parent/Guardian Details */}
            <div className="bg-yellow-50 rounded-lg p-5">
              <h3 className="text-lg font-bold text-yellow-800 mb-4">👨👩👧👦 Parent/Guardian Details</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Father's Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <InfoRow label="Name" value={student.fatherName} />
                    <InfoRow label="Occupation" value={student.fatherOccupation} />
                    <InfoRow label="Qualification" value={student.fatherQualification} />
                    <InfoRow label="Annual Income" value={student.fatherIncome} />
                    <InfoRow label="Contact" value={student.fatherContact} />
                    <InfoRow label="Email" value={student.fatherEmail} />
                    <InfoRow label="Aadhaar" value={student.fatherAadhaar} />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Mother's Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <InfoRow label="Name" value={student.motherName} />
                    <InfoRow label="Occupation" value={student.motherOccupation} />
                    <InfoRow label="Qualification" value={student.motherQualification} />
                    <InfoRow label="Annual Income" value={student.motherIncome} />
                    <InfoRow label="Contact" value={student.motherContact} />
                    <InfoRow label="Email" value={student.motherEmail} />
                    <InfoRow label="Aadhaar" value={student.motherAadhaar} />
                  </div>
                </div>
                {student.guardianName && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Guardian Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <InfoRow label="Name" value={student.guardianName} />
                      <InfoRow label="Relationship" value={student.guardianRelationship} />
                      <InfoRow label="Contact" value={student.guardianContact} />
                      <InfoRow label="Occupation" value={student.guardianOccupation} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-green-50 rounded-lg p-5">
              <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                <Phone size={20} /> Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <InfoRow label="Student Phone" value={student.studentPhone} />
                <InfoRow label="Student Email" value={student.studentEmail || student.email} />
                <InfoRow label="Emergency Contact Name" value={student.emergencyContactName} />
                <InfoRow label="Emergency Contact Number" value={student.emergencyContactNumber} />
                <InfoRow label="Alternate Contact" value={student.alternateContact} />
              </div>
            </div>

            {/* Address Details */}
            <div className="bg-purple-50 rounded-lg p-5">
              <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                <MapPin size={20} /> Address Details
              </h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="Permanent Address" value={student.permanentAddress} fullWidth />
                <InfoRow label="Current Address" value={student.currentAddress || 'Same as permanent'} fullWidth />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoRow label="City" value={student.city} />
                  <InfoRow label="District" value={student.district} />
                  <InfoRow label="State" value={student.state} />
                  <InfoRow label="Pincode" value={student.pincode} />
                  <InfoRow label="Country" value={student.country} />
                </div>
              </div>
            </div>

            {/* Medical & Health Information */}
            {(student.medicalConditions || student.allergies || student.disability) && (
              <div className="bg-red-50 rounded-lg p-5">
                <h3 className="text-lg font-bold text-red-800 mb-4">🏥 Medical & Health Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <InfoRow label="Medical Conditions" value={student.medicalConditions} fullWidth />
                  <InfoRow label="Allergies" value={student.allergies} fullWidth />
                  {student.disability && <InfoRow label="Disability Details" value={student.disabilityDetails} fullWidth />}
                  <InfoRow label="Height" value={student.height ? `${student.height} cm` : 'N/A'} />
                  <InfoRow label="Weight" value={student.weight ? `${student.weight} kg` : 'N/A'} />
                  <InfoRow label="Vaccination Status" value={student.vaccinationStatus} />
                  <InfoRow label="Doctor Name" value={student.doctorName} />
                  <InfoRow label="Doctor Contact" value={student.doctorContact} />
                  <InfoRow label="Health Insurance" value={student.healthInsurance} fullWidth />
                </div>
              </div>
            )}

            {/* Academic Details */}
            <div className="bg-indigo-50 rounded-lg p-5">
              <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center gap-2">
                <GraduationCap size={20} /> Academic Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <InfoRow label="Class" value={student.class} />
                <InfoRow label="Section" value={student.section} />
                <InfoRow label="Roll Number" value={student.rollNumber} />
                <InfoRow label="Admission Number" value={student.admissionNumber} />
                <InfoRow label="Admission Date" value={student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'} />
                <InfoRow label="Academic Year" value={student.academicYear} />
                <InfoRow label="Stream" value={student.stream} />
                <InfoRow label="Previous School" value={student.previousSchool} />
                <InfoRow label="Previous Class" value={student.previousClass} />
                <InfoRow label="Medium of Instruction" value={student.mediumOfInstruction} />
                <InfoRow label="Second Language" value={student.secondLanguage} />
                <InfoRow label="Scholarship Category" value={student.scholarshipCategory} />
              </div>
            </div>

            {/* Hostel Details */}
            {(student.hostelName || student.roomNumber) && (
              <div className="bg-pink-50 rounded-lg p-5">
                <h3 className="text-lg font-bold text-pink-800 mb-4 flex items-center gap-2">
                  <Building size={20} /> Hostel Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <InfoRow label="Hostel Name" value={student.hostelName} />
                  <InfoRow label="Room Number" value={student.roomNumber} />
                  <InfoRow label="Bed Number" value={student.bedNumber} />
                  <InfoRow label="Warden Name" value={student.wardenName} />
                  <InfoRow label="Warden Contact" value={student.wardenContact} />
                  <InfoRow label="Room Type" value={student.roomType} />
                  <InfoRow label="Mess Plan" value={student.messPlan} />
                  <InfoRow label="Hostel Fee" value={student.hostelFee} />
                </div>
              </div>
            )}

            {/* Transport Details */}
            {(student.routeNumber || student.pickupPoint) && (
              <div className="bg-orange-50 rounded-lg p-5">
                <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                  <Bus size={20} /> Transport Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <InfoRow label="Route Number" value={student.routeNumber} />
                  <InfoRow label="Pickup Point" value={student.pickupPoint} />
                  <InfoRow label="Driver Name" value={student.driverName} />
                  <InfoRow label="Driver Contact" value={student.driverContact} />
                  <InfoRow label="Bus Number" value={student.busNumber} />
                  <InfoRow label="Transport Fee" value={student.transportFee} />
                </div>
              </div>
            )}

            {/* Bank Details */}
            {student.bankName && (
              <div className="bg-cyan-50 rounded-lg p-5">
                <h3 className="text-lg font-bold text-cyan-800 mb-4">🏦 Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <InfoRow label="Bank Name" value={student.bankName} />
                  <InfoRow label="Account Holder" value={student.accountHolder} />
                  <InfoRow label="Account Number" value={student.accountNumber} />
                  <InfoRow label="IFSC Code" value={student.ifscCode} />
                  <InfoRow label="Branch Name" value={student.branchName} />
                  <InfoRow label="UPI ID" value={student.upiId} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
