import { useState, useEffect } from 'react';
import { X, User, BookOpen, Calendar, Clock, MapPin, Phone, Mail, Award, Building } from 'lucide-react';
import { timetableAPI } from '../services/api';

const StaffDetailsModal = ({ isOpen, onClose, staff }) => {
  const [loading, setLoading] = useState(false);
  const [assignedClasses, setAssignedClasses] = useState([]);

  useEffect(() => {
    if (isOpen && staff) {
      fetchStaffTimetable();
    }
  }, [isOpen, staff]);

  const fetchStaffTimetable = async () => {
    setLoading(true);
    try {
      const res = await timetableAPI.getTimetable({ teacherId: staff._id });
      setAssignedClasses(res.data || []);
    } catch (error) {
      console.error('Failed to fetch staff timetable:', error);
      setAssignedClasses([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !staff) return null;

  const getUniqueClasses = () => {
    const classSet = new Set();
    assignedClasses.forEach(item => {
      if (item.class && item.section) {
        classSet.add(`${item.class}-${item.section}`);
      }
    });
    return Array.from(classSet);
  };

  const getSubjects = () => {
    const subjectSet = new Set();
    assignedClasses.forEach(item => {
      if (item.subject?.name) {
        subjectSet.add(item.subject.name);
      }
    });
    return Array.from(subjectSet);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                {staff.passportPhoto ? (
                  <img 
                    src={`data:${staff.passportPhoto.contentType};base64,${staff.passportPhoto.data}`}
                    alt="Staff Photo" 
                    className="w-16 h-16 object-cover rounded-full"
                  />
                ) : (
                  <User size={32} />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{staff.name}</h2>
                <p className="text-blue-100">
                  {staff.role} • {staff.department}
                  {staff.staffId && ` • ID: ${staff.staffId}`}
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading staff data...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <BookOpen className="mx-auto text-blue-500 mb-2" size={24} />
                  <div className="text-2xl font-bold text-blue-600">{getSubjects().length}</div>
                  <div className="text-sm text-gray-600">Subjects</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <Building className="mx-auto text-green-500 mb-2" size={24} />
                  <div className="text-2xl font-bold text-green-600">{getUniqueClasses().length}</div>
                  <div className="text-sm text-gray-600">Classes</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <Calendar className="mx-auto text-purple-500 mb-2" size={24} />
                  <div className="text-2xl font-bold text-purple-600">{assignedClasses.length}</div>
                  <div className="text-sm text-gray-600">Total Periods</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <Award className="mx-auto text-orange-500 mb-2" size={24} />
                  <div className={`text-2xl font-bold ${
                    staff.status === 'Active' ? 'text-green-600' : 
                    staff.status === 'On Leave' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {staff.status || 'Active'}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>

              {/* Staff Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <User size={20} />
                  Staff Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    <span className="font-medium">Name:</span> {staff.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-500" />
                    <span className="font-medium">Email:</span> {staff.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-500" />
                    <span className="font-medium">Phone:</span> {staff.phone || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-gray-500" />
                    <span className="font-medium">Department:</span> {staff.department}
                  </div>
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-gray-500" />
                    <span className="font-medium">Role:</span> {staff.role}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="font-medium">Joining Date:</span> {staff.joiningDate ? new Date(staff.joiningDate).toLocaleDateString() : 'N/A'}
                  </div>
                  {staff.qualification && (
                    <div className="flex items-center gap-2 col-span-2">
                      <BookOpen size={16} className="text-gray-500" />
                      <span className="font-medium">Qualification:</span> {staff.qualification}
                    </div>
                  )}
                  {staff.address && (
                    <div className="flex items-start gap-2 col-span-2">
                      <MapPin size={16} className="text-gray-500 mt-0.5" />
                      <span className="font-medium">Address:</span> {staff.address}
                    </div>
                  )}
                </div>
              </div>

              {/* Assigned Classes */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Building size={20} />
                  Assigned Classes ({getUniqueClasses().length})
                </h3>
                {getUniqueClasses().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No classes assigned
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getUniqueClasses().map((classInfo, index) => {
                      const [className, section] = classInfo.split('-');
                      return (
                        <div key={index} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="font-medium text-gray-900">Class {className}</div>
                          <div className="text-sm text-gray-600">Section {section}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Subjects Teaching */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BookOpen size={20} />
                  Subjects Teaching ({getSubjects().length})
                </h3>
                {getSubjects().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No subjects assigned
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {getSubjects().map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Weekly Schedule */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock size={20} />
                  Weekly Schedule ({assignedClasses.length} periods)
                </h3>
                {assignedClasses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No schedule found
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {assignedClasses.map((item, index) => (
                      <div key={index} className="bg-white border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-gray-900">
                              {item.subject?.name || 'Unknown Subject'}
                            </div>
                            <div className="text-sm text-gray-600">
                              Class {item.class}-{item.section}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-blue-600">
                              {item.day}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.startTime} - {item.endTime}
                            </div>
                          </div>
                        </div>
                        {item.room && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin size={14} />
                            Room: {item.room}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDetailsModal;