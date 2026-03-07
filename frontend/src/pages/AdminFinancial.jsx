import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function AdminFinancial() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ student: '', academicYear: '', totalAmount: '', dueDate: '' });

  useEffect(() => {
    fetchFees();
    fetchStudents();
  }, []);

  const fetchFees = async () => {
    const { data } = await axios.get('http://localhost:5000/api/fees', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setFees(data);
  };

  const fetchStudents = async () => {
    const { data } = await axios.get('http://localhost:5000/api/users?role=student', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    setStudents(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/fees', 
      { ...formData, dueAmount: formData.totalAmount },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
    );
    setShowModal(false);
    fetchFees();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 overflow-x-hidden">
        <Navbar />
        <div className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">Financial Management</h1>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto hover:bg-blue-700">Add Fee</button>
          </div>

          <div className="overflow-x-auto mb-6" style={{scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6'}}>
            <div className="flex gap-4 lg:grid lg:grid-cols-3 lg:gap-4 pb-2">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow min-w-[180px]">
                <h3 className="text-gray-500 text-sm mb-2">Total Revenue</h3>
                <p className="text-xl md:text-2xl font-bold text-green-600">₹{fees.reduce((a, b) => a + b.paidAmount, 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow min-w-[180px]">
                <h3 className="text-gray-500 text-sm mb-2">Pending Amount</h3>
                <p className="text-xl md:text-2xl font-bold text-orange-600">₹{fees.reduce((a, b) => a + b.dueAmount, 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 md:p-6 rounded-lg shadow min-w-[180px]">
                <h3 className="text-gray-500 text-sm mb-2">Total Students</h3>
                <p className="text-xl md:text-2xl font-bold text-blue-600">{fees.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div style={{overflowX: 'scroll', overflowY: 'scroll', maxHeight: '500px', WebkitOverflowScrolling: 'touch'}}>
              <div style={{minWidth: '1200px'}}>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {fees.map(fee => (
                      <tr key={fee._id} className="hover:bg-gray-50">
                        <td className="px-3 md:px-4 py-3 text-sm">{fee.student?.name}</td>
                        <td className="px-3 md:px-4 py-3 text-sm">{fee.academicYear}</td>
                        <td className="px-3 md:px-4 py-3 text-sm font-medium">₹{fee.totalAmount?.toLocaleString()}</td>
                        <td className="px-3 md:px-4 py-3 text-sm font-medium text-green-600">₹{fee.paidAmount?.toLocaleString()}</td>
                        <td className="px-3 md:px-4 py-3 text-sm font-medium text-red-600">₹{fee.dueAmount?.toLocaleString()}</td>
                        <td className="px-3 md:px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${fee.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                            {fee.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-lg md:text-xl font-bold mb-4">Add Fee</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <select className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onChange={(e) => setFormData({...formData, student: e.target.value})} required>
                    <option value="">Select Student</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                  <input type="text" placeholder="Academic Year (e.g., 2023-2024)" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onChange={(e) => setFormData({...formData, academicYear: e.target.value})} required />
                  <input type="number" placeholder="Total Amount" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onChange={(e) => setFormData({...formData, totalAmount: e.target.value})} required />
                  <input type="date" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onChange={(e) => setFormData({...formData, dueDate: e.target.value})} required />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium">Submit</button>
                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-400 font-medium">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
