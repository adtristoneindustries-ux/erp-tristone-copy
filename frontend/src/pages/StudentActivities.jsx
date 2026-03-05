import { useState, useEffect, useContext } from 'react';
import { Users, BookOpen, Trophy, Calendar, MapPin, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { activityAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ActivityDetailsModal from '../components/ActivityDetailsModal';

const StudentActivities = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [allActivities, setAllActivities] = useState([]);
  const [enrolledActivities, setEnrolledActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchActivities();
    fetchEnrollments();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await activityAPI.getActivities();
      setAllActivities(res.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await activityAPI.getMyEnrollments();
      setEnrolledActivities(res.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const handleEnroll = async (activityId) => {
    try {
      await activityAPI.enrollActivity({ activityId });
      fetchActivities();
      fetchEnrollments();
      alert('Enrolled successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to enroll');
    }
  };

  const isEnrolled = (activityId) => {
    return enrolledActivities.some(a => a._id === activityId);
  };

  const handleViewActivities = (activity) => {
    setSelectedActivity(activity);
    setShowModal(true);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'course': return BookOpen;
      case 'club': return Users;
      case 'sport': return Trophy;
      default: return BookOpen;
    }
  };

  const filteredActivities = activeTab === 'enrolled' 
    ? enrolledActivities 
    : allActivities.filter(a => a.type === (activeTab === 'courses' ? 'course' : activeTab === 'clubs' ? 'club' : 'sport'));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Courses & Activities</h1>

          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`px-6 py-3 font-medium ${activeTab === 'enrolled' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
              >
                My Enrollments
              </button>
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-6 py-3 font-medium ${activeTab === 'courses' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab('clubs')}
                className={`px-6 py-3 font-medium ${activeTab === 'clubs' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
              >
                Clubs
              </button>
              <button
                onClick={() => setActiveTab('sports')}
                className={`px-6 py-3 font-medium ${activeTab === 'sports' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
              >
                Sports
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity) => {
              const Icon = getIcon(activity.type);
              const enrolled = isEnrolled(activity._id);

              return (
                <div key={activity._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Icon className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{activity.title}</h3>
                        <span className="text-xs text-gray-500 uppercase">{activity.type}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{activity.description}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Users size={16} />
                    <span>{activity.memberCount} members</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewActivities(activity)}
                      className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                    >
                      View Activities
                    </button>
                    {enrolled ? (
                      <button
                        disabled
                        className="flex-1 px-4 py-2 bg-green-100 text-green-600 rounded-lg flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Joined
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(activity._id)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No activities found</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ActivityDetailsModal
          activity={selectedActivity}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default StudentActivities;
