import { useState, useEffect, useContext } from 'react';
import { Plus, Trash2, Upload, AlertCircle, Search, Filter, FileText, Link } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { materialAPI, subjectAPI, classAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const StaffMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClassName, setSelectedClassName] = useState('');
  const [availableSections, setAvailableSections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterAvailableSections, setFilterAvailableSections] = useState([]);
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'link'
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    fileUrl: '', 
    subject: '', 
    class: '', 
    section: '' 
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [materialsRes, subjectsRes, classesRes] = await Promise.all([
        materialAPI.getMaterials(),
        subjectAPI.getSubjects(),
        classAPI.getClasses()
      ]);
      setMaterials(materialsRes.data);
      setSubjects(subjectsRes.data);
      setClasses(classesRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelection = (className) => {
    setSelectedClassName(className);
    setFormData(prev => ({ ...prev, class: className, section: '' }));
    
    const classesForName = classes.filter(cls => cls.className === className);
    const sections = classesForName.map(cls => cls.section).filter(Boolean);
    const uniqueSections = [...new Set(sections)].sort();
    setAvailableSections(uniqueSections);
  };

  const handleFilterClassChange = (className) => {
    setFilterClass(className);
    setFilterSection('');
    
    if (className) {
      const classesForName = classes.filter(cls => cls.className === className);
      const sections = classesForName.map(cls => cls.section).filter(Boolean);
      const uniqueSections = [...new Set(sections)].sort();
      setFilterAvailableSections(uniqueSections);
    } else {
      setFilterAvailableSections([]);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', fileUrl: '', subject: '', class: '', section: '' });
    setSelectedClassName('');
    setAvailableSections([]);
    setSelectedFile(null);
    setUploadType('file');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only images, videos, PDFs, and Word documents are allowed.');
        return;
      }
      
      // Validate file size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB.');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Add form fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('class', formData.class);
      formDataToSend.append('section', formData.section);
      if (formData.subject) formDataToSend.append('subject', formData.subject);
      
      if (uploadType === 'file' && selectedFile) {
        // File upload
        formDataToSend.append('file', selectedFile);
      } else if (uploadType === 'link' && formData.fileUrl) {
        // URL link
        formDataToSend.append('fileUrl', formData.fileUrl);
        
        // Determine file type from URL
        const url = formData.fileUrl.toLowerCase();
        let fileType = 'Link';
        if (url.includes('.pdf')) fileType = 'PDF';
        else if (url.match(/\.(jpg|jpeg|png|gif)$/)) fileType = 'Image';
        else if (url.match(/\.(mp4|avi|mov|wmv)$/)) fileType = 'Video';
        else if (url.match(/\.(doc|docx)$/)) fileType = 'Document';
        
        formDataToSend.append('fileType', fileType);
      } else {
        throw new Error('Please select a file or provide a URL');
      }
      
      const response = await materialAPI.createMaterial(formDataToSend);
      setMaterials(prev => [response.data, ...prev]);
      setIsModalOpen(false);
      resetForm();
      
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to upload material');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this material?')) {
      try {
        await materialAPI.deleteMaterial(id);
        setMaterials(prev => prev.filter(m => m._id !== id));
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete material');
      }
    }
  };

  // Filter materials based on search and filters
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (material.description && material.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClass = !filterClass || material.class === filterClass;
    const matchesSection = !filterSection || material.section === filterSection;
    const matchesType = !filterType || material.fileType === filterType;
    
    return matchesSearch && matchesClass && matchesSection && matchesType;
  });

  const columns = [
    { 
      header: 'Material', 
      render: (row) => (
        <div className="min-w-0">
          <div className="font-semibold text-xs lg:text-sm truncate max-w-[120px] lg:max-w-none">{row.title}</div>
          <div className="text-xs text-gray-500 truncate max-w-[120px] lg:max-w-none">{row.description || 'No description'}</div>
        </div>
      )
    },
    { 
      header: 'Class', 
      render: (row) => (
        <div className="text-center">
          <span className="bg-blue-100 text-blue-800 px-1.5 lg:px-2 py-1 rounded text-xs lg:text-sm">
            <span className="lg:hidden">{row.class}</span>
            <span className="hidden lg:inline">Class {row.class}</span>
          </span>
          <br className="hidden lg:block" />
          <span className="bg-green-100 text-green-800 px-1.5 lg:px-2 py-1 rounded text-xs mt-1 inline-block">
            {row.section}
          </span>
        </div>
      )
    },
    { 
      header: 'Subject', 
      render: (row) => (
        <span className="bg-purple-100 text-purple-800 px-1.5 lg:px-2 py-1 rounded text-xs lg:text-sm truncate max-w-[80px] lg:max-w-none inline-block">
          {row.subject?.name || 'General'}
        </span>
      )
    },
    { 
      header: 'Type', 
      render: (row) => (
        <span className="bg-gray-100 text-gray-800 px-1.5 lg:px-2 py-1 rounded text-xs lg:text-sm">
          {row.fileType || 'Link'}
        </span>
      )
    },
    { 
      header: 'Date', 
      render: (row) => (
        <div className="text-xs lg:text-sm">
          <div className="lg:hidden">{new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          <div className="hidden lg:block">{new Date(row.createdAt).toLocaleDateString()}</div>
        </div>
      )
    },
    { 
      header: 'File', 
      render: (row) => {
        const isLocalFile = row.fileUrl && row.fileUrl.startsWith('/uploads/');
        const fileUrl = isLocalFile ? `http://localhost:5000${row.fileUrl}` : row.fileUrl;
        
        return (
          <div className="flex flex-col gap-1">
            <a href={fileUrl} target="_blank" rel="noopener noreferrer" 
               className="bg-blue-500 text-white px-2 lg:px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1 w-fit text-xs lg:text-sm">
              <Upload size={12} lg:size={14} /> 
              <span className="hidden sm:inline">Open</span>
              <span className="sm:hidden">↗</span>
            </a>
            {row.fileName && (
              <span className="text-xs text-gray-500 truncate max-w-[100px]" title={row.fileName}>
                {row.fileName}
              </span>
            )}
            {row.fileSize && (
              <span className="text-xs text-gray-400">
                {(row.fileSize / 1024 / 1024).toFixed(1)}MB
              </span>
            )}
          </div>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Navbar />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300 min-w-0">
        <Navbar />
        <div className="p-4 lg:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 lg:mb-6 gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold">Study Materials</h1>
            <p className="text-sm lg:text-base text-gray-600">Upload and manage teaching materials for your classes</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 w-full sm:w-auto"
          >
            <Plus size={20} /> Upload Material
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
              />
            </div>
            
            <select
              value={filterClass}
              onChange={(e) => handleFilterClassChange(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
            >
              <option value="">All Classes</option>
              {[...new Set(classes.map(cls => cls.className).filter(Boolean))].sort().map(className => (
                <option key={className} value={className}>Class {className}</option>
              ))}
            </select>
            
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
              disabled={!filterClass}
            >
              <option value="">All Sections</option>
              {filterClass && (
                <option value="All Sections">All Sections</option>
              )}
              {filterAvailableSections.map(section => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
            >
              <option value="">All Types</option>
              <option value="PDF">PDF</option>
              <option value="Image">Image</option>
              <option value="Video">Video</option>
              <option value="Document">Document</option>
              <option value="Link">Link</option>
            </select>
            
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">{filteredMaterials.length} materials</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="text-red-500 mr-3" size={20} />
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
            <Table
              columns={columns}
              data={filteredMaterials}
              actions={(material) => (
                <button 
                  onClick={() => handleDelete(material._id)} 
                  className="text-red-500 hover:text-red-700 p-1 rounded"
                  title="Delete"
                >
                  <Trash2 size={14} lg:size={16} />
                </button>
              )}
            />
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Study Material">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Material Title *</label>
              <input
                type="text"
                placeholder="Enter material title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                required
                disabled={submitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                placeholder="Brief description of the material"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                rows="3"
                disabled={submitting}
              />
            </div>
            
            {/* Upload Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Upload Method *</label>
              <div className="flex gap-4 mb-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="file"
                    checked={uploadType === 'file'}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="mr-2"
                    disabled={submitting}
                  />
                  <FileText size={16} className="mr-1" />
                  Upload File
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="link"
                    checked={uploadType === 'link'}
                    onChange={(e) => setUploadType(e.target.value)}
                    className="mr-2"
                    disabled={submitting}
                  />
                  <Link size={16} className="mr-1" />
                  Add Link
                </label>
              </div>
              
              {uploadType === 'file' ? (
                <div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.wmv"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                    required={uploadType === 'file'}
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported: Images (JPG, PNG, GIF), Videos (MP4, AVI, MOV), PDF, Word Documents (DOC, DOCX)
                    <br />Max size: 50MB
                  </p>
                  {selectedFile && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm text-green-800">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)}MB)
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/... or any file URL"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                    required={uploadType === 'link'}
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter a direct link to your file or document</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Class *</label>
                <select
                  value={selectedClassName}
                  onChange={(e) => handleClassSelection(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  required
                  disabled={submitting}
                >
                  <option value="">Select Class</option>
                  {[...new Set(classes.map(cls => cls.className).filter(Boolean))].sort().map(className => (
                    <option key={className} value={className}>Class {className}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Section *</label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                  required
                  disabled={submitting || !selectedClassName}
                >
                  <option value="">Select Section</option>
                  <option value="All Sections">All Sections</option>
                  {availableSections.map(section => (
                    <option key={section} value={section}>Section {section}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                disabled={submitting}
              >
                <option value="">Select Subject (Optional)</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm lg:text-base"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload Material
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

export default StaffMaterials;
