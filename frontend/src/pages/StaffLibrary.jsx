import { useState, useEffect, useContext } from 'react';
import { Book, Search, BookmarkPlus, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function StaffLibrary() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('search');
  const [books, setBooks] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');

  useEffect(() => {
    fetchBooks();
    fetchCategories();
    fetchMyIssues();
    fetchMyReservations();
  }, [search, filterCategory, filterLanguage]);

  const fetchBooks = async () => {
    try {
      const res = await api.get(`/library/books?search=${search}&category=${filterCategory}&language=${filterLanguage}`);
      setBooks(res.data.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/library/categories');
      setCategories(res.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMyIssues = async () => {
    try {
      const res = await api.get('/library/issues');
      setMyIssues(res.data.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  const fetchMyReservations = async () => {
    try {
      const res = await api.get('/library/reservations');
      setMyReservations(res.data.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const handleReserve = async (bookId) => {
    try {
      await api.post('/library/reservations', { book_id: bookId });
      alert('Book reserved successfully!');
      fetchMyReservations();
    } catch (error) {
      alert(error.response?.data?.message || 'Error reserving book');
    }
  };

  const activeIssues = myIssues.filter(i => i.status === 'issued');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Library Portal</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Books Issued</p>
                  <p className="text-2xl font-bold">{activeIssues.length} / 5</p>
                </div>
                <Book className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Reservations</p>
                  <p className="text-2xl font-bold">{myReservations.filter(r => r.status === 'pending').length}</p>
                </div>
                <BookmarkPlus className="w-10 h-10 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pending Fines</p>
                  <p className="text-2xl font-bold text-red-600">
                    ₹{myIssues.reduce((sum, i) => sum + (i.fine_paid ? 0 : i.fine_amount), 0)}
                  </p>
                </div>
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b">
              <nav className="flex -mb-px">
                {['search', 'myBooks', 'reservations'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-medium capitalize ${
                      activeTab === tab
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'search' ? 'Search Books' : tab === 'myBooks' ? 'My Books' : 'My Reservations'}
                  </button>
                ))}
              </nav>
            </div>

            {/* Search Books Tab */}
            {activeTab === 'search' && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by title, author, ISBN..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Languages</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {books.map((book) => (
                    <div key={book._id} className="border rounded-lg p-4 hover:shadow-lg transition">
                      <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
                      <p className="text-sm text-gray-600 mb-1">by {book.author}</p>
                      <p className="text-xs text-gray-500 mb-2">{book.publisher}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {book.category?.name}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          book.available_copies > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {book.available_copies > 0 ? `${book.available_copies} Available` : 'Not Available'}
                        </span>
                      </div>
                      {book.available_copies === 0 && (
                        <button
                          onClick={() => handleReserve(book._id)}
                          className="w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 flex items-center justify-center gap-2"
                        >
                          <BookmarkPlus className="w-4 h-4" /> Reserve
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Books Tab */}
            {activeTab === 'myBooks' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fine</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activeIssues.map((issue) => {
                      const isOverdue = new Date(issue.due_date) < new Date();
                      return (
                        <tr key={issue._id} className={isOverdue ? 'bg-red-50' : ''}>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold">{issue.book_id?.title}</p>
                              <p className="text-sm text-gray-500">{issue.book_id?.author}</p>
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
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {issue.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {issue.fine_amount > 0 ? (
                              <span className="text-red-600 font-semibold">₹{issue.fine_amount}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {activeIssues.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          No books issued
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reservations Tab */}
            {activeTab === 'reservations' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {myReservations.map((reservation) => (
                      <tr key={reservation._id}>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold">{reservation.book_id?.title}</p>
                            <p className="text-sm text-gray-500">{reservation.book_id?.author}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {new Date(reservation.reservation_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            reservation.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {reservation.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {myReservations.length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                          No reservations
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
