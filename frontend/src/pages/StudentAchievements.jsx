import { useState, useEffect, useContext } from 'react';
import { Award, Lock, Upload, CheckCircle, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { badgeAPI } from '../services/api';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';

const StudentAchievements = () => {
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState({ earned: 0, total: 0, percentage: 0 });
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchBadges();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('badgeUpdate', (data) => {
        if (data.studentId === user?.id) fetchBadges();
      });
      return () => socket.off('badgeUpdate');
    }
  }, [socket, user]);

  const fetchBadges = async () => {
    try {
      const res = await badgeAPI.getStudentBadges();
      setBadges(res.data.data);
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file');
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('certificate', file);
      formData.append('badgeId', selectedBadge._id);
      
      await badgeAPI.uploadCertificate(formData);
      alert('Certificate uploaded successfully! Waiting for admin approval.');
      setUploadModal(false);
      setFile(null);
      fetchBadges();
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'earned': return 'bg-green-50 border-green-200';
      case 'pending': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'earned': return <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><CheckCircle size={14} /> Earned</span>;
      case 'pending': return <span className="flex items-center gap-1 text-yellow-600 text-xs font-medium"><Clock size={14} /> Pending</span>;
      default: return <span className="flex items-center gap-1 text-gray-500 text-xs font-medium"><Lock size={14} /> Locked</span>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Badges & Achievements</h1>

          {/* Progress Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{stats.earned} of {stats.total} Badges Earned</h2>
                <p className="text-gray-600">{stats.percentage}% Complete</p>
              </div>
              <Award className="text-yellow-500" size={48} />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {badges.map((badge) => (
              <div 
                key={badge._id} 
                className={`rounded-lg border-2 p-6 transition-all ${getStatusColor(badge.status)} ${badge.status === 'locked' ? 'opacity-60' : ''}`}
              >
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">{badge.icon}</div>
                  <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{badge.category}</p>
                  <p className="text-xs text-gray-500">{badge.description}</p>
                </div>

                <div className="mb-3">
                  {getStatusBadge(badge.status)}
                </div>

                {badge.status === 'earned' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${badge.progress}%` }}></div>
                  </div>
                )}

                {badge.status === 'locked' && (
                  <button
                    onClick={() => {
                      setSelectedBadge(badge);
                      setUploadModal(true);
                    }}
                    className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Upload size={16} />
                    Upload Certificate
                  </button>
                )}

                {badge.status === 'pending' && (
                  <div className="mt-3 text-center text-sm text-yellow-600">
                    Awaiting admin approval
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Upload Certificate</h2>
            <p className="text-gray-600 mb-4">Badge: {selectedBadge?.name}</p>
            
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border rounded-lg p-2 mb-4"
            />
            
            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={() => {
                  setUploadModal(false);
                  setFile(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAchievements;
