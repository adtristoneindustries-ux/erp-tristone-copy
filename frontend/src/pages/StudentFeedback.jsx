import { useState, useEffect, useContext } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { userAPI, feedbackAPI } from '../services/api';

const StudentFeedback = () => {
  const { user } = useContext(AuthContext);
  const [recipientType, setRecipientType] = useState('admin');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [receivedFeedback, setReceivedFeedback] = useState([]);
  const [sentFeedback, setSentFeedback] = useState([]);

  useEffect(() => {
    fetchStaff();
    fetchReceivedFeedback();
    fetchSentFeedback();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await userAPI.getUsers({ role: 'staff' });
      setStaffList(res.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchReceivedFeedback = async () => {
    try {
      const res = await feedbackAPI.getReceivedFeedback();
      setReceivedFeedback(res.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const fetchSentFeedback = async () => {
    try {
      const res = await feedbackAPI.getSentFeedback();
      setSentFeedback(res.data);
    } catch (error) {
      console.error('Error fetching sent feedback:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      alert('Please enter your feedback');
      return;
    }
    
    try {
      let recipientId;
      if (recipientType === 'admin') {
        const adminRes = await userAPI.getUsers({ role: 'admin' });
        recipientId = adminRes.data[0]?._id;
      } else {
        recipientId = selectedRecipient;
      }

      await feedbackAPI.sendFeedback({
        to: recipientId,
        message: feedback,
        isAnonymous: true
      });

      alert('Feedback sent successfully!');
      setFeedback('');
      setSelectedRecipient('');
      fetchSentFeedback();
    } catch (error) {
      alert('Failed to send feedback: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold mb-6">Student Feedback</h1>

            {/* Submit Feedback Section */}
            <div className="bg-blue-50 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-2 text-blue-700">Submit Anonymous Feedback</h2>
              <p className="text-sm text-gray-600 mb-4">Your feedback helps us improve. All feedback is anonymous.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Recipient Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Send Feedback To</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="admin"
                        checked={recipientType === 'admin'}
                        onChange={(e) => {
                          setRecipientType(e.target.value);
                          setSelectedRecipient('');
                        }}
                        className="mr-2"
                      />
                      Admin
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="staff"
                        checked={recipientType === 'staff'}
                        onChange={(e) => setRecipientType(e.target.value)}
                        className="mr-2"
                      />
                      Staff/Teacher
                    </label>
                  </div>
                </div>

                {/* Staff Selection */}
                {recipientType === 'staff' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Teacher</label>
                    <select
                      value={selectedRecipient}
                      onChange={(e) => setSelectedRecipient(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Choose a teacher...</option>
                      {staffList.map(staff => (
                        <option key={staff._id} value={staff._id}>
                          {staff.name} {staff.subject ? `(${staff.subject})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Feedback Textarea */}
                <div>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Share your thoughts, suggestions, or concerns..."
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send size={20} />
                  Submit Feedback
                </button>
              </form>
            </div>

            {/* Recent Feedback from Teachers */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="text-green-600" />
                Received Feedback from Teachers
              </h2>
              
              <div className="space-y-4">
                {receivedFeedback.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No feedback received yet</p>
                ) : (
                  receivedFeedback.map((fb, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-green-500 bg-green-50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {fb.isAnonymous ? 'Anonymous' : fb.from?.name} {fb.from?.subject ? `(${fb.from.subject})` : ''}
                        </h3>
                        <span className="text-sm text-gray-500">{new Date(fb.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700">{fb.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sent Feedback */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="text-blue-600" />
                My Sent Feedback
              </h2>
              
              <div className="space-y-3">
                {sentFeedback.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No feedback sent yet</p>
                ) : (
                  sentFeedback.map((fb, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            To: {fb.to?.name} {fb.to?.role ? `(${fb.to.role})` : ''}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{fb.message}</p>
                        </div>
                        <span className="text-sm text-gray-500">{new Date(fb.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeedback;
