import { useState, useEffect, useContext } from "react";
import { Plus, Trash2, Edit, Megaphone, Bell, User, Calendar } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Modal from "../components/Modal";
import { announcementAPI } from "../services/api";
import { AuthContext } from '../context/AuthContext';
import { useAlert } from '../hooks/useAlert';

const AdminAnnouncements = () => {
  const { showError } = useAlert();
  const [announcements, setAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetRole: "all",
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = () => {
    announcementAPI
      .getAnnouncements()
      .then((res) => setAnnouncements(res.data));
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
      showError(error.response?.data?.message || "Operation failed");
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

  const resetForm = () => {
    setFormData({ title: "", content: "", targetRole: "all" });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this announcement?")) {
      await announcementAPI.deleteAnnouncement(id);
      fetchAnnouncements();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-6 gap-4">
            <h1 className="text-xl lg:text-2xl font-bold">Announcements</h1>
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
                    {announcements.filter(a => a.createdBy?._id === user.id || a.createdBy?._id === user._id).length}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {announcements.filter(a => a.createdBy?._id === user.id || a.createdBy?._id === user._id).map(announcement => (
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
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 rounded ${
                        announcement.targetRole === 'all' ? 'bg-blue-100 text-blue-800' :
                        announcement.targetRole === 'student' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        For {announcement.targetRole === 'all' ? 'All' : announcement.targetRole}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff Announcements */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <User className="text-green-500" size={20} />
                  <h2 className="text-lg font-semibold">Staff Announcements</h2>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {announcements.filter(a => a.createdBy?.role === 'staff' && (a.targetRole === 'admin' || a.targetRole === 'all')).length}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {announcements.filter(a => a.createdBy?.role === 'staff' && (a.targetRole === 'admin' || a.targetRole === 'all')).map(announcement => (
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
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Announcements */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <Bell className="text-orange-500" size={20} />
                  <h2 className="text-lg font-semibold">All Announcements</h2>
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    {announcements.length}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {announcements.map(announcement => (
                  <div key={announcement._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <h3 className="font-medium text-gray-900 mb-2">{announcement.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{announcement.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {announcement.createdBy?.name} ({announcement.createdBy?.role})
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        announcement.targetRole === 'all' ? 'bg-blue-100 text-blue-800' :
                        announcement.targetRole === 'student' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {announcement.targetRole}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingId ? "Edit Announcement" : "Create Announcement"}
          >
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full mb-3 px-4 py-2 border rounded-lg"
                required
                disabled={loading}
              />
              <textarea
                placeholder="Content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full mb-3 px-4 py-2 border rounded-lg"
                rows="4"
                required
                disabled={loading}
              />
              <select
                value={formData.targetRole}
                onChange={(e) =>
                  setFormData({ ...formData, targetRole: e.target.value })
                }
                className="w-full mb-3 px-4 py-2 border rounded-lg"
                disabled={loading}
              >
                <option value="all">All Users</option>
                <option value="student">Students Only</option>
                <option value="staff">Staff Only</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editingId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Megaphone size={16} />
                    {editingId ? 'Update' : 'Create'}
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

export default AdminAnnouncements;
