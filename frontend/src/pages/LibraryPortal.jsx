import { useState, useEffect, useContext } from 'react';
import { Book, Search, BookmarkPlus, AlertCircle, Clock, RotateCcw, Library, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const statusBadge = (status) =>
  status === 'issued' ? 'bg-blue-100 text-blue-700' :
  status === 'returned' ? 'bg-green-100 text-green-700' :
  status === 'renewed' ? 'bg-purple-100 text-purple-700' :
  'bg-gray-100 text-gray-600';

const reservationBadge = (status) =>
  status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
  status === 'approved' ? 'bg-green-100 text-green-700' :
  'bg-red-100 text-red-700';

export default function LibraryPortal() {
  const { user } = useContext(AuthContext);
  const isStaff = user?.role !== 'student';
  const maxBooks = isStaff ? 5 : 3;

  const [activeTab, setActiveTab] = useState('browse');
  const [books, setBooks] = useState([]);
  const [myIssues, setMyIssues] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAvail, setFilterAvail] = useState('');

  useEffect(() => { fetchCategories(); fetchMyIssues(); fetchMyReservations(); }, []);
  useEffect(() => { fetchBooks(); }, [search, filterCategory, filterAvail]);

  const fetchBooks = async () => {
    try {
      const res = await api.get(`/library/books?search=${search}&category=${filterCategory}${filterAvail === 'available' ? '&availability=available' : ''}`);
      setBooks(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/library/categories');
      setCategories(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchMyIssues = async () => {
    try {
      const res = await api.get('/library/issues');
      setMyIssues(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchMyReservations = async () => {
    try {
      const res = await api.get('/library/reservations');
      setMyReservations(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleReserve = async (bookId) => {
    try {
      await api.post('/library/reservations', { book_id: bookId });
      fetchMyReservations();
      alert('Reserved! You will be notified when available.');
    } catch (err) { alert(err.response?.data?.message || 'Error reserving book'); }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!confirm('Cancel this reservation?')) return;
    try {
      await api.put(`/library/reservations/${reservationId}/cancel`);
      fetchMyReservations();
    } catch (err) { alert(err.response?.data?.message || 'Error cancelling reservation'); }
  };

  const handleRenew = async (issueId) => {
    try {
      await api.put(`/library/issues/${issueId}/renew`);
      fetchMyIssues();
    } catch (err) { alert(err.response?.data?.message || 'Renewal not allowed'); }
  };

  const activeIssues = myIssues.filter(i => i.status === 'issued' || i.status === 'renewed');
  const overdueIssues = activeIssues.filter(i => new Date(i.due_date) < new Date());
  const pendingFines = myIssues.reduce((s, i) => s + (!i.fine_paid ? i.fine_amount : 0), 0);
  const pendingReservations = myReservations.filter(r => r.status === 'pending').length;

  const tabs = [
    { id: 'browse', label: 'Browse Books', icon: Search },
    { id: 'mybooks', label: `My Books (${activeIssues.length}/${maxBooks})`, icon: Book },
    { id: 'reservations', label: `Reservations (${pendingReservations})`, icon: BookmarkPlus },
    { id: 'history', label: 'History', icon: Clock },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm">
              <Library className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Library Portal</h1>
              <p className="text-xs text-gray-500">Welcome, {user?.name}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-sm">
              <p className="text-2xl font-bold">{activeIssues.length}<span className="text-sm font-normal opacity-75">/{maxBooks}</span></p>
              <p className="text-xs opacity-90 mt-0.5">Books Issued</p>
            </div>
            <div className={`rounded-xl p-4 text-white shadow-sm ${overdueIssues.length > 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-green-500 to-green-600'}`}>
              <p className="text-2xl font-bold">{overdueIssues.length}</p>
              <p className="text-xs opacity-90 mt-0.5">Overdue</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-sm">
              <p className="text-2xl font-bold">{pendingReservations}</p>
              <p className="text-xs opacity-90 mt-0.5">Reservations</p>
            </div>
            <div className={`rounded-xl p-4 text-white shadow-sm ${pendingFines > 0 ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
              <p className="text-2xl font-bold">₹{pendingFines}</p>
              <p className="text-xs opacity-90 mt-0.5">Pending Fine</p>
            </div>
          </div>

          {/* Overdue alert */}
          {overdueIssues.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl mb-5 text-sm text-red-700">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span><strong>{overdueIssues.length} book(s)</strong> overdue! Fine: ₹5/day. Please return immediately.</span>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 overflow-x-auto">
              <nav className="flex min-w-max">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === id ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}>
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Browse Tab */}
            {activeTab === 'browse' && (
              <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
                    <input type="text" placeholder="Search by title, author, ISBN..."
                      value={search} onChange={e => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  </div>
                  <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  <select value={filterAvail} onChange={e => setFilterAvail(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="">All Books</option>
                    <option value="available">Available Only</option>
                  </select>
                </div>

                {books.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Book size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No books found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {books.map(book => {
                      const available = book.available_copies > 0;
                      const alreadyIssued = activeIssues.some(i => i.book_id?._id === book._id || i.book_id === book._id);
                      const myRequest = myReservations.find(r =>
                        (r.book_id?._id === book._id || r.book_id === book._id) &&
                        ['pending', 'approved'].includes(r.status)
                      );
                      return (
                        <div key={book._id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow bg-white flex flex-col">
                          <div className="flex items-start justify-between mb-2">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                              <Book size={18} className="text-indigo-600" />
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {available ? `${book.available_copies} Available` : 'Not Available'}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 text-sm mt-2 line-clamp-2">{book.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">by {book.author}</p>
                          <p className="text-xs text-gray-400">{book.publisher}</p>
                          <div className="mt-auto pt-3 flex items-center justify-between">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs">{book.category?.name}</span>
                            {/* Already issued */}
                            {alreadyIssued && (
                              <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                                <CheckCircle size={12} /> Issued
                              </span>
                            )}
                            {/* Has pending/approved request */}
                            {!alreadyIssued && myRequest && (
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  myRequest.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {myRequest.status === 'approved' ? '✓ Approved' : '⏳ Requested'}
                                </span>
                                <button onClick={() => handleCancelReservation(myRequest._id)}
                                  className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Cancel request">
                                  <XCircle size={13} />
                                </button>
                              </div>
                            )}
                            {/* Available — Request to borrow */}
                            {!alreadyIssued && !myRequest && available && (
                              <button onClick={() => handleReserve(book._id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium transition-colors">
                                <BookmarkPlus size={12} /> Request
                              </button>
                            )}
                            {/* Not available — Reserve for later */}
                            {!alreadyIssued && !myRequest && !available && (
                              <button onClick={() => handleReserve(book._id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-medium transition-colors">
                                <BookmarkPlus size={12} /> Reserve
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* My Books Tab */}
            {activeTab === 'mybooks' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Book','Issue Date','Due Date','Status','Fine','Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {activeIssues.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No books currently issued</td></tr>
                    ) : activeIssues.map(issue => {
                      const overdue = new Date(issue.due_date) < new Date();
                      const canRenew = issue.renewal_count < 2 && !overdue;
                      return (
                        <tr key={issue._id} className={overdue ? 'bg-red-50' : 'hover:bg-gray-50'}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-sm text-gray-900">{issue.book_id?.title}</p>
                            <p className="text-xs text-gray-400">{issue.book_id?.author}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{new Date(issue.issue_date).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${overdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {new Date(issue.due_date).toLocaleDateString()}
                            </span>
                            {overdue && <p className="text-[10px] text-red-500 mt-0.5">Overdue!</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(issue.status)}`}>{issue.status}</span>
                            {issue.renewal_count > 0 && <p className="text-[10px] text-gray-400 mt-0.5">Renewed {issue.renewal_count}x</p>}
                          </td>
                          <td className="px-4 py-3">
                            {issue.fine_amount > 0 ? <span className="text-sm font-semibold text-red-600">₹{issue.fine_amount}</span> : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            {canRenew && !isStaff && (
                              <button onClick={() => handleRenew(issue._id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-xs font-medium transition-colors">
                                <RefreshCw size={11} /> Renew ({2 - issue.renewal_count} left)
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reservations Tab */}
            {activeTab === 'reservations' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Book','Reserved On','Status','Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {myReservations.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-10 text-gray-400 text-sm">No reservations</td></tr>
                    ) : myReservations.map(r => (
                      <tr key={r._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-sm text-gray-900">{r.book_id?.title}</p>
                          <p className="text-xs text-gray-400">{r.book_id?.author}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(r.reservation_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${reservationBadge(r.status)}`}>{r.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          {r.status === 'pending' && (
                            <button onClick={() => handleCancelReservation(r._id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs font-medium transition-colors">
                              <XCircle size={12} /> Cancel
                            </button>
                          )}
                          {r.status === 'fulfilled' && (
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle size={12} /> Issued</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Book','Issue Date','Return Date','Fine','Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {myIssues.filter(i => i.status === 'returned').length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No history yet</td></tr>
                    ) : myIssues.filter(i => i.status === 'returned').map(issue => (
                      <tr key={issue._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-sm text-gray-900">{issue.book_id?.title}</p>
                          <p className="text-xs text-gray-400">{issue.book_id?.author}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(issue.issue_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{issue.return_date ? new Date(issue.return_date).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3">
                          {issue.fine_amount > 0 ? (
                            <span className={`text-sm font-medium ${issue.fine_paid ? 'text-green-600' : 'text-red-600'}`}>
                              ₹{issue.fine_amount} {issue.fine_paid ? '(Paid)' : '(Pending)'}
                            </span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle size={12} /> Returned
                          </span>
                        </td>
                      </tr>
                    ))}
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
