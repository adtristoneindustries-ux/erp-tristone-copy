import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';

const StaffHomework = () => {
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [editingHomework, setEditingHomework] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    className: '',
    section: '',
    topic: '',
    description: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchHomework();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchHomework = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/homework/submissions?classId=${selectedClass}`);
      setHomework(res.data);
    } catch (error) {
      console.error('Error fetching homework:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHomework = async (e) => {
    e.preventDefault();
    try {
      const classDoc = classes.find(c => c.className === formData.className && c.section === formData.section);
      if (!classDoc) {
        alert('Invalid class selection');
        return;
      }
      await api.post('/homework', {
        subject: formData.subject,
        class: classDoc._id,
        topic: formData.topic,
        description: formData.description,
        dueDate: formData.dueDate
      });
      setCreateModal(false);
      setFormData({ subject: '', className: '', section: '', topic: '', description: '', dueDate: '' });
      if (selectedClass) fetchHomework();
    } catch (error) {
      console.error('Error creating homework:', error);
      alert('Failed to create homework');
    }
  };

  const handleEditHomework = async (e) => {
    e.preventDefault();
    try {
      const classDoc = classes.find(c => c.className === formData.className && c.section === formData.section);
      if (!classDoc) {
        alert('Invalid class selection');
        return;
      }
      await api.put(`/homework/${editingHomework._id}`, {
        subject: formData.subject,
        class: classDoc._id,
        topic: formData.topic,
        description: formData.description,
        dueDate: formData.dueDate
      });
      setEditModal(false);
      setEditingHomework(null);
      setFormData({ subject: '', className: '', section: '', topic: '', description: '', dueDate: '' });
      if (selectedClass) fetchHomework();
    } catch (error) {
      console.error('Error updating homework:', error);
      alert('Failed to update homework');
    }
  };

  const handleDeleteHomework = async (id) => {
    if (!confirm('Are you sure you want to delete this homework?')) return;
    try {
      await api.delete(`/homework/${id}`);
      fetchHomework();
    } catch (error) {
      console.error('Error deleting homework:', error);
      alert('Failed to delete homework');
    }
  };

  const openEditModal = (hw) => {
    setEditingHomework(hw);
    setFormData({
      subject: hw.subject?._id || '',
      className: hw.class?.className || '',
      section: hw.class?.section || '',
      topic: hw.topic,
      description: hw.description || '',
      dueDate: hw.dueDate ? new Date(hw.dueDate).toISOString().split('T')[0] : ''
    });
    setEditModal(true);
  };

  const handleViewSubmissions = async (homeworkId) => {
    try {
      const res = await api.get(`/homework/submissions?homeworkId=${homeworkId}`);
      setSubmissions(res.data);
      setViewModal(true);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const selectedClassData = classes.find(c => c._id === selectedClass);

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Homework Management</h1>
          <button
            onClick={() => setCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
            Create Homework
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.className} - {cls.section}
              </option>
            ))}
          </select>
        </div>

        {selectedClass && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-6 text-center">Loading...</div>
            ) : homework.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No homework assigned yet</div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topic</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {homework.map((hw) => (
                    <tr key={hw._id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{hw.subject?.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{hw.topic}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(hw.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{hw.totalStudents}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">
                          {hw.completed}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                          {hw.pending}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewSubmissions(hw._id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            View
                          </button>
                          <button
                            onClick={() => openEditModal(hw)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteHomework(hw._id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {createModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Create New Homework</h3>
              <form onSubmit={handleCreateHomework}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Standard</label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Standard</option>
                    {[...new Set(classes.map(c => c.className))].sort().map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!formData.className}
                  >
                    <option value="">Select Section</option>
                    {classes.filter(c => c.className === formData.className).map((cls) => (
                      <option key={cls._id} value={cls.section}>{cls.section}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub._id} value={sub._id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCreateModal(false);
                      setFormData({ subject: '', className: '', section: '', topic: '', description: '', dueDate: '' });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Edit Homework</h3>
              <form onSubmit={handleEditHomework}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Standard</label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Standard</option>
                    {[...new Set(classes.map(c => c.className))].sort().map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!formData.className}
                  >
                    <option value="">Select Section</option>
                    {classes.filter(c => c.className === formData.className).map((cls) => (
                      <option key={cls._id} value={cls.section}>{cls.section}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub._id} value={sub._id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditModal(false);
                      setEditingHomework(null);
                      setFormData({ subject: '', className: '', section: '', topic: '', description: '', dueDate: '' });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {viewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Submission Details</h3>
                <button
                  onClick={() => setViewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted At</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {submissions.map((sub) => (
                      <tr key={sub.student._id}>
                        <td className="px-4 py-3 text-sm text-gray-700">{sub.student.rollNumber}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{sub.student.name}</td>
                        <td className="px-4 py-3">
                          {sub.status === 'completed' ? (
                            <span className="px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">
                              Completed
                            </span>
                          ) : (
                            <span className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {sub.submission ? new Date(sub.submission.submittedAt).toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {sub.submission ? (
                            <a
                              href={sub.submission.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View File
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StaffHomework;
