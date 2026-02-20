import { useState, useEffect, useContext } from 'react';
import { Plus, Megaphone, Bell, Trash2, User, Calendar, Edit } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { announcementAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const StaffAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRole: 'student'
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementAPI.getAnnouncements();
      setAnnouncements(res.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await announcementAPI.updateAnnouncement(editingId, formData);
      } else {
        await announcementAPI.createAnnouncement(formData);
      }
      fetchAnnouncements();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      targetRole: announcement.targetRole
    });
    setEditingId(announcement._id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementAPI.deleteAnnouncement(id);
        fetchAnnouncements();
      } catch (error) {
        alert('Failed to delete announcement');
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', targetRole: 'student' });
    setEditingId(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const myAnnouncements = announcements.filter(a => a.createdBy?._id === user.id || a.createdBy?._id === user._id);
  const adminAnnouncements = announcements.filter(a => 
    a.createdBy?._id !== user.id && 
    a.createdBy?._id !== user._id && 
    a.createdBy?.role === 'admin' && 
    (a.targetRole === 'staff' || a.targetRole === 'all')
  );
  const staffAnnouncements = announcements.filter(a => 
    a.createdBy?._id !== user.id && 
    a.createdBy?._id !== user._id && 
    a.createdBy?.role === 'staff' && 
    (a.targetRole === 'staff' || a.targetRole === 'all')
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-6 gap-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold">Announcements</h1>
              <p className="text-sm lg:text-base text-gray-600">Create announcements for students and view admin messages</p>
            </div>
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 w-full sm:w-auto"
            >
              <Plus size={20} /> Create Announcement
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            {/* My Announcements */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <Megaphone className="text-blue-500" size={20} />
                  <h2 className="text-lg font-semibold">My Announcements</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {myAnnouncements.length}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {myAnnouncements.length === 0 ? (
                  <div className="text-center py-8">
                    <Megaphone className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">No announcements created yet</p>
                    <p className="text-sm text-gray-400">Create your first announcement for students</p>
                  </div>
                ) : (
                  myAnnouncements.map(announcement => (
                    <div key={announcement._id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(announcement)}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(announcement._id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{announcement.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(announcement.createdAt)}
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          announcement.targetRole === 'student' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          For {announcement.targetRole}s
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Admin Messages */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <Bell className="text-orange-500" size={20} />
                  <h2 className="text-lg font-semibold">Admin Messages</h2>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    {adminAnnouncements.length}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {adminAnnouncements.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">No admin messages</p>
                    <p className="text-sm text-gray-400">Admin announcements will appear here</p>
                  </div>
                ) : (
                  adminAnnouncements.map(announcement => (
                    <div key={announcement._id} className="border rounded-lg p-4 bg-orange-50">
                      <h3 className="font-medium text-gray-900 mb-2">{announcement.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{announcement.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {announcement.createdBy?.name || 'Admin'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(announcement.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Staff Messages */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <User className="text-green-500" size={20} />
                  <h2 className="text-lg font-semibold">Staff Messages</h2>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {staffAnnouncements.length}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {staffAnnouncements.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">No staff messages</p>
                    <p className="text-sm text-gray-400">Messages from other staff will appear here</p>
                  </div>
                ) : (
                  staffAnnouncements.map(announcement => (
                    <div key={announcement._id} className="border rounded-lg p-4 bg-green-50">
                      <h3 className="font-medium text-gray-900 mb-2">{announcement.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{announcement.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {announcement.createdBy?.name || 'Staff'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(announcement.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Announcement" : "Create Announcement"}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  placeholder="Enter announcement title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message *</label>
                <textarea
                  placeholder="Enter your announcement message"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Audience *</label>
                <select
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="student">Students</option>
                  <option value="staff">Staff</option>
                  <option value="all">All (Students & Staff)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Megaphone size={16} />
                    {editingId ? 'Update Announcement' : 'Create Announcement'}
                  </>
                )}
              </button>
            </form>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default StaffAnnouncements;