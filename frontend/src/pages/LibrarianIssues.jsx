import { useState, useEffect, useRef } from 'react';
import { BookOpen, RotateCcw, DollarSign, Search, X, ChevronDown, User, Users, GraduationCap, Check } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

// ── Smart Member Selector ─────────────────────────────────────────────────
function MemberSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) fetchMembers();
  }, [open, roleFilter, classFilter, sectionFilter, search]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (classFilter) params.append('class', classFilter);
      if (sectionFilter) params.append('section', sectionFilter);
      const res = await api.get(`/users?${params}`);
      const all = res.data.data || res.data || [];
      // extract unique classes & sections
      const cls = [...new Set(all.filter(u => u.class).map(u => u.class))].sort();
      const sec = [...new Set(all.filter(u => u.section).map(u => u.section))].sort();
      setClasses(cls);
      setSections(sec);
      // apply search filter client-side
      const filtered = all.filter(u => {
        if (!['student','staff','librarian','canteen'].includes(u.role)) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) ||
               u.rollNumber?.toLowerCase().includes(q) || u.staffId?.toLowerCase().includes(q);
      });
      setMembers(filtered);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const selected = value?._id ? value : null;

  const handleSelect = (member) => {
    onChange(member);
    setOpen(false);
    setSearch('');
  };

  const roleLabel = (role) => role === 'student' ? 'Student' : role === 'staff' ? 'Staff' : role === 'librarian' ? 'Librarian' : 'Canteen';
  const roleBadge = (role) =>
    role === 'student' ? 'bg-blue-100 text-blue-700' :
    role === 'staff' ? 'bg-green-100 text-green-700' :
    'bg-purple-100 text-purple-700';

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors">
        {selected ? (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <User size={13} className="text-blue-600" />
            </div>
            <div className="min-w-0 text-left">
              <p className="font-medium text-gray-900 truncate">{selected.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{selected.class ? `Class ${selected.class}${selected.section ? ' - ' + selected.section : ''}` : selected.email}</p>
            </div>
            <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${roleBadge(selected.role)}`}>{roleLabel(selected.role)}</span>
          </div>
        ) : (
          <span className="text-gray-400">Search and select member...</span>
        )}
        <ChevronDown size={15} className={`text-gray-400 flex-shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden" style={{minWidth: '320px'}}>
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input autoFocus type="text" placeholder="Search by name, email, roll no..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Filters */}
          <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-2">
            {/* Role filter */}
            <div className="flex gap-1">
              {[['all','All'],['student','Students'],['staff','Staff']].map(([v,l]) => (
                <button key={v} type="button" onClick={() => { setRoleFilter(v); setClassFilter(''); setSectionFilter(''); }}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${roleFilter === v ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}>
                  {l}
                </button>
              ))}
            </div>
            {/* Class filter — only for students */}
            {(roleFilter === 'student' || roleFilter === 'all') && classes.length > 0 && (
              <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white">
                <option value="">All Classes</option>
                {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            )}
            {(roleFilter === 'student' || roleFilter === 'all') && sections.length > 0 && (
              <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white">
                <option value="">All Sections</option>
                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            )}
          </div>

          {/* Member list */}
          <div className="max-h-56 overflow-y-auto">
            {loading ? (
              <div className="text-center py-6 text-gray-400 text-sm">Loading...</div>
            ) : members.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">No members found</div>
            ) : members.map(m => (
              <div key={m._id} onClick={() => handleSelect(m)}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors
                  ${selected?._id === m._id ? 'bg-blue-50' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{m.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                    <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${roleBadge(m.role)}`}>{roleLabel(m.role)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    {m.class && <span className="flex items-center gap-0.5"><GraduationCap size={9} />Class {m.class}{m.section ? ` - ${m.section}` : ''}</span>}
                    {m.rollNumber && <span>Roll: {m.rollNumber}</span>}
                    {!m.class && <span>{m.email}</span>}
                  </div>
                </div>
                {selected?._id === m._id && <Check size={14} className="text-blue-600 flex-shrink-0" />}
              </div>
            ))}
          </div>

          {/* Clear */}
          {selected && (
            <div className="border-t border-gray-100 p-2">
              <button type="button" onClick={() => { onChange(null); setOpen(false); }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <X size={12} /> Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function LibrarianIssues() {
  const [activeTab, setActiveTab] = useState('active');
  const [issues, setIssues] = useState([]);
  const [books, setBooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({ book_id: '', due_date: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchIssues(); fetchBooks(); }, []);

  const fetchIssues = async () => {
    try {
      const res = await api.get('/library/issues');
      setIssues(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchBooks = async () => {
    try {
      const res = await api.get('/library/books?availability=available');
      setBooks(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!selectedMember) { alert('Please select a member'); return; }
    setSaving(true);
    try {
      await api.post('/library/issues', { ...formData, member_id: selectedMember._id });
      setShowModal(false);
      setSelectedMember(null);
      setFormData({ book_id: '', due_date: '' });
      fetchIssues(); fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error issuing book');
    } finally { setSaving(false); }
  };

  const handleReturn = async (id) => {
    if (!confirm('Mark this book as returned?')) return;
    try { await api.put(`/library/issues/${id}/return`); fetchIssues(); fetchBooks(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleCollectFine = async (id) => {
    if (!confirm('Mark fine as collected?')) return;
    try { await api.put(`/library/issues/${id}/collect-fine`); fetchIssues(); }
    catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const activeIssues = issues.filter(i => i.status === 'issued');
  const returnedIssues = issues.filter(i => i.status === 'returned');
  const overdueCount = activeIssues.filter(i => new Date(i.due_date) < new Date()).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><BookOpen className="text-green-600" size={24} /></div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Issue & Return</h1>
                <p className="text-xs text-gray-500">{activeIssues.length} active · {overdueCount} overdue</p>
              </div>
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm">
              <BookOpen size={16} /> Issue Book
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Active Issues', value: activeIssues.length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { label: 'Overdue', value: overdueCount, color: 'bg-red-50 text-red-700 border-red-200' },
              { label: 'Returned Today', value: returnedIssues.filter(i => new Date(i.return_date).toDateString() === new Date().toDateString()).length, color: 'bg-green-50 text-green-700 border-green-200' },
              { label: 'Pending Fines', value: `₹${issues.reduce((s,i) => s + (!i.fine_paid ? i.fine_amount : 0), 0)}`, color: 'bg-orange-50 text-orange-700 border-orange-200' },
            ].map(s => (
              <div key={s.label} className={`border rounded-xl p-3 text-center ${s.color}`}>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs + Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-4 flex gap-1 pt-2">
              {[['active','Active Issues'],['returned','Returned']].map(([t,l]) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${activeTab === t ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                  {l}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Book','Member','Issue Date','Due Date', ...(activeTab==='returned'?['Return Date']:[]),'Fine','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(activeTab === 'active' ? activeIssues : returnedIssues).map(issue => {
                    const overdue = new Date(issue.due_date) < new Date() && issue.status === 'issued';
                    return (
                      <tr key={issue._id} className={overdue ? 'bg-red-50' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-sm text-gray-900">{issue.book_id?.title}</p>
                          <p className="text-xs text-gray-400">{issue.book_id?.author}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-sm text-gray-900">{issue.member_id?.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {issue.member_id?.class && (
                              <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                                Class {issue.member_id.class}{issue.member_id.section ? ` - ${issue.member_id.section}` : ''}
                              </span>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${issue.member_id?.role === 'student' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}>
                              {issue.member_id?.role}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(issue.issue_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${overdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {new Date(issue.due_date).toLocaleDateString()}
                          </span>
                        </td>
                        {activeTab === 'returned' && (
                          <td className="px-4 py-3 text-sm text-gray-600">{issue.return_date ? new Date(issue.return_date).toLocaleDateString() : '—'}</td>
                        )}
                        <td className="px-4 py-3">
                          {issue.fine_amount > 0 ? (
                            <div>
                              <p className="text-sm font-semibold text-red-600">₹{issue.fine_amount}</p>
                              {!issue.fine_paid && <p className="text-[10px] text-red-400">Pending</p>}
                              {issue.fine_paid && <p className="text-[10px] text-green-500">Paid</p>}
                            </div>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {activeTab === 'active' && (
                              <button onClick={() => handleReturn(issue._id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-xs font-medium transition-colors">
                                <RotateCcw size={12} /> Return
                              </button>
                            )}
                            {issue.fine_amount > 0 && !issue.fine_paid && (
                              <button onClick={() => handleCollectFine(issue._id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-xs font-medium transition-colors">
                                <DollarSign size={12} /> Collect
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {(activeTab === 'active' ? activeIssues : returnedIssues).length === 0 && (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Issue Book</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleIssue} className="p-5 space-y-4">

              {/* Member Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Member * <span className="text-xs text-gray-400 font-normal">— students & staff</span>
                </label>
                <MemberSelector value={selectedMember} onChange={setSelectedMember} />
                {!selectedMember && <p className="text-xs text-red-400 mt-1">Please select a member</p>}
              </div>

              {/* Book */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Book *</label>
                <select required value={formData.book_id} onChange={e => setFormData({...formData, book_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option value="">Choose a book</option>
                  {books.map(b => (
                    <option key={b._id} value={b._id}>{b.title} — {b.author} (Avail: {b.available_copies})</option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input type="date" required min={new Date().toISOString().split('T')[0]}
                  value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving || !selectedMember}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-medium text-sm disabled:opacity-60 transition-colors">
                  {saving ? 'Issuing...' : 'Issue Book'}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 font-medium text-sm transition-colors">
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
