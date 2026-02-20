import { useState, useEffect, useContext } from 'react';
import { Download, FileText, Calendar, User, AlertCircle, ExternalLink } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import { materialAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const StudentMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchMaterials();
  }, [user]);

  useEffect(() => {
    // Mark materials as viewed when component mounts
    if (user?.class && user?.section) {
      markMaterialsAsViewed();
    }
  }, [user]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await materialAPI.getMaterials({ 
        class: user.class, 
        section: user.section 
      });
      setMaterials(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const markMaterialsAsViewed = async () => {
    try {
      await materialAPI.markMaterialAsViewed({
        studentClass: user.class,
        studentSection: user.section
      });
    } catch (err) {
      console.error('Failed to mark materials as viewed:', err);
    }
  };

  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'PDF': return '📄';
      case 'Image': return '🖼️';
      case 'Video': return '🎥';
      case 'Document': return '📝';
      default: return '🔗';
    }
  };

  const columns = [
    { 
      header: 'Material', 
      render: (row) => {
        const isLocalFile = row.fileUrl && row.fileUrl.startsWith('/uploads/');
        
        return (
          <div className="flex items-start gap-2 min-w-0">
            <div className="text-base lg:text-lg flex-shrink-0">{getFileTypeIcon(row.fileType)}</div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-xs lg:text-sm truncate max-w-[120px] lg:max-w-none">{row.title}</div>
              <div className="text-xs text-gray-500 mt-1 hidden lg:block line-clamp-2">{row.description || 'No description'}</div>
              <div className="flex flex-wrap items-center gap-1 mt-1">
                <span className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                  {row.fileType || 'Link'}
                </span>
                {row.section === 'All Sections' && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-1 py-0.5 rounded">
                    All
                  </span>
                )}
                {isLocalFile && (
                  <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded">
                    File
                  </span>
                )}
              </div>
              <div className="lg:hidden mt-1 text-xs text-gray-500 line-clamp-2">{row.description || 'No description'}</div>
              {row.fileName && (
                <div className="text-xs text-gray-400 mt-1 truncate max-w-[120px] lg:max-w-none" title={row.fileName}>
                  {row.fileName}
                </div>
              )}
              {row.fileSize && (
                <div className="text-xs text-gray-400">
                  {(row.fileSize / 1024 / 1024).toFixed(1)}MB
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    { 
      header: 'Subject', 
      render: (row) => (
        <span className="px-1.5 lg:px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs lg:text-sm truncate max-w-[60px] lg:max-w-none inline-block">
          {row.subject?.name || 'General'}
        </span>
      )
    },
    { 
      header: 'By', 
      render: (row) => (
        <div className="flex items-center gap-1 min-w-0">
          <User size={10} lg:size={12} className="text-gray-400 flex-shrink-0" />
          <span className="text-xs truncate max-w-[50px] lg:max-w-none">{row.uploadedBy?.name || 'Staff'}</span>
        </div>
      )
    },
    { 
      header: 'Date', 
      render: (row) => (
        <div className="text-xs">
          <div className="lg:hidden">{new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          <div className="hidden lg:block">{new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
        </div>
      )
    },
    { 
      header: 'Actions', 
      render: (row) => {
        const isLocalFile = row.fileUrl && row.fileUrl.startsWith('/uploads/');
        const fileUrl = isLocalFile ? `http://localhost:5000${row.fileUrl}` : row.fileUrl;
        
        return (
          <div className="flex flex-col gap-1">
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 flex items-center justify-center gap-1 text-xs min-h-[24px] lg:min-h-[28px]"
            >
              <ExternalLink size={10} /> <span className="hidden sm:inline">Open</span>
            </a>
            {isLocalFile && (
              <a 
                href={fileUrl} 
                download={row.fileName || row.title}
                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 flex items-center justify-center gap-1 text-xs min-h-[24px] lg:min-h-[28px]"
              >
                <Download size={10} /> <span className="hidden sm:inline">Download</span>
              </a>
            )}
          </div>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64 transition-all duration-300">
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl lg:text-2xl font-bold">Study Materials</h1>
              <p className="text-gray-600 text-sm lg:text-base">Class {user.class} - Section {user.section}</p>
            </div>
            <div className="bg-blue-50 px-3 lg:px-4 py-2 rounded-lg flex-shrink-0">
              <span className="text-blue-800 font-medium text-sm lg:text-base">{materials.length} Materials</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
              <AlertCircle className="text-red-500 mr-3 flex-shrink-0" size={16} lg:size={20} />
              <div>
                <h3 className="text-red-800 font-medium text-sm lg:text-base">Error</h3>
                <p className="text-red-600 text-xs lg:text-sm">{error}</p>
              </div>
            </div>
          )}

          {materials.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 lg:p-12 text-center">
              <FileText size={48} lg:size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg lg:text-xl font-semibold text-gray-700 mb-2">No Materials Available</h3>
              <p className="text-sm lg:text-base text-gray-500">Your teachers haven't uploaded any study materials yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
                <Table columns={columns} data={materials} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentMaterials;