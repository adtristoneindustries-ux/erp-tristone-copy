import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, FileText, Download, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { userAPI } from '../services/api';

const AdminFinance = () => {
  const [activeTab, setActiveTab] = useState('fee-collection');
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [feeRecords, setFeeRecords] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, staffRes] = await Promise.all([
        userAPI.getUsers({ role: 'student' }),
        userAPI.getUsers({ role: 'staff' })
      ]);
      
      const studentsList = studentsRes.data.users || studentsRes.data || [];
      const staffList = staffRes.data.users || staffRes.data || [];
      
      setStudents(studentsList);
      setStaff(staffList);
      
      // Generate fee records from students
      const fees = studentsList.map((student, idx) => ({
        id: idx + 1,
        studentId: student._id,
        studentName: student.name,
        department: student.class || 'N/A',
        amount: 5000,
        status: idx % 3 === 0 ? 'pending' : 'paid',
        date: new Date(Date.now() - idx * 86400000).toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
      }));
      setFeeRecords(fees);

      // Generate salary records from staff
      const salaries = staffList.map((member, idx) => ({
        id: idx + 1,
        staffId: member._id,
        staffName: member.name,
        designation: member.designation || 'Teacher',
        salary: 45000 + (idx * 5000),
        status: 'paid',
        month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }));
      setSalaryRecords(salaries);

      // Generate sample expenses
      setExpenses([
        { id: 1, category: 'Infrastructure', description: 'Classroom Renovation', amount: 50000, date: '2024-01-15', status: 'approved' },
        { id: 2, category: 'Utilities', description: 'Electricity Bill', amount: 15000, date: '2024-01-14', status: 'paid' },
        { id: 3, category: 'Supplies', description: 'Stationery Purchase', amount: 8000, date: '2024-01-13', status: 'pending' },
        { id: 4, category: 'Maintenance', description: 'Lab Equipment Repair', amount: 12000, date: '2024-01-12', status: 'approved' }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const tabs = [
    { id: 'fee-collection', label: 'Fee Collection' },
    { id: 'pending-fees', label: 'Pending Fees' },
    { id: 'reports', label: 'Reports' },
    { id: 'salary', label: 'Salary' },
    { id: 'expenses', label: 'Expenses' }
  ];

  const totalCollected = feeRecords.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const pendingAmount = feeRecords.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
  const collectionRate = feeRecords.length > 0 ? Math.round((feeRecords.filter(f => f.status === 'paid').length / feeRecords.length) * 100) : 0;
  const totalSalary = salaryRecords.reduce((sum, s) => sum + s.salary, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const openModal = (type, data = {}) => {
    setModalType(type);
    setFormData(data);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalType === 'expense') {
      const newExpense = {
        id: expenses.length + 1,
        ...formData,
        date: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      setExpenses([newExpense, ...expenses]);
    }
    setShowModal(false);
    setFormData({});
  };

  const updateFeeStatus = (id, status) => {
    setFeeRecords(feeRecords.map(f => f.id === id ? { ...f, status } : f));
  };

  const filteredData = () => {
    let data = [];
    if (activeTab === 'fee-collection') data = feeRecords;
    else if (activeTab === 'pending-fees') data = feeRecords.filter(f => f.status === 'pending');
    else if (activeTab === 'salary') data = salaryRecords;
    else if (activeTab === 'expenses') data = expenses;
    
    if (searchTerm) {
      data = data.filter(item => 
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return data;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <h1 className="text-2xl font-bold mb-6">Financial Management</h1>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md mb-6 overflow-x-auto">
            <div className="flex border-b min-w-max">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {activeTab !== 'salary' && activeTab !== 'expenses' && (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Collected</p>
                      <p className="text-2xl font-bold text-green-600">₹{totalCollected.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <DollarSign className="text-green-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Pending Amount</p>
                      <p className="text-2xl font-bold text-orange-600">₹{pendingAmount.toLocaleString()}</p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-full">
                      <TrendingUp className="text-orange-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Collection Rate</p>
                      <p className="text-2xl font-bold text-purple-600">{collectionRate}%</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <FileText className="text-purple-600" size={24} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'salary' && (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Staff</p>
                      <p className="text-2xl font-bold text-blue-600">{staff.length}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <DollarSign className="text-blue-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Monthly Salary</p>
                      <p className="text-2xl font-bold text-green-600">₹{totalSalary.toLocaleString()}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <TrendingUp className="text-green-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Paid This Month</p>
                      <p className="text-2xl font-bold text-purple-600">{salaryRecords.filter(s => s.status === 'paid').length}</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <FileText className="text-purple-600" size={24} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'expenses' && (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <DollarSign className="text-red-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Pending Approval</p>
                      <p className="text-2xl font-bold text-orange-600">{expenses.filter(e => e.status === 'pending').length}</p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-full">
                      <TrendingUp className="text-orange-600" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">This Month</p>
                      <p className="text-2xl font-bold text-blue-600">₹{totalExpenses.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <FileText className="text-blue-600" size={24} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Fee Collection Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Students:</span>
                    <span className="font-semibold">{students.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fees Collected:</span>
                    <span className="font-semibold text-green-600">₹{totalCollected.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Fees:</span>
                    <span className="font-semibold text-orange-600">₹{pendingAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Collection Rate:</span>
                    <span className="font-semibold text-blue-600">{collectionRate}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Expense Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Expenses:</span>
                    <span className="font-semibold text-red-600">₹{totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Staff Salaries:</span>
                    <span className="font-semibold">₹{totalSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Balance:</span>
                    <span className="font-semibold text-green-600">₹{(totalCollected - totalExpenses - totalSalary).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          {activeTab !== 'reports' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {activeTab === 'pending-fees' ? 'Pending Fees' : 
                   activeTab === 'salary' ? 'Staff Salary Records' :
                   activeTab === 'expenses' ? 'Expense Records' : 'Fee Collection Records'}
                </h2>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {activeTab === 'expenses' && (
                    <button
                      onClick={() => openModal('expense')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus size={18} />
                      Add Expense
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {activeTab === 'salary' ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </>
                      ) : activeTab === 'expenses' ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData().map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        {activeTab === 'salary' ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.staffName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{item.designation}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">₹{item.salary.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{item.month}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {item.status}
                              </span>
                            </td>
                          </>
                        ) : activeTab === 'expenses' ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.category}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600">{item.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">₹{item.amount.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{item.date}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.status === 'paid' ? 'bg-green-100 text-green-800' :
                                item.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.studentName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">{item.department}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">₹{item.amount.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.status === 'paid' ? 'Paid' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                                  <Download size={14} />
                                  Invoice
                                </button>
                                {item.status === 'pending' && (
                                  <button
                                    onClick={() => updateFeeStatus(item.id, 'paid')}
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                                  >
                                    Mark Paid
                                  </button>
                                )}
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Expense</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input
                    type="number"
                    className="w-full border rounded-lg px-3 py-2"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Add Expense
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFinance;
