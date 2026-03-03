import { X, User, Phone, Mail, MapPin, Home, GraduationCap, Bus, Building } from 'lucide-react';

const StudentDetailsModal = ({ student, isOpen, onClose }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <p className="text-blue-100">
                  Class {student.class} - Section {student.section}
                  {student.rollNumber && ` • Roll: ${student.rollNumber}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
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
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-green-50 rounded-lg p-5">
              <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                <Phone size={20} /> Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <InfoRow label="Email" value={student.email} />
                <InfoRow label="Phone" value={student.phone} />
                <InfoRow label="Emergency Contact" value={student.emergencyContact} />
              </div>
            </div>

            {/* Parent/Guardian Details */}
            <div className="bg-yellow-50 rounded-lg p-5">
              <h3 className="text-lg font-bold text-yellow-800 mb-4">👨‍👩‍👧‍👦 Parent/Guardian Details</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Father's Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <InfoRow label="Name" value={student.fatherName} />
                    <InfoRow label="Occupation" value={student.fatherOccupation} />
                    <InfoRow label="Phone" value={student.fatherPhone} />
                    <InfoRow label="Email" value={student.fatherEmail} />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Mother's Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <InfoRow label="Name" value={student.motherName} />
                    <InfoRow label="Occupation" value={student.motherOccupation} />
                    <InfoRow label="Phone" value={student.motherPhone} />
                    <InfoRow label="Email" value={student.motherEmail} />
                  </div>
                </div>
                
                {(student.guardianName || student.guardianContact) && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Guardian Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <InfoRow label="Name" value={student.guardianName} />
                      <InfoRow label="Contact" value={student.guardianContact} />
                    </div>
                  </div>
                )}
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
                </div>
              </div>
            </div>

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
                <InfoRow label="Previous School" value={student.previousSchool} />
                <InfoRow label="Previous Class" value={student.previousClass} />
                <InfoRow label="Medium of Instruction" value={student.mediumOfInstruction} />
                <InfoRow label="Second Language" value={student.secondLanguage} />
              </div>
            </div>

            {/* Transport Details */}
            {(student.busRoute || student.boardingPoint || student.dropPoint) && (
              <div className="bg-orange-50 rounded-lg p-5">
                <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                  <Bus size={20} /> Transport Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <InfoRow label="Bus Route" value={student.busRoute} />
                  <InfoRow label="Boarding Point" value={student.boardingPoint} />
                  <InfoRow label="Drop Point" value={student.dropPoint} />
                </div>
              </div>
            )}

            {/* Hostel Details */}
            {(student.roomNumber || student.wardenName || student.messType) && (
              <div className="bg-pink-50 rounded-lg p-5">
                <h3 className="text-lg font-bold text-pink-800 mb-4 flex items-center gap-2">
                  <Building size={20} /> Hostel Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <InfoRow label="Room Number" value={student.roomNumber} />
                  <InfoRow label="Warden Name" value={student.wardenName} />
                  <InfoRow label="Mess Type" value={student.messType} />
                  <InfoRow label="Parent Consent" value={student.parentConsentForm ? 'Submitted' : 'Pending'} />
                </div>
              </div>
            )}

            {/* Medical Information */}
            {student.medicalConditions && (
              <div className="bg-red-50 rounded-lg p-5">
                <h3 className="text-lg font-bold text-red-800 mb-4">🏥 Medical Information</h3>
                <InfoRow label="Medical Conditions" value={student.medicalConditions} fullWidth />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;