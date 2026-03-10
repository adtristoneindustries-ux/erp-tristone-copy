import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Award, Upload, CheckCircle, Clock, Lock } from 'lucide-react';

const StudentBadges = () => {
  const { user } = useContext(AuthContext);
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState({ earned: 0, total: 0, percentage: 0 });
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await api.get('/badges/student');
      setBadges(res.data.data);
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('certificate', file);
    formData.append('badgeId', selectedBadge._id);

    try {
      await api.post('/badges/upload-certificate', formData);
      alert('Certificate uploaded successfully! Waiting for admin verification.');
      setUploadModal(false);
      setFile(null);
      fetchBadges();
    } catch (error) {
      alert('Upload failed: ' + error.response?.data?.message);
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'earned') return <CheckCircle className="text-green-500" size={20} />;
    if (status === 'pending') return <Clock className="text-yellow-500" size={20} />;
    return <Lock className="text-gray-400" size={20} />;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Badges & Achievements</h1>
        <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
          <Award className="text-yellow-500" size={40} />
          <div>
            <p className="text-sm text-gray-600">Progress</p>
            <p className="text-2xl font-bold">{stats.earned} / {stats.total}</p>
            <div className="w-48 bg-gray-200 rounded-full h-2 mt-1">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${stats.percentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div key={badge._id} className={`bg-white p-4 rounded-lg shadow ${badge.status === 'earned' ? 'border-2 border-yellow-400' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="text-4xl">{badge.icon}</div>
              {getStatusIcon(badge.status)}
            </div>
            <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{badge.category}</span>
            
            {badge.autoCalculate && badge.calculationType === 'perfect_attendance' && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Attendance Progress</span>
                  <span>{badge.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${badge.progress}%` }}></div>
                </div>
              </div>
            )}

            {badge.status === 'earned' && badge.earnedDate && (
              <p className="text-xs text-green-600 mt-2">Earned on {new Date(badge.earnedDate).toLocaleDateString()}</p>
            )}

            {badge.status === 'pending' && (
              <p className="text-xs text-yellow-600 mt-2">⏳ Waiting for verification</p>
            )}

            {badge.status === 'locked' && !badge.autoCalculate && (
              <button
                onClick={() => { setSelectedBadge(badge); setUploadModal(true); }}
                className="mt-3 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <Upload size={16} /> Upload Certificate
              </button>
            )}
          </div>
        ))}
      </div>

      {uploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Upload Certificate</h2>
            <p className="text-sm text-gray-600 mb-4">Badge: {selectedBadge?.name}</p>
            <form onSubmit={handleUpload}>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full border p-2 rounded mb-4"
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                  Upload
                </button>
                <button type="button" onClick={() => { setUploadModal(false); setFile(null); }} className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentBadges;
