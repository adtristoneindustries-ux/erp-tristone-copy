import { useState, useEffect } from 'react';
import { DollarSign, Award, Users, TrendingUp, Plus, Download, Search, Eye, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';

const AdminFinanceManagement = () => {
  const [finances, setFinances] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showFeeStructureModal, setShowFeeStructureModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ studentId: '', academicYear: '2024-2025', totalFee: '' });
  const [viewData, setViewData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [showEditStructureModal, setShowEditStructureModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [feeStructureForm, setFeeStructureForm] = useState({
    className: '',
    academicYear: '2024-2025',
    components: [{ name: '', amount: '' }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [financeRes, analyticsRes, studentsRes, classesRes, structuresRes] = await Promise.all([
        api.get('/finance'),
        api.get('/finance/analytics'),
        api.get('/users?role=student'),
        api.get('/classes'),
        api.get('/finance/fee-structure')
      ]);
      setFinances(financeRes.data.data);
      setAnalytics(analyticsRes.data.data);
      setStudents(studentsRes.data.data || studentsRes.data.users || []);
      const classesData = Array.isArray(classesRes.data) ? classesRes.data : (classesRes.data.data || []);
      setClasses(classesData);
      setFeeStructures(structuresRes.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleView = async (finance) => {
    try {
      const res = await api.get(`/scholarships?studentId=${finance.student._id}`);
      setViewData({ finance, scholarships: res.data.data || [] });
    } catch (error) {
      console.error(error);
      setViewData({ finance, scholarships: [] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/finance', formData);
      alert('✅ Finance record created successfully!');
      setShowModal(false);
      fetchData();
      setFormData({ studentId: '', academicYear: '2024-2025', totalFee: '' });
    } catch (error) {
      alert('❌ Error: ' + error.response?.data?.message);
    }
  };

  const addComponent = () => {
    setFeeStructureForm({
      ...feeStructureForm,
      components: [...feeStructureForm.components, { name: '', amount: '' }]
    });
  };

  const removeComponent = (index) => {
    const newComponents = feeStructureForm.components.filter((_, i) => i !== index);
    setFeeStructureForm({ ...feeStructureForm, components: newComponents });
  };

  const updateComponent = (index, field, value) => {
    const newComponents = [...feeStructureForm.components];
    newComponents[index][field] = value;
    setFeeStructureForm({ ...feeStructureForm, components: newComponents });
  };

  const calculateTotal = () => {
    return feeStructureForm.components.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  };

  const handleFeeStructureSubmit = async (e) => {
    e.preventDefault();
    try {
      const validComponents = feeStructureForm.components.filter(c => c.name && c.amount);
      if (validComponents.length === 0) {
        alert('❌ Please add at least one fee component');
        return;
      }
      
      if (editingStructure) {
        await api.put(`/finance/fee-structure/${editingStructure._id}`, {
          components: validComponents.map(c => ({ name: c.name, amount: parseFloat(c.amount) }))
        });
        alert('✅ Fee structure updated successfully!');
        setShowEditStructureModal(false);
        setEditingStructure(null);
      } else {
        await api.post('/finance/fee-structure', {
          className: feeStructureForm.className,
          academicYear: feeStructureForm.academicYear,
          components: validComponents.map(c => ({ name: c.name, amount: parseFloat(c.amount) }))
        });
        alert('✅ Fee structure created and assigned to all students in all sections successfully!');
        setShowFeeStructureModal(false);
      }
      fetchData();
      setFeeStructureForm({ className: '', academicYear: '2024-2025', components: [{ name: '', amount: '' }] });
    } catch (error) {
      alert('❌ Error: ' + error.response?.data?.message);
    }
  };

  const handleEditStructure = (structure) => {
    setEditingStructure(structure);
    setFeeStructureForm({
      className: structure.class,
      academicYear: structure.academicYear,
      components: structure.components.map(c => ({ name: c.name, amount: c.amount }))
    });
    setShowEditStructureModal(true);
  };

  const exportData = () => {
    const csv = [
      ['Student Name', 'Roll Number', 'Class', 'Total Fee', 'Scholarship Discount', 'Final Payable', 'Paid', 'Pending'],
      ...finances.map(f => [
        f.student?.name,
        f.student?.rollNumber,
        f.student?.class,
        f.totalFee,
        f.scholarshipDiscount,
        f.finalPayableFee,
        f.paidAmount,
        f.pendingAmount
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance_report.csv';
    a.click();
  };

  const filteredFinances = finances.filter(f =>
    f.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.student?.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fee & Scholarships Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage student fees and scholarship discounts</p>
            </div>
            <div className="flex gap-3">
              <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md">
                <Download size={18} /> Export
              </button>
              <button onClick={() => setShowFeeStructureModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md">
                <Plus size={18} /> Set Class Fee Structure
              </button>
            </div>
          </div>

          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold mt-1">₹{(analytics.totalRevenue / 1000).toFixed(0)}K</p>
                  </div>
                  <DollarSign size={40} className="opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Pending Amount</p>
                    <p className="text-3xl font-bold mt-1">₹{(analytics.totalPending / 1000).toFixed(0)}K</p>
                  </div>
                  <TrendingUp size={40} className="opacity-80" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Scholarship Discounts</p>
                    <p className="text-3xl font-bold mt-1">₹{(analytics.totalScholarship / 1000).toFixed(0)}K</p>
                  </div>
                  <Award size={40} className="opacity-80" />
                </div>
              </div>
            </div>
          )}

          {feeStructures.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-bold mb-4">Fee Structures</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feeStructures.map((structure) => (
                  <div key={structure._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">Class {structure.class}</h3>
                        <p className="text-sm text-gray-600">{structure.academicYear}</p>
                      </div>
                      <button
                        onClick={() => handleEditStructure(structure)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-2">
                      {structure.components.map((comp, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">{comp.name}</span>
                          <span className="font-semibold">₹{comp.amount.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-blue-600">₹{structure.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by student name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Year</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total Fee</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Scholarship</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Payable</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Paid</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Pending</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFinances.map((f) => (
                    <tr key={f._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{f.student?.name}</div>
                          <div className="text-sm text-gray-500">{f.student?.rollNumber} • {f.student?.class}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{f.academicYear}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{f.totalFee.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-green-600">-₹{f.scholarshipDiscount.toLocaleString()}</span>
                          {f.scholarships.length > 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{f.scholarships.length}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-purple-600">₹{f.finalPayableFee.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">₹{f.paidAmount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          f.pendingAmount === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          ₹{f.pendingAmount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleView(f)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                          <Eye size={16} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredFinances.length === 0 && (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No finance records found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFeeStructureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Set Class-wise Fee Structure</h2>
            <form onSubmit={handleFeeStructureSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Academic Year *</label>
                  <input 
                    type="text" 
                    value={feeStructureForm.academicYear} 
                    onChange={(e) => setFeeStructureForm({ ...feeStructureForm, academicYear: e.target.value })} 
                    className="w-full px-3 py-2 border rounded-lg" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Class *</label>
                  <select 
                    value={feeStructureForm.className} 
                    onChange={(e) => setFeeStructureForm({ ...feeStructureForm, className: e.target.value })} 
                    className="w-full px-3 py-2 border rounded-lg" 
                    required
                  >
                    <option value="">Select Class</option>
                    {[...new Set(classes.map(c => c.className))].sort((a, b) => {
                      const numA = parseInt(a);
                      const numB = parseInt(b);
                      return isNaN(numA) || isNaN(numB) ? a.localeCompare(b) : numA - numB;
                    }).map((className) => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Fee will apply to all sections of this class</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Fee Components</h3>
                  <button 
                    type="button" 
                    onClick={addComponent} 
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    <Plus size={16} /> Add Component
                  </button>
                </div>

                <div className="space-y-3">
                  {feeStructureForm.components.map((component, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Component Name (e.g., Tuition Fee)"
                          value={component.name}
                          onChange={(e) => updateComponent(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          required
                        />
                      </div>
                      <div className="w-40">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={component.amount}
                          onChange={(e) => updateComponent(index, 'amount', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          required
                          min="0"
                        />
                      </div>
                      {feeStructureForm.components.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeComponent(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                    <span className="font-bold text-lg">Total Fee Amount:</span>
                    <span className="font-bold text-2xl text-blue-600">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowFeeStructureModal(false);
                    setFeeStructureForm({ className: '', academicYear: '2024-2025', components: [{ name: '', amount: '' }] });
                  }} 
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditStructureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Fee Structure - Class {feeStructureForm.className}</h2>
            <form onSubmit={handleFeeStructureSubmit} className="space-y-4">
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Fee Components</h3>
                  <button 
                    type="button" 
                    onClick={addComponent} 
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    <Plus size={16} /> Add Component
                  </button>
                </div>

                <div className="space-y-3">
                  {feeStructureForm.components.map((component, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Component Name (e.g., Tuition Fee)"
                          value={component.name}
                          onChange={(e) => updateComponent(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          required
                        />
                      </div>
                      <div className="w-40">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={component.amount}
                          onChange={(e) => updateComponent(index, 'amount', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          required
                          min="0"
                        />
                      </div>
                      {feeStructureForm.components.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeComponent(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                    <span className="font-bold text-lg">Total Fee Amount:</span>
                    <span className="font-bold text-2xl text-blue-600">₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditStructureModal(false);
                    setEditingStructure(null);
                    setFeeStructureForm({ className: '', academicYear: '2024-2025', components: [{ name: '', amount: '' }] });
                  }} 
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Update Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Set Student Fee</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student *</label>
                <select value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>{s.name} - {s.rollNumber}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Academic Year *</label>
                <input type="text" value={formData.academicYear} onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Fee (₹) *</label>
                <input type="number" value={formData.totalFee} onChange={(e) => setFormData({ ...formData, totalFee: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Student Details & Scholarships</h2>
              <button onClick={() => setViewData(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-bold text-lg mb-3">Student Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-gray-600">Name:</span> <span className="font-semibold">{viewData.finance.student.name}</span></div>
                  <div><span className="text-gray-600">Roll:</span> <span className="font-semibold">{viewData.finance.student.rollNumber}</span></div>
                  <div><span className="text-gray-600">Class:</span> <span className="font-semibold">{viewData.finance.student.class}</span></div>
                  <div><span className="text-gray-600">Email:</span> <span className="font-semibold text-sm">{viewData.finance.student.email}</span></div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="font-bold text-lg mb-3">Current Fee Structure</h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Total Fee:</span> <span className="font-bold">₹{viewData.finance.totalFee.toLocaleString()}</span></div>
                  <div className="flex justify-between text-green-600"><span>Scholarship Discount:</span> <span className="font-bold">-₹{viewData.finance.scholarshipDiscount.toLocaleString()}</span></div>
                  <div className="flex justify-between border-t pt-2"><span className="font-semibold">Final Payable:</span> <span className="font-bold text-purple-600">₹{viewData.finance.finalPayableFee.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Paid:</span> <span className="font-semibold text-blue-600">₹{viewData.finance.paidAmount.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Pending:</span> <span className="font-semibold text-red-600">₹{viewData.finance.pendingAmount.toLocaleString()}</span></div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-3">Scholarship History</h3>
                {viewData.scholarships.filter(s => s.status === 'Approved').length > 0 ? (
                  <div className="space-y-3">
                    {viewData.scholarships.filter(s => s.status === 'Approved').map((s) => (
                      <div key={s._id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold">{s.scholarshipType} Scholarship</h4>
                            <p className="text-sm text-gray-600">Applied: {new Date(s.appliedDate).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              s.status === 'Approved' ? 'bg-green-100 text-green-800' :
                              s.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              s.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>{s.status}</span>
                            <p className="font-bold text-green-600 mt-1">{s.amountType === 'Percentage' ? `${s.amount}%` : `₹${s.amount}`}</p>
                          </div>
                        </div>
                        {s.staffRemarks && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-semibold text-gray-600 mb-1">Staff Remarks:</p>
                            <p className="text-sm bg-blue-50 p-2 rounded border border-blue-200">{s.staffRemarks}</p>
                            <p className="text-xs text-gray-500 mt-1">By: {s.verifiedBy?.name} on {s.verifiedDate ? new Date(s.verifiedDate).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        )}
                        {s.adminRemarks && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-gray-600 mb-1">Admin Remarks:</p>
                            <p className="text-sm bg-green-50 p-2 rounded border border-green-200">{s.adminRemarks}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No approved scholarship records found</p>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t p-4">
              <button onClick={() => setViewData(null)} className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFinanceManagement;
