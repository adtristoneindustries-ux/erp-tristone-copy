import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';

const StudentHomework = () => {
  const { user } = useContext(AuthContext);
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  console.log('StudentHomework component loaded');
  console.log('User object:', user);
  console.log('User ID:', user?._id);
  console.log('User id:', user?.id);

  useEffect(() => {
    console.log('useEffect triggered, user:', user);
    if (user && (user._id || user.id)) {
      console.log('Calling fetchHomework');
      fetchHomework();
    } else {
      console.log('User not ready, setting loading false');
      setLoading(false);
    }
  }, [user]);

  const fetchHomework = async () => {
    const userId = user._id || user.id;
    if (!user || !userId) {
      console.log('No user or userId');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      console.log('=== FETCHING HOMEWORK ===');
      console.log('User ID:', userId);
      console.log('User Class:', user.class);
      console.log('User Section:', user.section);
      console.log('API URL:', `/homework?studentId=${userId}`);
      
      const res = await api.get(`/homework?studentId=${userId}`);
      
      console.log('=== API RESPONSE ===');
      console.log('Status:', res.status);
      console.log('Data:', res.data);
      console.log('Count:', res.data.length);
      
      setHomework(res.data);
    } catch (error) {
      console.error('=== ERROR ===');
      console.error('Error:', error);
      console.error('Response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = (hw) => {
    setSelectedHomework(hw);
    setUploadModal(true);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api.post('/materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await api.post(`/homework/${selectedHomework._id}/submit`, {
        fileUrl: uploadRes.data.url,
        fileName: file.name
      });

      setUploadModal(false);
      setFile(null);
      fetchHomework();
    } catch (error) {
      console.error('Error submitting homework:', error);
      alert('Failed to submit homework');
    } finally {
      setUploading(false);
    }
  };

  const completedCount = homework.filter(hw => hw.status === 'completed').length;
  const totalCount = homework.length;

  if (loading) return <Layout><div className="p-6">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Homework & Assignments</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Overall Progress</h2>
            <span className="text-sm text-gray-600">{completedCount}/{totalCount} Completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-black h-3 rounded-full transition-all duration-300"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {homework.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No homework assigned yet</div>
          ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
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
                  <td className="px-6 py-4">
                    {hw.status === 'completed' ? (
                      <span className="px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-full flex items-center gap-1 w-fit">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        Completed
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-full flex items-center gap-1 w-fit">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                        </svg>
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {hw.status === 'completed' ? (
                      <span className="text-sm text-gray-500">Uploaded</span>
                    ) : (
                      <button
                        onClick={() => handleUploadClick(hw)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"/>
                        </svg>
                        Upload
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {uploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Upload Homework</h3>
              <p className="text-sm text-gray-600 mb-4">
                Subject: <span className="font-medium">{selectedHomework?.subject?.name}</span><br/>
                Topic: <span className="font-medium">{selectedHomework?.topic}</span>
              </p>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File (Image or Document)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadModal(false);
                      setFile(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={uploading || !file}
                  >
                    {uploading ? 'Uploading...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentHomework;
