import { useState, useEffect, useContext } from 'react';
import { Plus, Edit, Trash2, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { courseAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const StaffCourses = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '', 
    description: '', 
    type: 'course', 
    eligibleClasses: [], 
    maxCapacity: 50, 
    schedule: { days: [], startTime: '', endTime: '', text: '' },
    location: '', 
    startDate: '', 
    endDate: '',
    fee: 0,
    duration: '',
    prerequisites: ''
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await courseAPI.getCourses();
      setCourses(res.data.data.filter(c => c.instructor && c.instructor._id === user.id));
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('Failed to load courses. Please try again.');
    }
  };

  const fetchEnrollments = async (courseId) => {
    try {
      const res = await courseAPI.getEnrollments({ courseId });
      setEnrollments(res.data.data);
      setShowEnrollModal(true);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCourse) {
        await courseAPI.updateCourse(selectedCourse._id, formData);
        alert('Course updated successfully!');
      } else {
        await courseAPI.createCourse(formData);
        alert('Course created successfully!');
      }
      await fetchCourses();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving course:', error);
      alert(error.response?.data?.message || 'Error saving course');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this course?')) {
      try {
        await courseAPI.deleteCourse(id);
        fetchCourses();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting course');
      }
    }
  };

  const handleEnrollmentStatus = async (enrollmentId, status, responseMessage = '') => {
    try {
      await courseAPI.updateEnrollmentStatus(enrollmentId, { status, responseMessage });
      fetchEnrollments(selectedCourse._id);
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating enrollment');
    }
  };

  const resetForm = () => {
    setFormData({ 
      title: '', 
      description: '', 
      type: 'course', 
      eligibleClasses: [], 
      maxCapacity: 50, 
      schedule: { days: [], startTime: '', endTime: '', text: '' },
      location: '', 
      startDate: '', 
      endDate: '',
      fee: 0,
      duration: '',
      prerequisites: ''
    });
    setSelectedCourse(null);
  };

  const openEditModal = (course) => {
    setSelectedCourse(course);
    setFormData({ 
      ...course, 
      eligibleClasses: course.eligibleClasses || [],
      schedule: course.schedule || { days: [], startTime: '', endTime: '', text: '' },
      fee: course.fee || 0,
      duration: course.duration || '',
      prerequisites: course.prerequisites || ''
    });
    setShowModal(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Courses & Activities</h1>
            <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
              <Plus size={20} /> Add New
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg mb-4">No courses created yet</p>
                <p className="text-gray-400 text-sm">Click "Add New" to create your first course</p>
              </div>
            ) : (
              courses.map(course => (
              <div key={course._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.type === 'course' ? 'bg-blue-100 text-blue-800' : course.type === 'club' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                    {course.type.toUpperCase()}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(course)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(course._id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  <p><strong>Classes:</strong> {course.eligibleClasses.join(', ')}</p>
                  <p><strong>Capacity:</strong> {course.maxCapacity}</p>
                  {course.fee > 0 && <p><strong>Fee:</strong> ₹{course.fee}</p>}
                  {course.schedule?.days?.length > 0 && <p><strong>Days:</strong> {course.schedule.days.map(d => d.slice(0, 3)).join(', ')}</p>}
                  {course.schedule?.startTime && <p><strong>Time:</strong> {course.schedule.startTime} - {course.schedule.endTime}</p>}
                  {course.location && <p><strong>Location:</strong> {course.location}</p>}
                  {course.duration && <p><strong>Duration:</strong> {course.duration}</p>}
                </div>
                <button onClick={() => { setSelectedCourse(course); fetchEnrollments(course._id); }} className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2">
                  <Users size={18} /> View Enrollments
                </button>
              </div>
            ))
            )}
          </div>

          {showModal && (
            <Modal isOpen={showModal} title={selectedCourse ? 'Edit Course' : 'Add Course'} onClose={() => { setShowModal(false); resetForm(); }}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Course Title *</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Description *</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border rounded-lg px-3 py-2" rows="3" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type *</label>
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                      <option value="course">Course</option>
                      <option value="club">Club</option>
                      <option value="sport">Sport</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select value={formData.status || 'active'} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Eligible Classes * (comma separated)</label>
                    <input type="text" value={formData.eligibleClasses.join(', ')} onChange={(e) => setFormData({ ...formData, eligibleClasses: e.target.value.split(',').map(c => c.trim()).filter(c => c) })} className="w-full border rounded-lg px-3 py-2" placeholder="10, 11, 12" required />
                    <p className="text-xs text-gray-500 mt-1">Only students from these classes can see and enroll</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Capacity</label>
                    <input type="number" value={formData.maxCapacity} onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })} className="w-full border rounded-lg px-3 py-2" min="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Course Fee (₹)</label>
                    <input type="number" value={formData.fee} onChange={(e) => setFormData({ ...formData, fee: e.target.value })} className="w-full border rounded-lg px-3 py-2" min="0" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="Room 101" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration</label>
                    <input type="text" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="3 months" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Schedule Days</label>
                    <div className="flex flex-wrap gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <label key={day} className="flex items-center gap-1 px-3 py-1 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input type="checkbox" checked={formData.schedule.days.includes(day)} onChange={(e) => {
                            const days = e.target.checked 
                              ? [...formData.schedule.days, day]
                              : formData.schedule.days.filter(d => d !== day);
                            setFormData({ ...formData, schedule: { ...formData.schedule, days } });
                          }} className="cursor-pointer" />
                          <span className="text-sm">{day.slice(0, 3)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Time</label>
                    <input type="time" value={formData.schedule.startTime} onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, startTime: e.target.value } })} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Time</label>
                    <input type="time" value={formData.schedule.endTime} onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, endTime: e.target.value } })} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Prerequisites</label>
                    <textarea value={formData.prerequisites} onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })} className="w-full border rounded-lg px-3 py-2" rows="2" placeholder="Any requirements or prerequisites for this course..." />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Save Course</button>
                  <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
                </div>
              </form>
            </Modal>
          )}

          {showEnrollModal && (
            <Modal isOpen={showEnrollModal} title="Enrollment Requests" onClose={() => setShowEnrollModal(false)}>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {enrollments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No enrollment requests</p>
                ) : (
                  enrollments.map(enroll => (
                    <div key={enroll._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{enroll.student.name}</p>
                          <p className="text-sm text-gray-600">Class: {enroll.student.class} - {enroll.student.section}</p>
                          <p className="text-xs text-gray-500">Roll: {enroll.student.rollNumber}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${enroll.status === 'approved' ? 'bg-green-100 text-green-800' : enroll.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {enroll.status}
                        </span>
                      </div>
                      {enroll.requestMessage && <p className="text-sm text-gray-600 mb-2">Message: {enroll.requestMessage}</p>}
                      {enroll.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => handleEnrollmentStatus(enroll._id, 'approved')} className="flex-1 bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700 flex items-center justify-center gap-1">
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button onClick={() => handleEnrollmentStatus(enroll._id, 'rejected')} className="flex-1 bg-red-600 text-white py-1 rounded text-sm hover:bg-red-700 flex items-center justify-center gap-1">
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffCourses;
