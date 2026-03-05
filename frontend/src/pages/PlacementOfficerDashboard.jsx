import { useState, useEffect } from 'react';
import { Briefcase, Users, Download, Search, Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function PlacementOfficerDashboard() {
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [companies, setCompanies] = useState([]);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveFormData, setDriveFormData] = useState({});
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  useEffect(() => {
    fetchDrives();
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedDrive) {
      fetchApplications(selectedDrive._id);
    }
  }, [selectedDrive]);

  const fetchDrives = async () => {
    try {
      const res = await api.get('/placement/drives');
      setDrives(res.data.data);
    } catch (error) {
      console.error('Error fetching drives:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/placement/companies');
      setCompanies(res.data.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchApplications = async (driveId) => {
    try {
      const res = await api.get(`/placement/applications?drive_id=${driveId}`);
      setApplications(res.data.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      await api.put(`/placement/applications/${applicationId}/status`, { status });
      fetchApplications(selectedDrive._id);
      alert('Status updated successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating status');
    }
  };

  const handleDriveSubmit = async (e) => {
    e.preventDefault();
    try {
      if (driveFormData._id) {
        await api.put(`/placement/drives/${driveFormData._id}`, driveFormData);
      } else {
        await api.post('/placement/drives', driveFormData);
      }
      setShowDriveModal(false);
      setDriveFormData({});
      fetchDrives();
      alert('Drive saved successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving drive');
    }
  };

  const handleDeleteDrive = async (driveId) => {
    if (!confirm('Are you sure you want to delete this drive?')) return;
    try {
      await api.delete(`/placement/drives/${driveId}`);
      fetchDrives();
      alert('Drive deleted successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting drive');
    }
  };

  const openDriveModal = (drive = {}) => {
    setDriveFormData({
      ...drive,
      eligible_departments: drive.eligible_departments || [],
      eligible_years: drive.eligible_years || []
    });
    setShowDriveModal(true);
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.student_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.student_id?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || app.current_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Placement Officer Dashboard</h1>
        <p className="text-gray-600">Manage placement drives and student applications</p>
      </div>

      {/* Drives List */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Companies</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {companies.map((company) => (
            <div key={company._id} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">{company.company_name}</h3>
              <p className="text-sm text-gray-600">HR: {company.hr_name}</p>
              <p className="text-sm text-gray-600">Contact: {company.hr_contact}</p>
              <p className="text-sm text-gray-600">Location: {company.location}</p>
              <p className="text-xs text-gray-500 mt-2">Added: {new Date(company.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Placement Drives</h2>
          <button
            onClick={() => openDriveModal()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" /> Create Drive
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drives.map((drive) => (
            <div
              key={drive._id}
              onClick={() => setSelectedDrive(drive)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                selectedDrive?._id === drive._id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{drive.company_id?.company_name}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); openDriveModal(drive); }}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteDrive(drive._id); }}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                drive.status === 'open' ? 'bg-green-100 text-green-800' :
                drive.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {drive.status}
              </span>
              <p className="text-gray-600 text-sm mb-1">{drive.job_role}</p>
              <p className="text-gray-800 font-semibold">₹{drive.salary_lpa} LPA</p>
              <p className="text-gray-500 text-xs mt-2">
                CGPA: {drive.eligibility_cgpa} | Arrears: {drive.arrears_limit}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      {selectedDrive && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-semibold">Applications for {selectedDrive.company_id?.company_name}</h2>
              <p className="text-gray-600 text-sm">{filteredApplications.length} applicants</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="">All Status</option>
                <option value="Applied">Applied</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Rejected">Rejected</option>
                <option value="Interview Scheduled">Interview Scheduled</option>
                <option value="On Going">On Going</option>
                <option value="Selected">Selected</option>
                <option value="Offer Released">Offer Released</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CGPA</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrears</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skills</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resume</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{app.student_id?.name}</p>
                        <p className="text-xs text-gray-500">{app.student_id?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{app.student_id?.rollNumber}</td>
                    <td className="px-4 py-3">{app.student_id?.department}</td>
                    <td className="px-4 py-3">{app.student_id?.year}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${
                        app.student_id?.cgpa >= 8 ? 'text-green-600' :
                        app.student_id?.cgpa >= 6 ? 'text-blue-600' :
                        'text-orange-600'
                      }`}>
                        {app.student_id?.cgpa?.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        app.student_id?.arrears_count === 0 ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.student_id?.arrears_count || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {app.student_id?.skills?.slice(0, 2).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                        {app.student_id?.skills?.length > 2 && (
                          <span className="text-xs text-gray-500">+{app.student_id.skills.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {app.student_id?.resume_url ? (
                        <a
                          href={app.student_id.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          <span className="text-sm">View</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">No resume</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                        app.current_status === 'Selected' ? 'bg-green-100 text-green-800' :
                        app.current_status === 'Shortlisted' ? 'bg-blue-100 text-blue-800' :
                        app.current_status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        app.current_status === 'Interview Scheduled' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {app.current_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={app.current_status}
                        onChange={(e) => updateStatus(app._id, e.target.value)}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="On Going">On Going</option>
                        <option value="Selected">Selected</option>
                        <option value="Offer Released">Offer Released</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drive Modal */}
      {showDriveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{driveFormData._id ? 'Edit' : 'Create'} Placement Drive</h2>
              <form onSubmit={handleDriveSubmit} className="space-y-4">
                <select
                  value={driveFormData.company_id || ''}
                  onChange={(e) => setDriveFormData({ ...driveFormData, company_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Company</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>{c.company_name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Job Role"
                  value={driveFormData.job_role || ''}
                  onChange={(e) => setDriveFormData({ ...driveFormData, job_role: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  placeholder="Salary (LPA)"
                  value={driveFormData.salary_lpa || ''}
                  onChange={(e) => setDriveFormData({ ...driveFormData, salary_lpa: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Eligibility CGPA"
                  value={driveFormData.eligibility_cgpa || ''}
                  onChange={(e) => setDriveFormData({ ...driveFormData, eligibility_cgpa: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  placeholder="Arrears Limit"
                  value={driveFormData.arrears_limit || ''}
                  onChange={(e) => setDriveFormData({ ...driveFormData, arrears_limit: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Required Skills (comma separated)"
                  value={driveFormData.required_skills?.join(', ') || ''}
                  onChange={(e) => setDriveFormData({ ...driveFormData, required_skills: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Drive Start Date</label>
                  <input
                    type="date"
                    value={driveFormData.drive_date?.split('T')[0] || ''}
                    onChange={(e) => setDriveFormData({ ...driveFormData, drive_date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline (End Date)</label>
                  <input
                    type="date"
                    value={driveFormData.application_deadline?.split('T')[0] || ''}
                    onChange={(e) => setDriveFormData({ ...driveFormData, application_deadline: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eligible Departments</label>
                  <div
                    onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                    className="w-full px-4 py-2 border rounded-lg cursor-pointer bg-white min-h-[42px] flex flex-wrap gap-1 items-center"
                  >
                    {(driveFormData.eligible_departments || []).length === 0 ? (
                      <span className="text-gray-400">Select departments</span>
                    ) : (
                      (driveFormData.eligible_departments || []).map((dept) => (
                        <span key={dept} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                          {dept}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDriveFormData({
                                ...driveFormData,
                                eligible_departments: (driveFormData.eligible_departments || []).filter(d => d !== dept)
                              });
                            }}
                            className="text-blue-600 hover:text-blue-800 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  {showDeptDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {['Computer Science', 'Information Technology', 'Electronics and Communication', 'Electrical and Electronics', 'Mechanical', 'Civil'].map((dept) => (
                        <label key={dept} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(driveFormData.eligible_departments || []).includes(dept)}
                            onChange={(e) => {
                              const current = driveFormData.eligible_departments || [];
                              setDriveFormData({
                                ...driveFormData,
                                eligible_departments: e.target.checked
                                  ? [...current, dept]
                                  : current.filter(d => d !== dept)
                              });
                            }}
                            className="mr-2"
                          />
                          {dept}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eligible Years</label>
                  <div
                    onClick={() => setShowYearDropdown(!showYearDropdown)}
                    className="w-full px-4 py-2 border rounded-lg cursor-pointer bg-white min-h-[42px] flex flex-wrap gap-1 items-center"
                  >
                    {(driveFormData.eligible_years || []).length === 0 ? (
                      <span className="text-gray-400">Select years</span>
                    ) : (
                      (driveFormData.eligible_years || []).map((year) => (
                        <span key={year} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                          {year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDriveFormData({
                                ...driveFormData,
                                eligible_years: (driveFormData.eligible_years || []).filter(y => y !== year)
                              });
                            }}
                            className="text-green-600 hover:text-green-800 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                  {showYearDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                      {[1, 2, 3, 4].map((year) => (
                        <label key={year} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(driveFormData.eligible_years || []).includes(year)}
                            onChange={(e) => {
                              const current = driveFormData.eligible_years || [];
                              setDriveFormData({
                                ...driveFormData,
                                eligible_years: e.target.checked
                                  ? [...current, year]
                                  : current.filter(y => y !== year)
                              });
                            }}
                            className="mr-2"
                          />
                          {year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <select
                  value={driveFormData.status || 'open'}
                  onChange={(e) => setDriveFormData({ ...driveFormData, status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="open">Open</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="closed">Closed</option>
                </select>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDriveModal(false)}
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
