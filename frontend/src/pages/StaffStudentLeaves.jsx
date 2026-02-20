import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { leaveRequestAPI } from '../services/api';
import { FileText } from 'lucide-react';

const StaffStudentLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [response, setResponse] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      // Staff sees student leave requests
      const response = await leaveRequestAPI.getLeaveRequests();
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const handleStatusUpdate = async (leaveId, status) => {
    try {
      await leaveRequestAPI.updateLeaveRequestStatus(leaveId, { 
        status, 
        staffReason: response 
      });
      setShowModal(false);
      setResponse('');
      setSelectedLeave(null);
      fetchLeaves();
    } catch (error) {
      console.error('Error updating leave status:', error);
    }
  };

  const openModal = (leave) => {
    setSelectedLeave(leave);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const columns = [
    { header: 'Student', render: (row) => (
      <div className="min-w-0">
        <div className="font-medium text-sm truncate max-w-[100px] sm:max-w-none">{row.user?.name}</div>
        <div className="text-xs text-gray-500 truncate max-w-[100px] sm:max-w-none">{row.user?.email}</div>
        <div className="text-xs text-gray-500">{row.user?.class} - {row.user?.section}</div>
      </div>
    )},
    { header: 'Type', render: (row) => (
      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">
        {row.leaveType}
      </span>
    )},
    { header: 'Dates', render: (row) => (
      <div className="text-xs">
        <div>{new Date(row.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
        <div className="text-gray-500">to {new Date(row.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
      </div>
    )},
    { header: 'Status', render: (row) => (
      <div>
        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(row.status)}`}>
          {row.status.charAt(0).toUpperCase()}
        </span>
        <div className="mt-1 text-xs text-gray-500 truncate max-w-[80px]" title={row.reason}>
          {row.reason}
        </div>
      </div>
    )},
    { header: 'Actions', render: (row) => (
      row.status === 'pending' ? (
        <button
          onClick={() => openModal(row)}
          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
        >
          Review
        </button>
      ) : (
        <span className="text-xs text-gray-400">Done</span>
      )
    )}
  ];

  return (
    <Layout title={<div className="flex items-center gap-2"><FileText className="text-blue-600" />Student Leave Requests</div>}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {leaves.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No student leave requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table columns={columns} data={leaves} />
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Review Student Leave Request">
        {selectedLeave && (
          <div className="mb-4 space-y-2">
            <p className="text-sm"><strong>Student:</strong> {selectedLeave.user?.name}</p>
            <p className="text-sm"><strong>Class:</strong> {selectedLeave.user?.class} - {selectedLeave.user?.section}</p>
            <p className="text-sm"><strong>Email:</strong> <span className="break-all">{selectedLeave.user?.email}</span></p>
            <p className="text-sm"><strong>Type:</strong> {selectedLeave.leaveType}</p>
            <p className="text-sm"><strong>Dates:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()}</p>
            <p className="text-sm"><strong>Reason:</strong> {selectedLeave.reason}</p>
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Staff Response</label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm"
            rows="3"
            placeholder="Optional response message..."
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleStatusUpdate(selectedLeave._id, 'approved')}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm"
          >
            Approve
          </button>
          <button
            onClick={() => handleStatusUpdate(selectedLeave._id, 'rejected')}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm"
          >
            Reject
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 text-sm"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </Layout>
  );
};

export default StaffStudentLeaves;