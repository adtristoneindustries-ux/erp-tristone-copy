import { useState, useEffect, useContext } from 'react';
import { BookOpen, Users, MapPin, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { courseAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchCourses();
    fetchMyEnrollments();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await courseAPI.getCourses();
      // Filter courses where student's class is in eligibleClasses
      const eligibleCourses = res.data.data.filter(course => 
        course.eligibleClasses.includes(user.class)
      );
      setCourses(eligibleCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchMyEnrollments = async () => {
    try {
      const res = await courseAPI.getMyEnrollments();
      setMyEnrollments(res.data.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const handleEnrollRequest = async (e) => {
    e.preventDefault();
    try {
      await courseAPI.requestEnrollment(selectedCourse._id, { requestMessage });
      alert('Enrollment request submitted successfully!');
      setShowEnrollModal(false);
      setRequestMessage('');
      fetchCourses();
      fetchMyEnrollments();
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting request');
    }
  };

  const isEnrolled = (courseId) => {
    return myEnrollments.some(e => e.course._id === courseId);
  };

  const getEnrollmentStatus = (courseId) => {
    const enrollment = myEnrollments.find(e => e.course._id === courseId);
    return enrollment?.status;
  };

  const filteredCourses = filter === 'all' ? courses : courses.filter(c => c.type === filter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Courses & Activities</h1>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>All</button>
            <button onClick={() => setFilter('course')} className={`px-4 py-2 rounded-lg ${filter === 'course' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>Courses</button>
            <button onClick={() => setFilter('club')} className={`px-4 py-2 rounded-lg ${filter === 'club' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700'}`}>Clubs</button>
            <button onClick={() => setFilter('sport')} className={`px-4 py-2 rounded-lg ${filter === 'sport' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}>Sports</button>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">My Enrollments</h2>
            {myEnrollments.length === 0 ? (
              <p className="text-gray-500">No enrollments yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myEnrollments.map(enroll => (
                  <div key={enroll._id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${enroll.course.type === 'course' ? 'bg-blue-100 text-blue-800' : enroll.course.type === 'club' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                        {enroll.course.type.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle size={16} /> Enrolled</span>
                    </div>
                    <h3 className="font-bold mb-1">{enroll.course.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">Instructor: {enroll.course.instructor?.name}</p>
                    {enroll.course.schedule?.days?.length > 0 && <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={14} /> {enroll.course.schedule.days.map(d => d.slice(0, 3)).join(', ')} {enroll.course.schedule.startTime && `(${enroll.course.schedule.startTime}-${enroll.course.schedule.endTime})`}</p>}
                    {enroll.course.location && <p className="text-xs text-gray-500 mt-1">📍 {enroll.course.location}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold mb-4">Available {filter !== 'all' ? filter.charAt(0).toUpperCase() + filter.slice(1) + 's' : 'Courses & Activities'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const enrolled = isEnrolled(course._id);
              const status = getEnrollmentStatus(course._id);
              return (
                <div key={course._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${course.type === 'course' ? 'bg-blue-100 text-blue-800' : course.type === 'club' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                      {course.type.toUpperCase()}
                    </span>
                    {enrolled && (
                      <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${status === 'approved' ? 'bg-green-100 text-green-800' : status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {status === 'approved' ? <CheckCircle size={14} /> : status === 'pending' ? <Clock size={14} /> : <XCircle size={14} />}
                        {status}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{course.description}</p>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p className="flex items-center gap-2"><Users size={16} /> Instructor: {course.instructor?.name}</p>
                    {course.fee > 0 && <p className="flex items-center gap-2 font-semibold text-green-700">💰 Fee: ₹{course.fee}</p>}
                    {course.schedule?.days?.length > 0 && <p className="flex items-center gap-2"><Calendar size={16} /> {course.schedule.days.map(d => d.slice(0, 3)).join(', ')} {course.schedule.startTime && `(${course.schedule.startTime} - ${course.schedule.endTime})`}</p>}
                    {course.location && <p className="flex items-center gap-2"><MapPin size={16} /> {course.location}</p>}
                    {course.duration && <p className="flex items-center gap-2">⏱️ Duration: {course.duration}</p>}
                    <p className="flex items-center gap-2"><BookOpen size={16} /> Capacity: {course.maxCapacity}</p>
                    {course.prerequisites && <p className="text-xs text-orange-600 mt-2">⚠️ Prerequisites: {course.prerequisites}</p>}
                  </div>
                  {!enrolled ? (
                    <button onClick={() => { setSelectedCourse(course); setShowEnrollModal(true); }} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                      Request Enrollment
                    </button>
                  ) : status === 'approved' ? (
                    <button disabled className="w-full bg-green-100 text-green-800 py-2 rounded-lg cursor-not-allowed">Enrolled</button>
                  ) : status === 'pending' ? (
                    <button disabled className="w-full bg-yellow-100 text-yellow-800 py-2 rounded-lg cursor-not-allowed">Pending Approval</button>
                  ) : (
                    <button disabled className="w-full bg-red-100 text-red-800 py-2 rounded-lg cursor-not-allowed">Request Rejected</button>
                  )}
                </div>
              );
            })}
          </div>

          {showEnrollModal && (
            <Modal isOpen={showEnrollModal} title="Request Enrollment" onClose={() => { setShowEnrollModal(false); setRequestMessage(''); }}>
              <form onSubmit={handleEnrollRequest} className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">{selectedCourse.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{selectedCourse.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Why do you want to join? (Optional)</label>
                  <textarea value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} className="w-full border rounded-lg px-3 py-2" rows="3" placeholder="Tell us why you're interested..." />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Submit Request</button>
                  <button type="button" onClick={() => { setShowEnrollModal(false); setRequestMessage(''); }} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
                </div>
              </form>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCourses;
