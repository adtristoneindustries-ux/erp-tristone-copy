import { useState, useEffect } from 'react';
import { BookmarkCheck, CheckCircle, XCircle, BookOpen, Clock, X } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const statusColor = (s) =>
  s === 'pending' ? 'bg-yellow-100 text-yellow-700' :
  s === 'approved' ? 'bg-green-100 text-green-700' :
  s === 'rejected' ? 'bg-red-100 text-red-700' :
  s === 'fulfilled' ? 'bg-blue-100 text-blue-700' :
  s === 'cancelled' ? 'bg-gray-100 text-gray-500' :
  'bg-gray-100 text-gray-600';

export default function LibrarianReservations() {
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueReservation, setIssueReservation] = useState(null);
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    try {
      const res = await api.get('/library/reservations');
      setReservations(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async (id, status) => {
    try {
      await api.put(`/library/reservations/${id}`, { status });
      fetchReservations();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const openIssueModal = (reservation) => {
    setIssueReservation(reservation);
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setDueDate(d.toISOString().split('T')[0]);
    setShowIssueModal(true);
  };

  const handleIssueNow = async (e) => {
    e.preventDefault();
    if (!dueDate) return;
    setSaving(true);
    try {
      // Approve with due_date → backend auto-issues
      await api.put(`/library/reservations/${issueReservation._id}`, {
        status: 'approved',
        due_date: dueDate
      });
      setShowIssueModal(false);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Error issuing book');
    } finally { setSaving(false); }
  };

  const tabs = [
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'fulfilled', label: 'Fulfilled' },
    { id: 'all', label: 'All' },
  ];

  const filtered = activeTab === 'all' ? reservations : reservations.filter(r => r.status === activeTab);
  const pendingCount = reservations.filter(r => r.status === 'pending').length;
  const approvedCount = reservations.filter(r => r.status === 'approved').length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg"><BookmarkCheck className="text-purple-600" size={24} /></div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Book Reservations</h1>
              <p className="text-xs text-gray-500">{pendingCount} pending · {approvedCount} approved</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Pending', value: reservations.filter(r=>r.status==='pending').length, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
              { label: 'Approved', value: reservations.filter(r=>r.status==='approved').length, color: 'bg-green-50 text-green-700 border-green-200' },
              { label: 'Fulfilled', value: reservations.filter(r=>r.status==='fulfilled').length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
              { label: 'Rejected/Cancelled', value: reservations.filter(r=>['rejected','cancelled'].includes(r.status)).length, color: 'bg-gray-50 text-gray-600 border-gray-200' },
            ].map(s => (
              <div key={s.label} className={`border rounded-xl p-3 text-center ${s.color}`}>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-100 px-4 flex gap-1 pt-2">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${activeTab === t.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                  {t.label}
                  {t.id === 'pending' && pendingCount > 0 && (
                    <span className="ml-1.5 bg-yellow-400 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Book','Member','Class / Role','Reserved On','Status','Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No reservations found</td></tr>
                  ) : filtered.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm text-gray-900">{r.book_id?.title}</p>
                        <p className="text-xs text-gray-400">{r.book_id?.author}</p>
                        <p className="text-[10px] text-gray-300">Avail: {r.book_id?.available_copies ?? '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm text-gray-900">{r.member_id?.name}</p>
                        <p className="text-xs text-gray-400">{r.member_id?.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        {r.member_id?.class ? (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                            Class {r.member_id.class}{r.member_id.section ? ` - ${r.member_id.section}` : ''}
                          </span>
                        ) : (
                          <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full capitalize">{r.member_id?.role}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(r.reservation_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(r.status)}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {r.status === 'pending' && (
                            <>
                              <button onClick={() => openIssueModal(r)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium transition-colors">
                                <BookOpen size={12} /> Approve & Issue
                              </button>
                              <button onClick={() => handleUpdate(r._id, 'rejected')}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-xs font-medium transition-colors">
                                <XCircle size={12} /> Reject
                              </button>
                            </>
                          )}
                          {r.status === 'approved' && (
                            <button onClick={() => openIssueModal(r)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium transition-colors">
                              <BookOpen size={12} /> Issue Now
                            </button>
                          )}
                          {r.status === 'fulfilled' && (
                            <span className="text-xs text-blue-500 font-medium flex items-center gap-1">
                              <CheckCircle size={12} /> Issued
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Issue Now Modal */}
      {showIssueModal && issueReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Approve & Issue Book</h2>
                <p className="text-xs text-gray-400 mt-0.5">Set due date and issue to member</p>
              </div>
              <button onClick={() => setShowIssueModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleIssueNow} className="p-5 space-y-4">
              {/* Book info */}
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-500 font-medium mb-1">Book</p>
                <p className="font-semibold text-gray-900">{issueReservation.book_id?.title}</p>
                <p className="text-xs text-gray-500">{issueReservation.book_id?.author}</p>
              </div>
              {/* Member info */}
              <div className="p-3 bg-green-50 rounded-xl">
                <p className="text-xs text-green-500 font-medium mb-1">Member</p>
                <p className="font-semibold text-gray-900">{issueReservation.member_id?.name}</p>
                <p className="text-xs text-gray-500">
                  {issueReservation.member_id?.class
                    ? `Class ${issueReservation.member_id.class}${issueReservation.member_id.section ? ` - ${issueReservation.member_id.section}` : ''}`
                    : issueReservation.member_id?.email}
                </p>
              </div>
              {/* Due date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input type="date" required min={new Date().toISOString().split('T')[0]}
                  value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-medium text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                  <BookOpen size={15} /> {saving ? 'Issuing...' : 'Issue Book'}
                </button>
                <button type="button" onClick={() => setShowIssueModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl hover:bg-gray-200 font-medium text-sm">
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
