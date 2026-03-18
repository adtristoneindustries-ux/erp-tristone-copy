import { useState, useEffect, useContext } from 'react';
import { Upload, Edit2, Save, X, CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { placementAPI } from '../services/api';
import toast from 'react-hot-toast';

const StudentPlacements = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [drives, setDrives] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState({});

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [statsRes, profileRes, drivesRes, applicationsRes] = await Promise.all([
        placementAPI.getStudentStats(),
        placementAPI.getStudentProfile(),
        placementAPI.getDrives({ status: 'ongoing' }),
        placementAPI.getApplications({ student_id: user._id })
      ]);

      setStats(statsRes.data.data);
      setProfile(profileRes.data.data);
      setProfileData(profileRes.data.data);
      setDrives(drivesRes.data.data);
      setApplications(applicationsRes.data.data);
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Failed to load placement data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await placementAPI.updateStudentProfile(profileData);
      toast.success('Profile updated successfully');
      setEditingProfile(false);
      fetchStudentData();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleApplyToDrive = async (e) => {
    e.preventDefault();
    try {
      await placementAPI.applyToDrive({
        drive_id: selectedDrive._id,
        resume_url: applicationForm.resume_url,
        cover_letter: applicationForm.cover_letter
      });
      toast.success('Application submitted successfully');
      setShowApplicationModal(false);
      setApplicationForm({});
      fetchStudentData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    }
  };

  const hasApplied = (driveId) => {
    return applications.some(app => app.drive_id._id === driveId);
  };

  const getApplicationStatus = (driveId) => {
    const app = applications.find(app => app.drive_id._id === driveId);
    return app?.status;
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-yellow-100 text-yellow-800',
      shortlisted: 'bg-blue-100 text-blue-800',
      selected: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Placement Opportunities</h1>
            <p className="text-gray-600">Track your applications and explore job opportunities</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Applications</p>
                  <p className="text-2xl font-bold text-blue-600">{stats?.totalApplications || 0}</p>
                </div>
                <Clock className="text-blue-600" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Shortlisted</p>
                  <p className="text-2xl font-bold text-purple-600">{stats?.shortlisted || 0}</p>
                </div>
                <AlertCircle className="text-purple-600" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Selected</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.selected || 0}</p>
                </div>
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</p>
                </div>
                <AlertCircle className="text-red-600" size={24} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Upcoming Drives</p>
                  <p className="text-2xl font-bold text-orange-600">{stats?.upcomingDrives || 0}</p>
                </div>
                <TrendingUp className="text-orange-600" size={24} />
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">My Profile</h2>
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingProfile ? <X size={20} /> : <Edit2 size={20} />}
                {editingProfile ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">CGPA</label>
                    <input
                      type="number"
                      step="0.01"
                      value={profileData.cgpa || ''}
                      onChange={(e) => setProfileData({ ...profileData, cgpa: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Arrears Count</label>
                    <input
                      type="number"
                      value={profileData.arrears_count || ''}
                      onChange={(e) => setProfileData({ ...profileData, arrears_count: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Resume URL</label>
                    <input
                      type="url"
                      value={profileData.resume_url || ''}
                      onChange={(e) => setProfileData({ ...profileData, resume_url: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Portfolio Link</label>
                    <input
                      type="url"
                      value={profileData.portfolio_link || ''}
                      onChange={(e) => setProfileData({ ...profileData, portfolio_link: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(profileData.skills) ? profileData.skills.join(', ') : ''}
                      onChange={(e) => setProfileData({ ...profileData, skills: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Java, Python, React"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save size={20} />
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">CGPA</p>
                  <p className="text-lg font-semibold">{profile?.cgpa?.toFixed(2) || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Arrears</p>
                  <p className="text-lg font-semibold">{profile?.arrears_count || 0}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Resume</p>
                  <p className="text-sm text-blue-600 truncate">{profile?.resume_url || 'Not uploaded'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Portfolio</p>
                  <p className="text-sm text-blue-600 truncate">{profile?.portfolio_link || 'Not provided'}</p>
                </div>
                <div className="md:col-span-2 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No skills added</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Available Drives */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Available Placement Drives</h2>
            <div className="space-y-4">
              {drives.map(drive => (
                <div key={drive._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-blue-600">{drive.company_id?.name}</h3>
                      <p className="text-gray-700 font-semibold">{drive.job_role}</p>
                      <p className="text-sm text-gray-600 mt-2">{drive.job_description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-sm">
                        <div>
                          <p className="text-gray-600">Package</p>
                          <p className="font-semibold text-green-600">₹{drive.salary_lpa} LPA</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Min CGPA</p>
                          <p className="font-semibold">{drive.eligibility_cgpa}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Drive Date</p>
                          <p className="font-semibold">{new Date(drive.drive_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Deadline</p>
                          <p className="font-semibold">{new Date(drive.application_deadline).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {drive.required_skills && drive.required_skills.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-1">Required Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {drive.required_skills.map((skill, idx) => (
                              <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-between items-end">
                      {hasApplied(drive._id) ? (
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-2">Application Status</p>
                          <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(getApplicationStatus(drive._id))}`}>
                            {getApplicationStatus(drive._id)}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedDrive(drive);
                            setShowApplicationModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {drives.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No active placement drives available</p>
              </div>
            )}
          </div>

          {/* My Applications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">My Applications</h2>
            <div className="space-y-4">
              {applications.map(app => (
                <div key={app._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold">{app.drive_id?.company_id?.name}</h3>
                      <p className="text-gray-700">{app.drive_id?.job_role}</p>
                      <p className="text-sm text-gray-600 mt-1">Applied on: {new Date(app.applied_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-2">Current Status</p>
                      <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                      {app.final_package && (
                        <p className="text-green-600 font-semibold mt-2">₹{app.final_package} LPA</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {applications.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No applications yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedDrive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Apply to {selectedDrive.company_id?.name}</h2>
            <form onSubmit={handleApplyToDrive} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Resume URL</label>
                <input
                  type="url"
                  value={applicationForm.resume_url || ''}
                  onChange={(e) => setApplicationForm({ ...applicationForm, resume_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/resume.pdf"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cover Letter</label>
                <textarea
                  value={applicationForm.cover_letter || ''}
                  onChange={(e) => setApplicationForm({ ...applicationForm, cover_letter: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Tell us why you're interested in this position..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowApplicationModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPlacements;
