import { useState, useEffect } from 'react';
import { Home, User, Phone, Mail, Clock, Calendar, AlertCircle, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { hostelAPI } from '../services/api';

const StudentHostel = () => {
  const [hostelData, setHostelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    issueType: '',
    description: '',
    priority: 'Medium'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHostelData();
  }, []);

  const fetchHostelData = async () => {
    try {
      const res = await hostelAPI.getMyHostel();
      setHostelData(res.data.data);
    } catch (error) {
      console.error('Error fetching hostel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseIssue = async (e) => {
    e.preventDefault();
    if (!issueForm.issueType || !issueForm.description) {
      alert('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await hostelAPI.raiseIssue(issueForm);
      alert('Issue raised successfully!');
      setShowIssueModal(false);
      setIssueForm({ issueType: '', description: '', priority: 'Medium' });
    } catch (error) {
      alert('Failed to raise issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Navbar />
          <div className="p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading hostel details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hostelData) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Navbar />
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Home size={64} className="mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-bold mb-2">No Hostel Assigned</h2>
              <p className="text-gray-600">Please contact the administration for hostel assignment.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <h1 className="text-2xl font-bold mb-6">Hostel Room Information</h1>

          {/* Room Details & Warden Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Room Details Card */}
            <div className="bg-purple-50 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4 text-purple-700">Room Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Hostel Name</p>
                  <p className="font-bold text-lg">{hostelData.hostelName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Room Number</p>
                  <p className="font-bold text-lg">{hostelData.roomNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Room Type</p>
                  <p className="font-bold text-lg">{hostelData.roomType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Roommates</p>
                  <p className="font-bold text-lg">{hostelData.roommates} Students</p>
                </div>
              </div>
            </div>

            {/* Warden Information Card */}
            <div className="bg-blue-50 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold mb-4 text-blue-700">Warden Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Warden Name</p>
                    <p className="font-bold text-lg">{hostelData.wardenName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Contact Number</p>
                    <p className="font-bold text-lg">{hostelData.wardenContact}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-bold text-lg break-all">{hostelData.wardenEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Office Hours</p>
                    <p className="font-bold text-lg">{hostelData.officeHours}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Laundry Schedule */}
          <div className="bg-green-50 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 text-green-700">Laundry Schedule</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {hostelData.laundrySchedule?.map((schedule, index) => (
                <div key={index} className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <p className="font-bold text-lg mb-1">{schedule.day}</p>
                  <p className="text-sm text-gray-600">{schedule.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notice */}
          {hostelData.notices && hostelData.notices.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 mb-1">Notice</h3>
                  <p className="text-sm text-yellow-800">{hostelData.notices[0].message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Raise Issue Button */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={() => setShowIssueModal(true)}
              className="w-full lg:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <AlertCircle size={20} />
              Raise Hostel Issue
            </button>
          </div>
        </div>
      </div>

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Raise Hostel Issue</h2>
              <button
                onClick={() => setShowIssueModal(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleRaiseIssue} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={issueForm.issueType}
                  onChange={(e) => setIssueForm({ ...issueForm, issueType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Issue Type</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Cleanliness">Cleanliness</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Security">Security</option>
                  <option value="Food">Food Quality</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={issueForm.priority}
                  onChange={(e) => setIssueForm({ ...issueForm, priority: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe your issue in detail..."
                  required
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHostel;
