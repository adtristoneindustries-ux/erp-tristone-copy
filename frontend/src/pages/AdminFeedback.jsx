import { useState, useEffect } from 'react';
import { MessageSquare, Send, TrendingUp, Users } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { userAPI, classAPI, feedbackAPI } from '../services/api';

const AdminFeedback = () => {
  const [recipientType, setRecipientType] = useState('staff');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackStats, setFeedbackStats] = useState({
    totalSent: 0,
    thisMonth: 0,
    pending: 0
  });
  const [sentFeedback, setSentFeedback] = useState([]);
  const [receivedFeedback, setReceivedFeedback] = useState([]);

  useEffect(() => {
    fetchStudents();
    fetchStaff();
    fetchClasses();
    fetchSentFeedback();
    fetchReceivedFeedback();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await userAPI.getUsers({ role: 'student' });
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await userAPI.getUsers({ role: 'staff' });
      setStaff(res.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await classAPI.getClasses();
      setClasses(res.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSentFeedback = async () => {
    try {
      const res = await feedbackAPI.getSentFeedback();
      setSentFeedback(res.data);
      setFeedbackStats(prev => ({ ...prev, totalSent: res.data.length }));
    } catch (error) {
      console.error('Error fetching sent feedback:', error);
    }
  };

  const fetchReceivedFeedback = async () => {
    try {
      const res = await feedbackAPI.getReceivedFeedback();
      setReceivedFeedback(res.data);
    } catch (error) {
      console.error('Error fetching received feedback:', error);
    }
  };

  const getFilteredStudents = () => {
    return students.filter(student => {
      if (filterClass && student.class !== filterClass) return false;
      if (filterSection && student.section !== filterSection) return false;
      return true;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      alert('Please enter your feedback');
      return;
    }
    
    try {
      await feedbackAPI.sendFeedback({
        to: selectedRecipient,
        message: feedback
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
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold mb-6">Admin Feedback Management</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Feedback Sent</p>
                    <p className="text-3xl font-bold text-blue-600">{feedbackStats.totalSent}</p>
                  </div>
                  <MessageSquare className="text-blue-600" size={40} />
                </div>
              </div>
              <div className="bg-green-50 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-3xl font-bold text-green-600">{feedbackStats.thisMonth}</p>
                  </div>
                  <TrendingUp className="text-green-600" size={40} />
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Review</p>
                    <p className="text-3xl font-bold text-orange-600">{feedbackStats.pending}</p>
                  </div>
                  <Users className="text-orange-600" size={40} />
                </div>
              </div>
            </div>

            {/* Send Feedback Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-700">Send Feedback</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Recipient Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Send Feedback To</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="staff"
                        checked={recipientType === 'staff'}
                        onChange={(e) => {
                          setRecipientType(e.target.value);
                          setSelectedRecipient('');
                          setFilterClass('');
                          setFilterSection('');
                        }}
                        className="mr-2"
                      />
                      Staff/Teacher
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="student"
                        checked={recipientType === 'student'}
                        onChange={(e) => {
                          setRecipientType(e.target.value);
                          setSelectedRecipient('');
                        }}
                        className="mr-2"
                      />
                      Student
                    </label>
                  </div>
                </div>

                {/* Student Filters */}
                {recipientType === 'student' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
                      <select
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Classes</option>
                        {[...new Set(classes.map(c => c.className))].map(cls => (
                          <option key={cls} value={cls}>Class {cls}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Section</label>
                      <select
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Sections</option>
                        {[...new Set(classes.map(c => c.section))].map(sec => (
                          <option key={sec} value={sec}>Section {sec}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Recipient Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select {recipientType === 'staff' ? 'Staff Member' : 'Student'}
                  </label>
                  <select
                    value={selectedRecipient}
                    onChange={(e) => setSelectedRecipient(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose {recipientType === 'staff' ? 'a staff member' : 'a student'}...</option>
                    {recipientType === 'staff' ? (
                      staff.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.name} {s.subject ? `(${s.subject})` : ''}
                        </option>
                      ))
                    ) : (
                      getFilteredStudents().map(student => (
                        <option key={student._id} value={student._id}>
                          {student.name} - {student.class}-{student.section} (Roll: {student.rollNumber})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Feedback Textarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Message</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Enter your feedback message..."
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  <Send size={20} />
                  Send Feedback
                </button>
              </form>
            </div>

            {/* Received Feedback */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="text-green-600" />
                Received Feedback
              </h2>
              
              <div className="space-y-3">
                {receivedFeedback.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No feedback received yet</p>
                ) : (
                  receivedFeedback.map((fb, index) => (
                    <div key={index} className="border-l-4 border-green-500 bg-green-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-800">
                              From: {fb.isAnonymous ? 'Anonymous' : fb.from?.name}
                            </p>
                            <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                              {fb.from?.role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{fb.message}</p>
                        </div>
                        <span className="text-sm text-gray-500 ml-4">{new Date(fb.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sent Feedback */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="text-blue-600" />
                Sent Feedback
              </h2>
              
              <div className="space-y-3">
                {sentFeedback.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No feedback sent yet</p>
                ) : (
                  sentFeedback.map((fb, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-800">
                              To: {fb.to?.name} {fb.to?.class ? `(${fb.to.class}-${fb.to.section})` : ''}
                            </p>
                            <span className={`px-2 py-1 text-xs rounded ${
                              fb.to?.role === 'staff' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {fb.to?.role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{fb.message}</p>
                        </div>
                        <span className="text-sm text-gray-500 ml-4">{new Date(fb.createdAt).toLocaleDateString()}</span>
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

export default AdminFeedback;
