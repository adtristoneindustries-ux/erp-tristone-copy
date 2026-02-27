import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { FaBook, FaVideo, FaImage, FaFilePdf, FaFileAlt, FaDownload, FaTimes, FaPlay } from 'react-icons/fa';

export default function StudentDigitalClassroom() {
  const user = useContext(AuthContext).user;
  const socket = useContext(SocketContext);
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState({});
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjectsAndMaterials();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('materialUploaded', handleMaterialUpdate);
      socket.on('materialDeleted', handleMaterialDelete);
      return () => {
        socket.off('materialUploaded', handleMaterialUpdate);
        socket.off('materialDeleted', handleMaterialDelete);
      };
    }
  }, [socket]);

  const fetchSubjectsAndMaterials = async () => {
    try {
      const [subjectsRes, materialsRes] = await Promise.all([
        api.get('/subjects'),
        api.get(`/materials?class=${user.class}&section=${user.section}`)
      ]);
      
      const studentSubjects = subjectsRes.data.filter(s => s.class === user.class);
      setSubjects(studentSubjects);
      
      const grouped = {};
      materialsRes.data.forEach(mat => {
        const subId = mat.subject?._id || 'general';
        if (!grouped[subId]) grouped[subId] = [];
        grouped[subId].push(mat);
      });
      setMaterials(grouped);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleMaterialUpdate = (data) => {
    if (data.class === user.class) {
      fetchSubjectsAndMaterials();
    }
  };

  const handleMaterialDelete = () => {
    fetchSubjectsAndMaterials();
  };

  const openMaterialsModal = (subject) => {
    setSelectedSubject(subject);
    setShowModal(true);
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'Video': return <FaVideo className="text-red-500" />;
      case 'Image': return <FaImage className="text-green-500" />;
      case 'PDF': return <FaFilePdf className="text-red-600" />;
      default: return <FaFileAlt className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Navbar />
        <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Digital Classroom</h1>
        <p className="text-gray-600 mt-1">Access study materials, videos, and resources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {subjects.map((subject) => {
          const subjectMaterials = materials[subject._id] || [];
          const videoCount = subjectMaterials.filter(m => m.fileType === 'Video').length;
          
          return (
            <div key={subject._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
                  <FaBook className="text-3xl text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-white">{subject.name}</h3>
                <p className="text-blue-100 text-sm mt-1">{subject.code}</p>
              </div>

              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">
                  Access study materials, videos, and resources
                </p>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Materials</h4>
                  <div className="space-y-2">
                    {subjectMaterials.slice(0, 2).map((material, idx) => (
                      <div key={material._id} className="flex items-center gap-2 text-sm">
                        {material.fileType === 'Video' && <FaPlay className="text-blue-500 text-xs" />}
                        {material.fileType === 'Image' && <FaImage className="text-green-500 text-xs" />}
                        {material.fileType === 'PDF' && <FaFilePdf className="text-red-600 text-xs" />}
                        {!['Video', 'Image', 'PDF'].includes(material.fileType) && <FaFileAlt className="text-gray-500 text-xs" />}
                        <span className="text-gray-700 truncate">{material.title}</span>
                      </div>
                    ))}
                    {subjectMaterials.length === 0 && (
                      <p className="text-gray-400 text-sm">No materials available</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => openMaterialsModal(subject)}
                  className="w-full bg-white border-2 border-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-200 font-medium"
                >
                  View All Materials
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Materials Modal */}
      {showModal && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedSubject.name}</h2>
                <p className="text-blue-100 text-sm mt-1">All Study Materials</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {(materials[selectedSubject._id] || []).length === 0 ? (
                <div className="text-center py-12">
                  <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No materials available yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(materials[selectedSubject._id] || []).map((material) => (
                    <div key={material._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl mt-1">
                          {getFileIcon(material.fileType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 truncate">{material.title}</h4>
                          {material.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{material.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{material.fileType}</span>
                            <span>{formatFileSize(material.fileSize)}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-2">
                            Uploaded: {new Date(material.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        {material.fileType === 'Link' || material.fileUrl.startsWith('http') ? (
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all text-center text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <FaPlay /> Click to View
                          </a>
                        ) : material.fileType === 'Video' ? (
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-all text-center text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <FaPlay /> Watch Video
                          </a>
                        ) : material.fileType === 'Image' ? (
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all text-center text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <FaImage /> View Image
                          </a>
                        ) : (
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-all text-center text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <FaDownload /> Download
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
