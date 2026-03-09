import { useState, useEffect } from 'react';
import { Award, Plus, Edit, Trash2, CheckCircle, XCircle, Eye } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { badgeAPI, userAPI } from '../services/api';

const AdminAchievements = () => {
  const [badges, setBadges] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '🏆', category: '', description: '' });
  const [assignData, setAssignData] = useState({ studentId: '', badgeId: '' });
  const [activeTab, setActiveTab] = useState('badges');

  useEffect(() => {
    fetchBadges();
    fetchPendingApprovals();
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Achievements Management</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Award size={20} />
                Assign Badge
              </button>
              <button
                onClick={() => {
                  setEditingBadge(null);
                  setFormData({ name: '', icon: '🏆', category: '', description: '' });
                  setShowModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={20} />
                Create Badge
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => setActiveTab('badges')}
              className={`pb-2 px-4 ${activeTab === 'badges' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600'}`}
            >
              All Badges ({badges.length})
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`pb-2 px-4 ${activeTab === 'approvals' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600'}`}
            >
              Pending Approvals ({pendingApprovals.length})
            </button>
          </div>

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {badges.map((badge) => (
                <div key={badge._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-3">{badge.icon}</div>
                    <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{badge.category}</p>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingBadge(badge);
                        setFormData(badge);
                        setShowModal(true);
                      }}
                      className="flex-1 bg-blue-100 text-blue-600 py-2 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-1"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(badge._id)}
                      className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 flex items-center justify-center gap-1"
                    >
                      <Trash2 size={16} />
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
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Badge</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingApprovals.map((approval) => (
                    <tr key={approval._id}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{approval.student?.name}</p>
                          <p className="text-sm text-gray-500">{approval.student?.rollNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{approval.badge?.icon}</span>
                          <span>{approval.badge?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`http://localhost:5000${approval.certificateUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Eye size={16} />
                          View
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(approval.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproval(approval._id, 'approve')}
                            className="bg-green-100 text-green-600 px-3 py-1 rounded hover:bg-green-200 flex items-center gap-1"
                          >
                            <CheckCircle size={16} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproval(approval._id, 'reject')}
                            className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 flex items-center gap-1"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pendingApprovals.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        No pending approvals
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
    </div>
  );
};

export default AdminAchievements;
