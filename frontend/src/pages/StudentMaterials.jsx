import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { materialAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentMaterials = () => {
  const { user } = useContext(AuthContext);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await materialAPI.getMaterials({
        class: user.class,
        section: user.section
      });
      setMaterials(response.data);
      
      // Mark materials as viewed
      if (response.data.length > 0) {
        await materialAPI.markMaterialAsViewed({
          class: user.class,
          section: user.section
        });
      }
    } catch (error) {
      toast.error('Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (material) => {
    if (material.fileUrl) {
      window.open(material.fileUrl, '_blank');
    } else {
      toast.error('File not available');
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
            <p className="text-gray-600">Access your class materials and resources</p>
          </div>

          {materials.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No materials available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your teachers haven't uploaded any materials yet.
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
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(material.createdAt).toLocaleDateString()}
                        <span className="mx-2">•</span>
                        <span>{material.subject?.name}</span>
                        <span className="mx-2">•</span>
                        <span>By {material.uploadedBy?.name}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownload(material)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentMaterials;