import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { FaUpload, FaVideo, FaImage, FaFilePdf, FaFileAlt, FaTrash, FaTimes, FaBook, FaLink } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function StaffDigitalClassroom() {
  const user = useContext(AuthContext).user;
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    class: '',
    section: '',
    uploadType: 'file'
  });
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    fetchSubjects();
    fetchMaterials();
    fetchClassesAndSections();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchClassesAndSections = async () => {
    try {
      const res = await api.get('/users?role=student');
      const students = res.data;
      
      const uniqueClasses = [...new Set(students.map(s => s.class).filter(Boolean))];
      const uniqueSections = [...new Set(students.map(s => s.section).filter(Boolean))];
      
      setClasses(uniqueClasses.sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        return numA - numB;
      }));
      setSections([...uniqueSections.sort(), 'All Sections']);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await api.get('/materials');
      setMaterials(res.data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error('File size should be less than 100MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subject || !formData.class || !formData.section) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.uploadType === 'file' && !file) {
      toast.error('Please select a file');
      return;
    }

    if (formData.uploadType === 'url' && !fileUrl) {
      toast.error('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('subject', formData.subject);
      data.append('class', formData.class);
      data.append('section', formData.section);

      if (formData.uploadType === 'file') {
        data.append('file', file);
      } else {
        data.append('fileUrl', fileUrl);
      }

      await api.post('/materials', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Material uploaded successfully!');
      setShowUploadModal(false);
      resetForm();
      fetchMaterials();
    } catch (error) {
      console.error('Error uploading material:', error);
      toast.error(error.response?.data?.message || 'Failed to upload material');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;
    
    try {
      await api.delete(`/materials/${id}`);
      toast.success('Material deleted successfully');
      fetchMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      class: '',
      section: '',
      uploadType: 'file'
    });
    setFile(null);
    setFileUrl('');
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'Video': return <FaVideo className="text-red-500 text-2xl" />;
      case 'Image': return <FaImage className="text-green-500 text-2xl" />;
      case 'PDF': return <FaFilePdf className="text-red-600 text-2xl" />;
      case 'Link': return <FaLink className="text-blue-500 text-2xl" />;
      default: return <FaFileAlt className="text-gray-500 text-2xl" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Digital Classroom</h1>
          <p className="text-gray-600 mt-1">Upload and manage study materials</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 font-medium shadow-lg"
        >
          <FaUpload /> Upload Material
        </button>
      </div>

      {/* Materials Grid */}
      {materials.length === 0 ? (
        <div className="text-center py-12">
          <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No materials uploaded yet</p>
          <p className="text-gray-400 text-sm mt-2">Click "Upload Material" to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map((material) => (
                <tr key={material._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getFileIcon(material.fileType)}</div>
                      <div>
                        <div className="font-medium text-gray-900">{material.title}</div>
                        {material.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{material.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{material.subject?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">Class {material.class}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{material.section}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">{material.fileType}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(material.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDelete(material._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Upload Study Material</h2>
              <button
                onClick={() => { setShowUploadModal(false); resetForm(); }}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Chapter 5 - Photosynthesis"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the material"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(subject => (
                        <option key={subject._id} value={subject._id}>{subject.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Class <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls} value={cls}>Class {cls}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Section</option>
                    {sections.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="uploadType"
                        value="file"
                        checked={formData.uploadType === 'file'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Upload File</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="uploadType"
                        value="url"
                        checked={formData.uploadType === 'url'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Add URL Link</span>
                    </label>
                  </div>
                </div>

                {formData.uploadType === 'file' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Upload File (Video/Image/PDF/Document) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="video/*,image/*,.pdf,.doc,.docx"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {file && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {file.name} ({formatFileSize(file.size)})
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Material URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/video.mp4"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowUploadModal(false); resetForm(); }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Uploading...' : 'Upload Material'}
                </button>
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
