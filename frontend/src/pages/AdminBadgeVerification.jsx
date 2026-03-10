import { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import StudentDetailsModal from '../components/StudentDetailsModal';

const AdminBadgeVerification = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  useEffect(() => {
    fetchPending();
    fetchApproved();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get('/badges/pending');
      setPending(res.data.data);
    } catch (error) {
      console.error('Error fetching pending:', error);
    }
  };

  const fetchApproved = async () => {
    try {
      const res = await api.get('/badges/approved');
      setApproved(res.data.data);
    } catch (error) {
      console.error('Error fetching approved:', error);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await api.put(`/badges/approve/${id}`, { action });
      alert(`Certificate ${action}d successfully!`);
      fetchPending();
      fetchApproved();
    } catch (error) {
      alert('Action failed: ' + error.response?.data?.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Badge Certificate Verification</h1>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'pending'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Pending Approvals ({pending.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'approved'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Approved History ({approved.length})
        </button>
      </div>

      {/* Pending Approvals Tab */}
      {activeTab === 'pending' && (
        pending.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No pending certificates to verify
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Roll No</th>
                  <th className="px-4 py-3 text-left">Class</th>
                  <th className="px-4 py-3 text-left">Badge</th>
                  <th className="px-4 py-3 text-left">Submitted</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((item) => (
                  <tr key={item._id} className="border-t">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setSelectedStudent(item.student); setIsStudentModalOpen(true); }}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {item.student?.name}
                      </button>
                    </td>
                    <td className="px-4 py-3">{item.student?.rollNumber}</td>
                    <td className="px-4 py-3">{item.student?.class}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span className="text-2xl">{item.badge?.icon}</span>
                        {item.badge?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setSelectedCert(item); setViewModal(true); }}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
                        >
                          <Eye size={16} /> View
                        </button>
                        <button
                          onClick={() => handleAction(item._id, 'approve')}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex items-center gap-1"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button
                          onClick={() => handleAction(item._id, 'reject')}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center gap-1"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Approved History Tab */}
      {activeTab === 'approved' && (
        approved.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No approved badges yet
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Roll No</th>
                  <th className="px-4 py-3 text-left">Class</th>
                  <th className="px-4 py-3 text-left">Badge</th>
                  <th className="px-4 py-3 text-left">Earned Date</th>
                  <th className="px-4 py-3 text-left">Approved By</th>
                </tr>
              </thead>
              <tbody>
                {approved.map((item) => (
                  <tr key={item._id} className="border-t">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setSelectedStudent(item.student); setIsStudentModalOpen(true); }}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {item.student?.name}
                      </button>
                    </td>
                    <td className="px-4 py-3">{item.student?.rollNumber}</td>
                    <td className="px-4 py-3">{item.student?.class}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span className="text-2xl">{item.badge?.icon}</span>
                        {item.badge?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(item.earnedDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{item.approvedBy?.name || 'Auto-assigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {viewModal && selectedCert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-3/4 max-w-4xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Certificate Preview</h2>
            <div className="mb-4">
              <p><strong>Student:</strong> {selectedCert.student?.name}</p>
              <p><strong>Badge:</strong> {selectedCert.badge?.name}</p>
            </div>
            {selectedCert.certificateUrl?.endsWith('.pdf') ? (
              <iframe
                src={`http://localhost:5000${selectedCert.certificateUrl}`}
                className="w-full h-96 border"
                title="Certificate"
              />
            ) : (
              <img
                src={`http://localhost:5000${selectedCert.certificateUrl}`}
                alt="Certificate"
                className="w-full border"
              />
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleAction(selectedCert._id, 'approve')}
                className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(selectedCert._id, 'reject')}
                className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                Reject
              </button>
              <button
                onClick={() => setViewModal(false)}
                className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <StudentDetailsModal
        student={selectedStudent}
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
      />
    </div>
  );
};

export default AdminBadgeVerification;
