import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Briefcase, TrendingUp, UserCheck } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function AdminPlacement() {
  const [activeTab, setActiveTab] = useState('companies');
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [stats, setStats] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [allApplications, setAllApplications] = useState([]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [statsRes, companiesRes, drivesRes, staffRes, applicationsRes] = await Promise.all([
        api.get('/placement/stats/admin'),
        api.get('/placement/companies'),
        api.get('/placement/drives'),
        api.get('/users?role=staff'),
        api.get('/placement/applications')
      ]);
      setStats(statsRes.data.data);
      setCompanies(companiesRes.data.data);
      setDrives(drivesRes.data.data);
      setAllApplications(applicationsRes.data.data || []);
      
      const staff = staffRes.data.data || staffRes.data;
      setAllStaff(staff);
      const placementOfficers = staff.filter(s => s.hasPlacementAccess);
      setOfficers(placementOfficers);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'company') {
        if (formData._id) {
          await api.put(`/placement/companies/${formData._id}`, formData);
        } else {
          await api.post('/placement/companies', formData);
        }
      } else if (modalType === 'drive') {
        if (formData._id) {
          await api.put(`/placement/drives/${formData._id}`, formData);
        } else {
          await api.post('/placement/drives', formData);
        }
      }
      setShowModal(false);
      setFormData({});
      await fetchData(); // Refresh data after save
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving data');
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/placement/${type}/${id}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting');
    }
  };

  const openModal = (type, data = {}) => {
    setModalType(type);
    // Ensure assigned_officer_id is properly set when editing
    if (type === 'company' && data._id) {
      setFormData({
        ...data,
        assigned_officer_id: data.assigned_officer_id?._id || data.assigned_officer_id || ''
      });
    } else {
      setFormData(data);
    }
    setShowModal(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Placement Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage companies, drives, and placement officers</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 sm:mb-6">
            <StatCard icon={Briefcase} title="Total Companies" value={stats.totalCompanies || 0} color="blue" />
            <StatCard icon={Users} title="Total Applications" value={stats.totalApplications || 0} color="green" />
            <StatCard icon={UserCheck} title="Selected" value={stats.selected || 0} color="purple" />
            <StatCard icon={TrendingUp} title="Ongoing Drives" value={stats.ongoing || 0} color="orange" />
          </div>

          <div className="bg-white rounded-lg shadow mb-4 sm:mb-6">
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="flex -mb-px min-w-max">
                {['companies', 'drives', 'applications', 'officers', 'reports'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium capitalize whitespace-nowrap ${
                      activeTab === tab
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-4 sm:p-6">
              {activeTab === 'companies' && (
                <CompaniesTab
                  companies={companies}
                  onAdd={() => openModal('company')}
                  onEdit={(company) => openModal('company', company)}
                  onDelete={(id) => handleDelete('companies', id)}
                />
              )}
              {activeTab === 'drives' && (
                <DrivesTab
                  drives={drives}
                  companies={companies}
                  allStaff={allStaff}
                  officers={officers}
                />
              )}
              {activeTab === 'applications' && (
                <ApplicationsTab applications={allApplications} />
              )}
              {activeTab === 'officers' && (
                <OfficersTab
                  officers={officers}
                />
              )}
              {activeTab === 'reports' && <ReportsTab stats={stats} />}
            </div>
          </div>

          {showModal && (
            <Modal
              type={modalType}
              data={formData}
              companies={companies}
              allStaff={allStaff}
              onChange={setFormData}
              onSubmit={handleSubmit}
              onClose={() => setShowModal(false)}
            />
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
    orange: 'bg-orange-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1 sm:mt-2">{value}</p>
        </div>
        <div className={`${colors[color]} p-2 sm:p-3 rounded-lg`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function CompaniesTab({ companies, onAdd, onEdit, onDelete }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Companies</h2>
        <button onClick={onAdd} className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 text-sm w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4" /> Add Company
        </button>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Company</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap hidden sm:table-cell">HR Name</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Contact</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap hidden md:table-cell">Location</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company._id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-3 text-sm whitespace-nowrap">{company.company_name}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm whitespace-nowrap hidden sm:table-cell">{company.hr_name}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm whitespace-nowrap">{company.hr_contact}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm whitespace-nowrap hidden md:table-cell">{company.location}</td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(company)} className="text-blue-600 hover:text-blue-800">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(company._id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DrivesTab({ drives }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Placement Drives</h2>
        <p className="text-xs sm:text-sm text-gray-600">Drives are managed by Placement Officers</p>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Company</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Job Role</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap hidden sm:table-cell">Salary</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Status</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap hidden md:table-cell">Officer</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drives.map((drive) => (
                <tr key={drive._id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-3 text-sm whitespace-nowrap">{drive.company_id?.company_name}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm whitespace-nowrap">{drive.job_role}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm whitespace-nowrap hidden sm:table-cell">{drive.salary_lpa} LPA</td>
                  <td className="px-3 sm:px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      drive.status === 'open' ? 'bg-green-100 text-green-800' :
                      drive.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {drive.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-sm whitespace-nowrap hidden md:table-cell">{drive.assigned_officer_id?.name || 'Not Assigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OfficersTab({ officers }) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-2">Placement Officers (Staff Members)</h2>
        <p className="text-sm text-gray-600 mb-4">Staff members assigned to placement drives will see the Placement module in their dashboard.</p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
        <p className="text-xs sm:text-sm text-blue-800">💡 To assign staff to placement: Go to "Drives" tab → Create/Edit Drive → Select staff member in "Assigned Officer" field</p>
        <p className="text-xs sm:text-sm text-blue-800 mt-2">⚠️ Note: Staff member must logout and login again to see the Placement menu in their dashboard</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(officers || []).map((officer) => (
          <div key={officer._id} className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-base sm:text-lg">{officer.name}</h3>
            <p className="text-gray-600 text-xs sm:text-sm">{officer.email}</p>
            <p className="text-gray-600 text-xs sm:text-sm">{officer.department}</p>
            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
              officer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {officer.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApplicationsTab({ applications }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.student_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.student_id?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.drive_id?.company_id?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || app.current_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">All Applications ({applications.length})</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm flex-1 sm:flex-initial"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Applied</p>
          <p className="text-2xl font-bold text-blue-600">{applications.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Shortlisted</p>
          <p className="text-2xl font-bold text-green-600">
            {applications.filter(a => a.current_status === 'Shortlisted').length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Selected</p>
          <p className="text-2xl font-bold text-purple-600">
            {applications.filter(a => a.current_status === 'Selected').length}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {applications.filter(a => a.current_status === 'Rejected').length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Student</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Company</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap hidden sm:table-cell">Role</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap hidden md:table-cell">CGPA</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Status</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap hidden lg:table-cell">Applied Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((app) => (
                <tr key={app._id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-3">
                    <div>
                      <p className="font-medium text-sm">{app.student_id?.name}</p>
                      <p className="text-xs text-gray-500">{app.student_id?.rollNumber}</p>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-sm">{app.drive_id?.company_id?.company_name}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm hidden sm:table-cell">{app.drive_id?.job_role}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm hidden md:table-cell">
                    <span className={`font-semibold ${
                      app.student_id?.cgpa >= 8 ? 'text-green-600' :
                      app.student_id?.cgpa >= 6 ? 'text-blue-600' :
                      'text-orange-600'
                    }`}>
                      {app.student_id?.cgpa?.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
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
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                    {new Date(app.applied_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportsTab({ stats }) {
  const [detailedStats, setDetailedStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetailedStats();
  }, []);

  const fetchDetailedStats = async () => {
    try {
      const res = await api.get('/placement/stats/admin');
      setDetailedStats(res.data.data);
    } catch (error) {
      console.error('Error fetching detailed stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  const displayStats = detailedStats || stats;

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Placement Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3 className="font-semibold text-sm sm:text-base mb-4">Application Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Applications:</span>
              <span className="font-semibold">{displayStats.totalApplications || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shortlisted:</span>
              <span className="font-semibold text-blue-600">{displayStats.shortlisted || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Selected:</span>
              <span className="font-semibold text-green-600">{displayStats.selected || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Rejected:</span>
              <span className="font-semibold text-red-600">{displayStats.rejected || 0}</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3 className="font-semibold text-sm sm:text-base mb-4">Drive Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Drives:</span>
              <span className="font-semibold">{displayStats.totalDrives || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Ongoing:</span>
              <span className="font-semibold text-orange-600">{displayStats.ongoing || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Companies:</span>
              <span className="font-semibold">{displayStats.totalCompanies || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Modal({ type, data, companies, allStaff, onChange, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">
            {data._id ? 'Edit' : 'Add'} {type === 'company' ? 'Company' : type === 'drive' ? 'Drive' : 'Officer'}
          </h2>
          <form onSubmit={onSubmit} className="space-y-4">
            {type === 'company' && (
              <>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={data.company_name || ''}
                  onChange={(e) => onChange({ ...data, company_name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base"
                  required
                />
                <input
                  type="text"
                  placeholder="HR Name"
                  value={data.hr_name || ''}
                  onChange={(e) => onChange({ ...data, hr_name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base"
                  required
                />
                <input
                  type="text"
                  placeholder="HR Contact"
                  value={data.hr_contact || ''}
                  onChange={(e) => onChange({ ...data, hr_contact: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base"
                  required
                />
                <input
                  type="email"
                  placeholder="HR Email"
                  value={data.hr_email || ''}
                  onChange={(e) => onChange({ ...data, hr_email: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base"
                  required
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={data.location || ''}
                  onChange={(e) => onChange({ ...data, location: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base"
                  required
                />
                <select
                  value={data.assigned_officer_id || ''}
                  onChange={(e) => onChange({ ...data, assigned_officer_id: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base"
                >
                  <option value="">Select Staff/Officer (Optional)</option>
                  {(allStaff || []).map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name} - {staff.department}
                    </option>
                  ))}
                </select>
                {data.assigned_officer_id && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-800">
                      ✓ Selected: {(allStaff || []).find(s => s._id === data.assigned_officer_id)?.name || 'Staff'} - {(allStaff || []).find(s => s._id === data.assigned_officer_id)?.department || ''}
                    </p>
                  </div>
                )}
              </>
            )}
            {type === 'drive' && (
              <>
                <select
                  value={data.company_id || ''}
                  onChange={(e) => onChange({ ...data, company_id: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base"
                  required
                >
                  <option value="">Select Company</option>
                  {(companies || []).map((c) => (
                    <option key={c._id} value={c._id}>{c.company_name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Job Role"
                  value={data.job_role || ''}
                  onChange={(e) => onChange({ ...data, job_role: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base"
                  required
                />
                <input
                  type="number"
                  placeholder="Salary (LPA)"
                  value={data.salary_lpa || ''}
                  onChange={(e) => onChange({ ...data, salary_lpa: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base"
                  required
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Eligibility CGPA"
                  value={data.eligibility_cgpa || ''}
                  onChange={(e) => onChange({ ...data, eligibility_cgpa: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base"
                  required
                />
                <input
                  type="number"
                  placeholder="Arrears Limit"
                  value={data.arrears_limit || ''}
                  onChange={(e) => onChange({ ...data, arrears_limit: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base"
                  required
                />
                <input
                  type="text"
                  placeholder="Required Skills (comma separated)"
                  value={data.required_skills?.join(', ') || ''}
                  onChange={(e) => onChange({ ...data, required_skills: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base"
                />
                <input
                  type="date"
                  value={data.drive_date?.split('T')[0] || ''}
                  onChange={(e) => onChange({ ...data, drive_date: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base"
                  required
                />
                <select
                  value={data.status || 'open'}
                  onChange={(e) => onChange({ ...data, status: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base"
                >
                  <option value="open">Open</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={data.assigned_officer_id || ''}
                  onChange={(e) => onChange({ ...data, assigned_officer_id: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 border rounded-lg text-sm sm:text-base"
                >
                  <option value="">Select Staff Member</option>
                  {(allStaff || []).map((staff) => (
                    <option key={staff._id} value={staff._id}>{staff.name} - {staff.department}</option>
                  ))}
                </select>
              </>
            )}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 text-sm sm:text-base">
                Save
              </button>
              <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 text-sm sm:text-base">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
