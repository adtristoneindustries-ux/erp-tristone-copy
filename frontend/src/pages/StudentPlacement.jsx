import { useState, useEffect, useContext } from 'react';
import { Briefcase, Upload, CheckCircle, XCircle, Clock, Award } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function StudentPlacement() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('drives');
  const [drives, setDrives] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [profile, setProfile] = useState({
    cgpa: user?.cgpa || '',
    arrears_count: user?.arrears_count || 0,
    resume_url: user?.resume_url || '',
    skills: user?.skills || [],
    portfolio_link: user?.portfolio_link || '',
    year: user?.year || '',
    department: user?.department || ''
  });
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    fetchData();
    // Update profile from user context
    if (user) {
      setProfile({
        cgpa: user.cgpa || '',
        arrears_count: user.arrears_count || 0,
        resume_url: user.resume_url || '',
        skills: user.skills || [],
        portfolio_link: user.portfolio_link || '',
        year: user.year || '',
        department: user.department || ''
      });
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [drivesRes, applicationsRes, statsRes] = await Promise.all([
        api.get('/placement/drives?status=open'),
        api.get('/placement/applications'),
        api.get('/placement/stats/student')
      ]);
      // Filter drives that haven't expired
      const activeDrives = drivesRes.data.data.filter(drive => 
        new Date(drive.application_deadline) >= new Date()
      );
      setDrives(activeDrives);
      setMyApplications(applicationsRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const applyToDrive = async (driveId) => {
    try {
      await api.post('/placement/applications', { drive_id: driveId });
      alert('Application submitted successfully!');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error applying to drive');
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const profileData = {
        ...profile,
        year: parseInt(profile.year) || 0,
        cgpa: parseFloat(profile.cgpa) || 0,
        arrears_count: parseInt(profile.arrears_count) || 0
      };
      await api.put('/placement/profile/student', profileData);
      
      // Fetch updated user data
      const userRes = await api.get('/auth/me');
      setProfile({
        cgpa: userRes.data.cgpa || '',
        arrears_count: userRes.data.arrears_count || 0,
        resume_url: userRes.data.resume_url || '',
        skills: userRes.data.skills || [],
        portfolio_link: userRes.data.portfolio_link || '',
        year: userRes.data.year || '',
        department: userRes.data.department || ''
      });
      
      alert('Profile updated successfully!');
      setShowProfileModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Update error:', error);
      alert(error.response?.data?.message || 'Error updating profile');
    }
  };

  const isEligible = (drive) => {
    const cgpaEligible = profile.cgpa >= drive.eligibility_cgpa;
    const arrearsEligible = profile.arrears_count <= drive.arrears_limit;
    const deptEligible = !drive.eligible_departments || drive.eligible_departments.length === 0 || drive.eligible_departments.includes(profile.department);
    const yearEligible = !drive.eligible_years || drive.eligible_years.length === 0 || drive.eligible_years.includes(profile.year);
    const deadlineValid = new Date() <= new Date(drive.application_deadline);
    return cgpaEligible && arrearsEligible && deptEligible && yearEligible && deadlineValid;
  };

  const hasApplied = (driveId) => {
    return myApplications.some(app => app.drive_id?._id === driveId);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Placement Portal</h1>
        <p className="text-gray-600">Apply to drives and track your applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard icon={Briefcase} title="Total Applications" value={stats.totalApplications || 0} color="blue" />
        <StatCard icon={CheckCircle} title="Shortlisted" value={stats.shortlisted || 0} color="green" />
        <StatCard icon={Award} title="Selected" value={stats.selected || 0} color="purple" />
        <StatCard icon={XCircle} title="Rejected" value={stats.rejected || 0} color="red" />
      </div>

      {/* Profile Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Year</p>
                <p className="text-lg font-semibold">{user?.year || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Department</p>
                <p className="text-lg font-semibold">{user?.department || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">CGPA</p>
                <p className="text-lg font-semibold">{user?.cgpa || 'Not set'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Arrears</p>
                <p className="text-lg font-semibold">{user?.arrears_count || 0}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Skills</p>
                <p className="text-lg font-semibold">{user?.skills?.length || 0}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Resume</p>
                <p className="text-lg font-semibold">{user?.resume_url ? 'Uploaded' : 'Not uploaded'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowProfileModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Update Profile
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['drives', 'applications'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'drives' ? 'Available Drives' : 'My Applications'}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'drives' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drives.map((drive) => {
                const eligible = isEligible(drive);
                const applied = hasApplied(drive._id);
                
                return (
                  <div key={drive._id} className="border rounded-lg p-6 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold">{drive.company_id?.company_name}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {drive.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-gray-700"><span className="font-medium">Role:</span> {drive.job_role}</p>
                      <p className="text-gray-700"><span className="font-medium">Salary:</span> ₹{drive.salary_lpa} LPA</p>
                      <p className="text-gray-700"><span className="font-medium">Location:</span> {drive.company_id?.location}</p>
                      <p className="text-gray-700">
                        <span className="font-medium">Eligibility:</span> CGPA ≥ {drive.eligibility_cgpa}, Arrears ≤ {drive.arrears_limit}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Departments:</span> {drive.eligible_departments?.length > 0 ? drive.eligible_departments.join(', ') : 'All'}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Years:</span> {drive.eligible_years?.length > 0 ? drive.eligible_years.join(', ') : 'All'}
                      </p>
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Required Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {drive.required_skills?.map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm">
                        Start Date: {new Date(drive.drive_date).toLocaleDateString()}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Deadline: {new Date(drive.application_deadline).toLocaleDateString()}
                      </p>
                    </div>

                    {!eligible && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                        <p className="text-red-800 text-sm font-medium">Not Eligible</p>
                        <p className="text-red-600 text-xs">
                          {profile.cgpa < drive.eligibility_cgpa && 'CGPA requirement not met. '}
                          {profile.arrears_count > drive.arrears_limit && 'Arrears exceed limit. '}
                          {drive.eligible_departments?.length > 0 && !drive.eligible_departments.includes(profile.department) && 'Department not eligible. '}
                          {drive.eligible_years?.length > 0 && !drive.eligible_years.includes(profile.year) && 'Year not eligible. '}
                          {new Date() > new Date(drive.application_deadline) && 'Application deadline passed.'}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => applyToDrive(drive._id)}
                      disabled={!eligible || applied}
                      className={`w-full py-2 rounded-lg font-medium ${
                        applied
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : eligible
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {applied ? 'Already Applied' : eligible ? 'Apply Now' : 'Not Eligible'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-4">
              {myApplications.map((app) => (
                <div key={app._id} className="border rounded-lg p-6 hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {app.drive_id?.company_id?.company_name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <p className="text-gray-700">
                          <span className="font-medium">Role:</span> {app.drive_id?.job_role}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Salary:</span> ₹{app.drive_id?.salary_lpa} LPA
                        </p>
                        <p className="text-gray-500">
                          Applied: {new Date(app.applied_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                        app.current_status === 'Selected' ? 'bg-green-100 text-green-800' :
                        app.current_status === 'Shortlisted' ? 'bg-blue-100 text-blue-800' :
                        app.current_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        app.current_status === 'Interview Scheduled' ? 'bg-purple-100 text-purple-800' :
                        app.current_status === 'Offer Released' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {app.current_status}
                      </span>
                      <p className="text-xs text-gray-500">
                        Updated: {new Date(app.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {myApplications.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No applications yet. Start applying to drives!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Update Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Update Your Profile</h2>
              <form onSubmit={updateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    value={profile.year}
                    onChange={(e) => setProfile({ ...profile, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics and Communication">Electronics and Communication</option>
                    <option value="Electrical and Electronics">Electrical and Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={profile.cgpa}
                    onChange={(e) => setProfile({ ...profile, cgpa: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arrears Count</label>
                  <input
                    type="number"
                    value={profile.arrears_count}
                    onChange={(e) => setProfile({ ...profile, arrears_count: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resume URL</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={profile.resume_url}
                    onChange={(e) => setProfile({ ...profile, resume_url: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload your resume to Google Drive and paste the shareable link</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    placeholder="JavaScript, React, Node.js, Python"
                    value={profile.skills?.join(', ')}
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Link</label>
                  <input
                    type="url"
                    placeholder="https://yourportfolio.com"
                    value={profile.portfolio_link}
                    onChange={(e) => setProfile({ ...profile, portfolio_link: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                    Save Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`${colors[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
