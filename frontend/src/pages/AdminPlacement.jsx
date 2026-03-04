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

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [statsRes, companiesRes, drivesRes, staffRes] = await Promise.all([
        api.get('/placement/stats/admin'),
        api.get('/placement/companies'),
        api.get('/placement/drives'),
        api.get('/users?role=staff')
      ]);
      setStats(statsRes.data.data);
      setCompanies(companiesRes.data.data);
      setDrives(drivesRes.data.data);
      
      const staff = staffRes.data.data || staffRes.data;
      setAllStaff(staff);
      // Filter staff who have placement access for Officers tab
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
      fetchData();
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
    setFormData(data);
    setShowModal(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Placement Management</h1>
        <p className="text-gray-600">Manage companies, drives, and placement officers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard icon={Briefcase} title="Total Companies" value={stats.totalCompanies || 0} color="blue" />
        <StatCard icon={Users} title="Total Applications" value={stats.totalApplications || 0} color="green" />
        <StatCard icon={UserCheck} title="Selected" value={stats.selected || 0} color="purple" />
        <StatCard icon={TrendingUp} title="Ongoing Drives" value={stats.ongoing || 0} color="orange" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['companies', 'drives', 'officers', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize ${
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

        <div className="p-6">
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
          {activeTab === 'officers' && (
            <OfficersTab
              officers={officers}
            />
          )}
          {activeTab === 'reports' && <ReportsTab stats={stats} />}
        </div>
      </div>

      {/* Modal */}
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

function CompaniesTab({ companies, onAdd, onEdit, onDelete }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Companies</h2>
        <button onClick={onAdd} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600">
          <Plus className="w-4 h-4" /> Add Company
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HR Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{company.company_name}</td>
                <td className="px-4 py-3">{company.hr_name}</td>
                <td className="px-4 py-3">{company.hr_contact}</td>
                <td className="px-4 py-3">{company.location}</td>
                <td className="px-4 py-3">
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
  );
}

function DrivesTab({ drives, companies, allStaff, officers }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Placement Drives</h2>
        <p className="text-sm text-gray-600">Drives are managed by Placement Officers</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary (LPA)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Officer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {drives.map((drive) => (
              <tr key={drive._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{drive.company_id?.company_name}</td>
                <td className="px-4 py-3">{drive.job_role}</td>
                <td className="px-4 py-3">{drive.salary_lpa}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    drive.status === 'open' ? 'bg-green-100 text-green-800' :
                    drive.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {drive.status}
                  </span>
                </td>
                <td className="px-4 py-3">{drive.assigned_officer_id?.name || 'Not Assigned'}</td>
                <td className="px-4 py-3">
                  <span className="text-gray-500 text-sm">Managed by Officer</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OfficersTab({ officers }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Placement Officers (Staff Members)</h2>
      </div>
      <p className="text-gray-600 mb-4">Staff members assigned to placement drives will see the Placement module in their dashboard.</p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800">💡 To assign staff to placement: Go to "Drives" tab → Create/Edit Drive → Select staff member in "Assigned Officer" field</p>
        <p className="text-sm text-blue-800 mt-2">⚠️ Note: Staff member must logout and login again to see the Placement menu in their dashboard</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(officers || []).map((officer) => (
          <div key={officer._id} className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg">{officer.name}</h3>
            <p className="text-gray-600 text-sm">{officer.email}</p>
            <p className="text-gray-600 text-sm">{officer.department}</p>
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

function ReportsTab({ stats }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Placement Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Application Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Applications:</span>
              <span className="font-semibold">{stats.totalApplications || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Shortlisted:</span>
              <span className="font-semibold text-blue-600">{stats.shortlisted || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Selected:</span>
              <span className="font-semibold text-green-600">{stats.selected || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Rejected:</span>
              <span className="font-semibold text-red-600">{stats.rejected || 0}</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Drive Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Drives:</span>
              <span className="font-semibold">{stats.totalDrives || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongoing:</span>
              <span className="font-semibold text-orange-600">{stats.ongoing || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Companies:</span>
              <span className="font-semibold">{stats.totalCompanies || 0}</span>
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
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
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
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="HR Name"
                  value={data.hr_name || ''}
                  onChange={(e) => onChange({ ...data, hr_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="HR Contact"
                  value={data.hr_contact || ''}
                  onChange={(e) => onChange({ ...data, hr_contact: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="email"
                  placeholder="HR Email"
                  value={data.hr_email || ''}
                  onChange={(e) => onChange({ ...data, hr_email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={data.location || ''}
                  onChange={(e) => onChange({ ...data, location: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <select
                  value={data.assigned_officer_id || ''}
                  onChange={(e) => onChange({ ...data, assigned_officer_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select Staff/Officer (Optional)</option>
                  {(allStaff || []).map((staff) => (
                    <option key={staff._id} value={staff._id}>{staff.name} - {staff.department}</option>
                  ))}
                </select>
              </>
            )}
            {type === 'drive' && (
              <>
                <select
                  value={data.company_id || ''}
                  onChange={(e) => onChange({ ...data, company_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
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
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  placeholder="Salary (LPA)"
                  value={data.salary_lpa || ''}
                  onChange={(e) => onChange({ ...data, salary_lpa: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Eligibility CGPA"
                  value={data.eligibility_cgpa || ''}
                  onChange={(e) => onChange({ ...data, eligibility_cgpa: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  placeholder="Arrears Limit"
                  value={data.arrears_limit || ''}
                  onChange={(e) => onChange({ ...data, arrears_limit: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="text"
                  placeholder="Required Skills (comma separated)"
                  value={data.required_skills?.join(', ') || ''}
                  onChange={(e) => onChange({ ...data, required_skills: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="date"
                  value={data.drive_date?.split('T')[0] || ''}
                  onChange={(e) => onChange({ ...data, drive_date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <select
                  value={data.status || 'open'}
                  onChange={(e) => onChange({ ...data, status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="open">Open</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={data.assigned_officer_id || ''}
                  onChange={(e) => onChange({ ...data, assigned_officer_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select Staff Member</option>
                  {(allStaff || []).map((staff) => (
                    <option key={staff._id} value={staff._id}>{staff.name} - {staff.department}</option>
                  ))}
                </select>
              </>
            )}
            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                Save
              </button>
              <button type="button" onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
