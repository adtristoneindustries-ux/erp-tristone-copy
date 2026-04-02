import { useState, useEffect } from 'react';
import { Book, BookOpen, AlertCircle, TrendingUp, Package, UserPlus, Trash2, Library } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

function StatCard({ icon: Icon, title, value, color }) {
  const colors = { blue:'bg-blue-500', green:'bg-green-500', purple:'bg-purple-500', red:'bg-red-500', yellow:'bg-yellow-500', indigo:'bg-indigo-500' };
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
        </div>
        <div className={`${colors[color]} p-3 rounded-xl`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AdminLibrary() {
  const [stats, setStats] = useState({});
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [librarians, setLibrarians] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [allIssues, setAllIssues] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [portalTab, setPortalTab] = useState('overview');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, booksRes, issuesRes, libRes, staffRes, allIssuesRes, allBooksRes] = await Promise.all([
        api.get('/library/stats'),
        api.get('/library/reports/most-borrowed'),
        api.get('/library/issues?status=issued'),
        api.get('/users?role=librarian'),
        api.get('/users'),
        api.get('/library/issues'),
        api.get('/library/books')
      ]);
      setStats(statsRes.data.data);
      setMostBorrowed(booksRes.data.data.slice(0, 5));
      setOverdueBooks(issuesRes.data.data.filter(i => new Date(i.due_date) < new Date()));
      setLibrarians(libRes.data.data || []);
      const allUsers = staffRes.data.data || staffRes.data || [];
      setAllStaff(allUsers.filter(u => u.role === 'staff' || u.role === 'teacher'));
      setAllIssues(allIssuesRes.data.data || []);
      setAllBooks(allBooksRes.data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedStaff) { alert('Please select a staff member'); return; }
    try {
      await api.put(`/users/${selectedStaff}`, { role: 'librarian' });
      alert('Librarian assigned! Staff must logout and login again.');
      setShowModal(false); setSelectedStaff(''); fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Error assigning librarian'); }
  };

  const handleRemove = async (id) => {
    if (!confirm('Remove librarian role?')) return;
    try { await api.put(`/users/${id}`, { role: 'staff' }); fetchData(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <Library className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Library Management</h1>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[['overview','Overview'],['issues','All Issues'],['books','All Books']].map(([t,l]) => (
              <button key={t} onClick={() => setPortalTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  portalTab === t ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                }`}>{l}</button>
            ))}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {portalTab === 'overview' && (
            <>
              {/* Library Staff */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Library Staff</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Manage librarians</p>
                    <p className="text-xs text-orange-500 mt-0.5">⚠️ Staff must logout & login again after assignment</p>
                  </div>
                  <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    <UserPlus size={16} /> Assign Librarian
                  </button>
                </div>
                <div className="p-5">
                  {librarians.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No librarians assigned yet</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {librarians.map(lib => (
                        <div key={lib._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-bold text-sm">{lib.name?.[0]}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{lib.name}</p>
                              <p className="text-xs text-gray-400">{lib.email}</p>
                            </div>
                          </div>
                          <button onClick={() => handleRemove(lib._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
                <StatCard icon={Book} title="Total Books" value={stats.totalBooks || 0} color="blue" />
                <StatCard icon={Package} title="Categories" value={stats.totalCategories || 0} color="purple" />
                <StatCard icon={BookOpen} title="Issued" value={stats.issuedBooks || 0} color="green" />
                <StatCard icon={Book} title="Available" value={stats.availableBooks || 0} color="indigo" />
                <StatCard icon={AlertCircle} title="Overdue" value={stats.overdueBooks || 0} color="red" />
                <StatCard icon={TrendingUp} title="Reserved" value={stats.reservedBooks || 0} color="yellow" />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Most Borrowed Books</h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={mostBorrowed}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="book.title" angle={-30} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Library Statistics</h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={[
                        { name: 'Available', value: stats.availableBooks || 0 },
                        { name: 'Issued', value: stats.issuedBooks || 0 },
                        { name: 'Reserved', value: stats.reservedBooks || 0 },
                        { name: 'Lost', value: stats.lostBooks || 0 }
                      ]} cx="50%" cy="50%" outerRadius={90}
                        labelLine={false} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                        dataKey="value">
                        {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Overdue */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900">Overdue Books ({overdueBooks.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Book','Member','Due Date','Days Late','Fine'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {overdueBooks.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">No overdue books</td></tr>
                      ) : overdueBooks.map(issue => {
                        const daysLate = Math.ceil((new Date() - new Date(issue.due_date)) / (1000*60*60*24));
                        return (
                          <tr key={issue._id} className="hover:bg-red-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{issue.book_id?.title}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{issue.member_id?.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{new Date(issue.due_date).toLocaleDateString()}</td>
                            <td className="px-4 py-3"><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">{daysLate} days</span></td>
                            <td className="px-4 py-3 font-semibold text-red-600">₹{daysLate * 5}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── ALL ISSUES TAB ── */}
          {portalTab === 'issues' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">All Book Issues ({allIssues.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Book','Member','Class / Role','Issue Date','Due Date','Status','Fine'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allIssues.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No issues found</td></tr>
                    ) : allIssues.map(issue => {
                      const overdue = new Date(issue.due_date) < new Date() && issue.status === 'issued';
                      return (
                        <tr key={issue._id} className={overdue ? 'bg-red-50' : 'hover:bg-gray-50'}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-sm text-gray-900">{issue.book_id?.title}</p>
                            <p className="text-xs text-gray-400">{issue.book_id?.author}</p>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{issue.member_id?.name}</td>
                          <td className="px-4 py-3">
                            {issue.member_id?.class ? (
                              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                Class {issue.member_id.class}{issue.member_id.section ? ` - ${issue.member_id.section}` : ''}
                              </span>
                            ) : (
                              <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full capitalize">{issue.member_id?.role}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{new Date(issue.issue_date).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${overdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {new Date(issue.due_date).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              issue.status === 'issued' ? 'bg-blue-100 text-blue-700' :
                              issue.status === 'returned' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>{issue.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            {issue.fine_amount > 0 ? <span className="text-sm font-semibold text-red-600">₹{issue.fine_amount}</span> : <span className="text-gray-300">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ALL BOOKS TAB ── */}
          {portalTab === 'books' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">All Books ({allBooks.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Title','Author','Category','Total','Available','Location'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allBooks.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No books found</td></tr>
                    ) : allBooks.map(book => (
                      <tr key={book._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-sm text-gray-900">{book.title}</p>
                          <p className="text-xs text-gray-400">{book.isbn}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{book.author}</td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs">{book.category?.name}</span></td>
                        <td className="px-4 py-3 text-sm text-gray-700">{book.total_copies}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-semibold ${book.available_copies > 0 ? 'text-green-600' : 'text-red-500'}`}>{book.available_copies}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {[book.rack_number && `Rack: ${book.rack_number}`, book.shelf_number && `Shelf: ${book.shelf_number}`].filter(Boolean).join(' / ') || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Assign Librarian Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Assign Librarian</h2>
            </div>
            <form onSubmit={handleAssign} className="p-5">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Staff Member</label>
                <select required value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="">Choose staff member</option>
                  {allStaff.map(s => <option key={s._id} value={s._id}>{s.name} — {s.email}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-medium text-sm">Assign</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 font-medium text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
