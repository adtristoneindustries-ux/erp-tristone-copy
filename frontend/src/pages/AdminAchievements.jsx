import { useState, useEffect } from 'react';
import { Award, Plus, Edit, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StudentDetailsModal from '../components/StudentDetailsModal';
import { badgeAPI, userAPI } from '../services/api';

const AdminAchievements = () => {
  const [badges, setBadges] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedBadges, setApprovedBadges] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '🏆', category: '', description: '' });
  const [assignData, setAssignData] = useState({ studentId: '', badgeId: '' });
  const [activeTab, setActiveTab] = useState('badges');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  useEffect(() => {
    fetchBadges();
    fetchPendingApprovals();
    fetchApprovedBadges();
    fetchStudents();
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await badgeAPI.getAllBadges();
      setBadges(res.data.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const res = await badgeAPI.getPendingApprovals();
      setPendingApprovals(res.data.data);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    }
  };

  const fetchApprovedBadges = async () => {
    try {
      const res = await badgeAPI.getApprovedBadges();
      setApprovedBadges(res.data.data);
    } catch (error) {
      console.error('Error fetching approved badges:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await userAPI.getUsers({ role: 'student' });
      setStudents(res.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBadge) {
        await badgeAPI.updateBadge(editingBadge._id, formData);
        alert('Badge updated successfully');
      } else {
        await badgeAPI.createBadge(formData);
        alert('Badge created successfully');
      }
      setShowModal(false);
      setEditingBadge(null);
      setFormData({ name: '', icon: '🏆', category: '', description: '' });
      fetchBadges();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this badge?')) return;
    try {
      await badgeAPI.deleteBadge(id);
      alert('Badge deleted successfully');
      fetchBadges();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleApproval = async (id, action) => {
    try {
      await badgeAPI.approveCertificate(id, { action });
      alert(`Certificate ${action}d successfully`);
      fetchPendingApprovals();
      fetchApprovedBadges();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await badgeAPI.assignBadge(assignData);
      alert('Badge assigned successfully');
      setShowAssignModal(false);
      setAssignData({ studentId: '', badgeId: '' });
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const iconOptions = ['🏆', '⭐', '🎖️', '🥇', '🥈', '🥉', '👑', '💎', '🔥', '⚡', '🎯', '🚀'];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold">Achievements Management</h1>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowAssignModal(true)}
                className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm"
              >
                <Award size={18} className="sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Assign Badge</span>
              </button>
              <button
                onClick={() => {
                  setEditingBadge(null);
                  setFormData({ name: '', icon: '🏆', category: '', description: '' });
                  setShowModal(true);
                }}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
              >
                <Plus size={18} className="sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Create Badge</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 sm:gap-4 mb-6 border-b overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('badges')}
              className={`pb-2 px-3 sm:px-4 whitespace-nowrap text-xs sm:text-sm ${activeTab === 'badges' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600'}`}
            >
              All Badges ({badges.length})
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`pb-2 px-3 sm:px-4 whitespace-nowrap text-xs sm:text-sm ${activeTab === 'approvals' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600'}`}
            >
              Pending ({pendingApprovals.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-2 px-3 sm:px-4 whitespace-nowrap text-xs sm:text-sm ${activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600'}`}
            >
              History ({approvedBadges.length})
            </button>
          </div>

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {badges.map((badge) => (
                <div key={badge._id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                  <div className="text-center mb-3 sm:mb-4">
                    <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">{badge.icon}</div>
                    <h3 className="font-bold text-base sm:text-lg mb-1">{badge.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{badge.category}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{badge.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingBadge(badge);
                        setFormData(badge);
                        setShowModal(true);
                      }}
                      className="flex-1 bg-blue-100 text-blue-600 py-1.5 sm:py-2 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-1 text-xs sm:text-sm"
                    >
                      <Edit size={14} className="sm:w-4 sm:h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(badge._id)}
                      className="flex-1 bg-red-100 text-red-600 py-1.5 sm:py-2 rounded-lg hover:bg-red-200 flex items-center justify-center gap-1 text-xs sm:text-sm"
                    >
                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Approvals Tab */}
          {activeTab === 'approvals' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Badge</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Certificate</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Date</th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingApprovals.map((approval) => (
                      <tr key={approval._id}>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div>
                            <button
                              onClick={() => { setSelectedStudent(approval.student); setIsStudentModalOpen(true); }}
                              className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left text-xs sm:text-sm"
                            >
                              {approval.student?.name}
                            </button>
                            <p className="text-xs text-gray-500">{approval.student?.rollNumber}</p>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-xl sm:text-2xl">{approval.badge?.icon}</span>
                            <span className="text-xs sm:text-sm">{approval.badge?.name}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                          <a
                            href={`http://192.168.1.9:5000${approval.certificateUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 text-xs sm:text-sm"
                          >
                            <Eye size={14} className="sm:w-4 sm:h-4" />
                            View
                          </a>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                          {new Date(approval.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex gap-1 sm:gap-2">
                            <button
                              onClick={() => handleApproval(approval._id, 'approve')}
                              className="bg-green-100 text-green-600 px-2 sm:px-3 py-1 rounded hover:bg-green-200 flex items-center gap-1 text-xs"
                            >
                              <CheckCircle size={12} className="sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Approve</span>
                            </button>
                            <button
                              onClick={() => handleApproval(approval._id, 'reject')}
                              className="bg-red-100 text-red-600 px-2 sm:px-3 py-1 rounded hover:bg-red-200 flex items-center gap-1 text-xs"
                            >
                              <XCircle size={12} className="sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {pendingApprovals.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                          No pending approvals
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Approved History Tab */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Badge</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earned Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {approvedBadges.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4">
                        <div>
                          <button
                            onClick={() => { setSelectedStudent(item.student); setIsStudentModalOpen(true); }}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                          >
                            {item.student?.name}
                          </button>
                          <p className="text-sm text-gray-500">{item.student?.rollNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{item.student?.class}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{item.badge?.icon}</span>
                          <div>
                            <p className="font-medium">{item.badge?.name}</p>
                            <p className="text-xs text-gray-500">{item.badge?.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(item.earnedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {item.approvedBy?.name || 'Auto-assigned'}
                      </td>
                      <td className="px-6 py-4">
                        {item.certificateUrl ? (
                          <a
                            href={`http://localhost:5000${item.certificateUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Eye size={16} />
                            View
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">Auto-earned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {approvedBadges.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        No approved badges yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingBadge ? 'Edit Badge' : 'Create Badge'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Badge Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`text-3xl p-2 rounded border-2 ${formData.icon === icon ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  rows="3"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  {editingBadge ? 'Update' : 'Create'}
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

      {/* Assign Badge Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Assign Badge to Student</h2>
            <form onSubmit={handleAssign}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Student</label>
                <select
                  value={assignData.studentId}
                  onChange={(e) => setAssignData({ ...assignData, studentId: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required
                >
                  <option value="">Choose a student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} - {student.rollNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Badge</label>
                <select
                  value={assignData.badgeId}
                  onChange={(e) => setAssignData({ ...assignData, badgeId: e.target.value })}
                  className="w-full border rounded-lg p-2"
                  required
                >
                  <option value="">Choose a badge</option>
                  {badges.map((badge) => (
                    <option key={badge._id} value={badge._id}>
                      {badge.icon} {badge.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                  Assign
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
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

export default AdminAchievements;
