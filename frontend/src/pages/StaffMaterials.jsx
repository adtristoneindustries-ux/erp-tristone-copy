import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { materialAPI, classAPI, subjectAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { FileText, Upload, Trash2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const StaffMaterials = () => {
  const { user } = useContext(AuthContext);
  const [materials, setMaterials] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    class: '',
    section: '',
    subject: '',
    file: null
  });

  useEffect(() => {
    fetchMaterials();
    fetchClasses();
    fetchSubjects();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await materialAPI.getMaterials();
      setMaterials(response.data);
    } catch (error) {
      toast.error('Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getSubjects();
      setSubjects(response.data);
    } catch (error) {
      console.error('Failed to fetch subjects');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadData.title || !uploadData.class || !uploadData.subject) {
      toast.error('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('class', uploadData.class);
    formData.append('section', uploadData.section);
    formData.append('subject', uploadData.subject);
    if (uploadData.file) {
      formData.append('file', uploadData.file);
    }

    try {
      await materialAPI.createMaterial(formData);
      toast.success('Material uploaded successfully');
      setShowUploadModal(false);
      setUploadData({
        title: '',
        description: '',
        class: '',
        section: '',
        subject: '',
        file: null
      });
      fetchMaterials();
    } catch (error) {
      toast.error('Failed to upload material');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await materialAPI.deleteMaterial(id);
        toast.success('Material deleted successfully');
        fetchMaterials();
      } catch (error) {
        toast.error('Failed to delete material');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Navbar />
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
              <p className="text-gray-600">Upload and manage study materials for students</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Material
            </button>
          </div>

          {materials.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No materials uploaded</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by uploading your first study material.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {materials.map((material) => (
                <div key={material._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{material.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span>Class: {material.class} {material.section}</span>
                        <span className="mx-2">•</span>
                        <span>{material.subject?.name}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(material._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Upload Study Material</h3>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title *</label>
                    <input
                      type="text"
                      value={uploadData.title}
                      onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={uploadData.description}
                      onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      rows="3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Class *</label>
                      <select
                        value={uploadData.class}
                        onChange={(e) => setUploadData({...uploadData, class: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                          <option key={cls._id} value={cls.name}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Section</label>
                      <input
                        type="text"
                        value={uploadData.section}
                        onChange={(e) => setUploadData({...uploadData, section: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="A, B, C..."
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject *</label>
                    <select
                      value={uploadData.subject}
                      onChange={(e) => setUploadData({...uploadData, subject: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>{subject.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">File</label>
                    <input
                      type="file"
                      onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Upload
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
};

export default StaffMaterials;