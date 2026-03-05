import { useState, useEffect } from 'react';
import { BookOpen, RotateCcw, Clock, DollarSign } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function LibrarianIssues() {
  const [activeTab, setActiveTab] = useState('issue');
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    book_id: '', member_id: '', due_date: ''
  });

  useEffect(() => {
    fetchIssues();
    fetchBooks();
    fetchStudents();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await api.get('/library/issues');
      setIssues(res.data.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await api.get('/library/books?availability=available');
      setBooks(res.data.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/users?role=student');
      setStudents(res.data.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    try {
      await api.post('/library/issues', formData);
      alert('Book issued successfully');
      setShowModal(false);
      setFormData({ book_id: '', member_id: '', due_date: '' });
      fetchIssues();
      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Error issuing book');
    }
  };

  const handleReturn = async (id) => {
    if (!confirm('Mark this book as returned?')) return;
    try {
      await api.put(`/library/issues/${id}/return`);
      alert('Book returned successfully');
      fetchIssues();
      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Error returning book');
    }
  };

  const handleCollectFine = async (id) => {
    if (!confirm('Mark fine as collected?')) return;
    try {
      await api.put(`/library/issues/${id}/collect-fine`);
      alert('Fine collected successfully');
      fetchIssues();
    } catch (error) {
      alert(error.response?.data?.message || 'Error collecting fine');
    }
  };

  const activeIssues = issues.filter(i => i.status === 'issued');
  const returnedIssues = issues.filter(i => i.status === 'returned');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Issue & Return Management</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5" /> Issue Book
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b">
              <nav className="flex -mb-px">
                {['issue', 'returned'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-medium capitalize ${
                      activeTab === tab
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'issue' ? 'Active Issues' : 'Returned Books'}
                  </button>
                ))}
              </nav>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    {activeTab === 'returned' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Date</th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(activeTab === 'issue' ? activeIssues : returnedIssues).map((issue) => {
                    const isOverdue = new Date(issue.due_date) < new Date() && issue.status === 'issued';
                    return (
                      <tr key={issue._id} className={isOverdue ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold">{issue.book_id?.title}</p>
                            <p className="text-sm text-gray-500">{issue.book_id?.author}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold">{issue.member_id?.name}</p>
                            <p className="text-sm text-gray-500">{issue.member_id?.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(issue.issue_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {new Date(issue.due_date).toLocaleDateString()}
                          </span>
                        </td>
                        {activeTab === 'returned' && (
                          <td className="px-6 py-4 text-sm">
                            {issue.return_date ? new Date(issue.return_date).toLocaleDateString() : '-'}
                          </td>
                        )}
                        <td className="px-6 py-4">
                          {issue.fine_amount > 0 ? (
                            <div>
                              <p className="font-semibold text-red-600">₹{issue.fine_amount}</p>
                              {!issue.fine_paid && (
                                <span className="text-xs text-red-500">Pending</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {activeTab === 'issue' && (
                              <button
                                onClick={() => handleReturn(issue._id)}
                                className="text-green-600 hover:text-green-800 flex items-center gap-1"
                              >
                                <RotateCcw className="w-4 h-4" /> Return
                              </button>
                            )}
                            {issue.fine_amount > 0 && !issue.fine_paid && (
                              <button
                                onClick={() => handleCollectFine(issue._id)}
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <DollarSign className="w-4 h-4" /> Collect
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Issue Book</h2>
            </div>
            <form onSubmit={handleIssue} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Book *</label>
                  <select
                    required
                    value={formData.book_id}
                    onChange={(e) => setFormData({...formData, book_id: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a book</option>
                    {books.map(book => (
                      <option key={book._id} value={book._id}>
                        {book.title} - {book.author} (Available: {book.available_copies})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Select Member *</label>
                  <select
                    required
                    value={formData.member_id}
                    onChange={(e) => setFormData({...formData, member_id: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a member</option>
                    {students.map(student => (
                      <option key={student._id} value={student._id}>
                        {student.name} - {student.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  Issue Book
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
