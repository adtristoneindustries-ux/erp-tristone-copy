import { useState, useEffect } from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SearchableSelect from '../components/SearchableSelect';
import { userAPI, classAPI, disciplineAPI } from '../services/api';
import { useAlert } from '../hooks/useAlert';

const AdminDiscipline = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [formData, setFormData] = useState({ selectedClass: '', selectedSection: '', selectedStudent: '', name: '', id: '', offenseType: '', actionStatus: '', description: '' });
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useAlert();

  const disciplineTypes = {
    student: ['Late Arrival', 'Uniform Violation', 'Misbehavior', 'Academic Dishonesty', 'Absence'],
    staff: ['Late Arrival', 'Absence', 'Policy Violation', 'Misconduct', 'Other']
  };

  const statusOptions = ['Pending', 'Warning', 'Resolved', 'Escalated'];

  useEffect(() => {
    fetchClasses();
    fetchRecords();
    if (activeTab === 'staff') {
      fetchStaff();
    }
  }, [activeTab]);

  useEffect(() => {
    if (formData.selectedClass) {
      const uniqueSections = [...new Set(classes.filter(c => c.className === formData.selectedClass).map(c => c.section))];
      setSections(uniqueSections);
      setFormData(prev => ({ ...prev, selectedSection: '', selectedStudent: '', name: '', id: '' }));
      setStudents([]);
    }
  }, [formData.selectedClass, classes]);

  useEffect(() => {
    if (formData.selectedClass && formData.selectedSection) {
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [formData.selectedClass, formData.selectedSection]);

  useEffect(() => {
    if (formData.selectedStudent) {
      const student = students.find(s => s._id === formData.selectedStudent);
      if (student) {
        setFormData(prev => ({ ...prev, name: student.name, id: student.studentId || student._id }));
      }
    } else if (activeTab === 'staff' && formData.selectedStudent) {
      const staffMember = staff.find(s => s._id === formData.selectedStudent);
      if (staffMember) {
        setFormData(prev => ({ ...prev, name: staffMember.name, id: staffMember.staffId || staffMember._id }));
      }
    }
  }, [formData.selectedStudent, students, staff, activeTab]);

  const fetchClasses = async () => {
    try {
      const res = await classAPI.getClasses();
      setClasses(res.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      console.log('Fetching students with filters:', { role: 'student', class: formData.selectedClass, section: formData.selectedSection });
      const res = await userAPI.getUsers({ role: 'student', class: formData.selectedClass, section: formData.selectedSection });
      console.log('Fetched students:', res.data);
      setStudents(res.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await userAPI.getUsers({ role: 'staff' });
      setStaff(res.data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await disciplineAPI.getDisciplineRecords({ role: activeTab });
      setRecords(res.data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await disciplineAPI.addDisciplineRecord({
        userId: formData.selectedStudent,
        offenseType: formData.offenseType,
        actionStatus: formData.actionStatus,
        description: formData.description
      });
      showSuccess('Discipline record added successfully');
      setFormData({ selectedClass: '', selectedSection: '', selectedStudent: '', name: '', id: '', offenseType: '', actionStatus: '', description: '' });
      setStudents([]);
      setSections([]);
      fetchRecords();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add discipline record');
    }
    setLoading(false);
  };

  const filteredRecords = records.filter(r => {
    if (r.role !== activeTab) return false;
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      r.name?.toLowerCase().includes(search) ||
      r.userId?.toLowerCase().includes(search) ||
      r.offenseType?.toLowerCase().includes(search) ||
      r.actionStatus?.toLowerCase().includes(search) ||
      r.description?.toLowerCase().includes(search)
    );
  });

  const classOptions = [...new Set(classes.map(c => c.className))].map(className => ({
    value: className,
    label: className
  }));

  const sectionOptions = sections.map(section => ({
    value: section,
    label: section
  }));

  const studentOptions = students.map(student => ({
    value: student._id,
    label: `${student.name} (${student.rollNumber || student._id})`
  }));

  const staffOptions = staff.map(member => ({
    value: member._id,
    label: `${member.name} (${member.staffId || member._id})`
  }));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="mb-4 lg:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Discipline Oversight</h1>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm lg:text-base">Manage discipline records for students and staff</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => {
                  setActiveTab('student');
                  setFormData({ selectedClass: '', selectedSection: '', selectedStudent: '', name: '', id: '', offenseType: '', actionStatus: '', description: '' });
                  setStudents([]);
                  setSections([]);
                  fetchRecords();
                }}
                className={`flex-1 px-3 sm:px-4 lg:px-6 py-3 lg:py-4 text-center text-sm lg:text-base font-medium transition-colors ${
                  activeTab === 'student'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => {
                  setActiveTab('staff');
                  setFormData({ selectedClass: '', selectedSection: '', selectedStudent: '', name: '', id: '', offenseType: '', actionStatus: '', description: '' });
                  setStudents([]);
                  setSections([]);
                  fetchRecords();
                }}
                className={`flex-1 px-3 sm:px-4 lg:px-6 py-3 lg:py-4 text-center text-sm lg:text-base font-medium transition-colors ${
                  activeTab === 'staff'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Staff
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Add Discipline Record</h2>
            <form onSubmit={handleSubmit}>
              {activeTab === 'student' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <SearchableSelect
                    label="Class"
                    options={classOptions}
                    value={formData.selectedClass}
                    onChange={(value) => setFormData({ ...formData, selectedClass: value })}
                    placeholder="Select Class"
                  />
                  <SearchableSelect
                    label="Section"
                    options={sectionOptions}
                    value={formData.selectedSection}
                    onChange={(value) => setFormData({ ...formData, selectedSection: value })}
                    placeholder="Select Section"
                    disabled={!formData.selectedClass}
                  />
                  <SearchableSelect
                    label="Student"
                    options={studentOptions}
                    value={formData.selectedStudent}
                    onChange={(value) => setFormData({ ...formData, selectedStudent: value })}
                    placeholder="Select Student"
                    disabled={!formData.selectedSection}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="sm:col-span-2">
                    <SearchableSelect
                      label="Staff Member"
                      options={staffOptions}
                      value={formData.selectedStudent}
                      onChange={(value) => setFormData({ ...formData, selectedStudent: value })}
                      placeholder="Select Staff Member"
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-sm"
                    placeholder="Auto-filled after selection"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID</label>
                  <input
                    type="text"
                    value={formData.id}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed text-sm"
                    placeholder="Auto-filled after selection"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Offense Type</label>
                  <select
                    value={formData.offenseType}
                    onChange={(e) => setFormData({ ...formData, offenseType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  >
                    <option value="">Select Offense Type</option>
                    {disciplineTypes[activeTab].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action Status</label>
                  <select
                    value={formData.actionStatus}
                    onChange={(e) => setFormData({ ...formData, actionStatus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  >
                    <option value="">Select Action Status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  placeholder="Enter detailed description of the incident..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Record'}
              </button>
            </form>
          </div>

          {/* Recent Records */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="text-orange-600" size={20} />
                Recent Records
              </h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search records..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="space-y-3">
              {filteredRecords.length > 0 ? (
                filteredRecords.map(record => (
                  <div key={record._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{record.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">ID: {record.userId || record._id}</p>
                        {record.class && <p className="text-xs text-gray-500">Class: {record.class} - {record.section}</p>}
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full self-start ${
                        record.actionStatus === 'Resolved' ? 'bg-green-100 text-green-800' :
                        record.actionStatus === 'Warning' ? 'bg-yellow-100 text-yellow-800' :
                        record.actionStatus === 'Escalated' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {record.actionStatus}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-700">{record.offenseType}</p>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{record.description}</p>
                      </div>
                      <p className="text-xs text-gray-500 self-start sm:self-auto">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8 text-sm">No records found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDiscipline;
