import { useState, useEffect, useRef } from 'react';
import { Book, Plus, Edit, Trash2, Search, QrCode, X, Tag, ChevronDown, Check, Pencil } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const EMPTY_BOOK = {
  title: '', isbn: '', author: '', publisher: '', edition: '',
  category: '', language: 'English', total_copies: 1, available_copies: 1,
  rack_number: '', shelf_number: '', description: ''
};

// ─── Smart Category Selector ───────────────────────────────────────────────
function CategorySelector({ categories, value, onChange, onCategoryCreated, onCategoryUpdated }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('select'); // 'select' | 'create' | 'edit'
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editingCat, setEditingCat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedCat = categories.find(c => c._id === value);

  const handleSelect = (catId) => {
    onChange(catId);
    setOpen(false);
    setMode('select');
  };

  const handleCreateSave = async () => {
    if (!newName.trim()) { setError('Category name is required'); return; }
    setSaving(true); setError('');
    try {
      const res = await api.post('/library/categories', { name: newName.trim(), description: newDesc.trim() });
      const created = res.data.data;
      onCategoryCreated(created);
      onChange(created._id);
      setNewName(''); setNewDesc('');
      setMode('select'); setOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally { setSaving(false); }
  };

  const handleEditSave = async () => {
    if (!newName.trim()) { setError('Category name is required'); return; }
    setSaving(true); setError('');
    try {
      const res = await api.put(`/library/categories/${editingCat._id}`, { name: newName.trim(), description: newDesc.trim() });
      onCategoryUpdated(res.data.data);
      if (value === editingCat._id) onChange(editingCat._id); // keep selection
      setEditingCat(null); setNewName(''); setNewDesc('');
      setMode('select');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category');
    } finally { setSaving(false); }
  };

  const startEdit = (e, cat) => {
    e.stopPropagation();
    setEditingCat(cat);
    setNewName(cat.name);
    setNewDesc(cat.description || '');
    setError('');
    setMode('edit');
  };

  const startCreate = () => {
    setNewName(''); setNewDesc(''); setError('');
    setMode('create');
  };

  const cancelInline = () => {
    setMode('select'); setNewName(''); setNewDesc(''); setError(''); setEditingCat(null);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setMode('select'); }}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors"
      >
        <span className={selectedCat ? 'text-gray-900 font-medium' : 'text-gray-400'}>
          {selectedCat ? (
            <span className="flex items-center gap-2">
              <Tag size={13} className="text-blue-500" />
              {selectedCat.name}
            </span>
          ) : 'Select or create category'}
        </span>
        <ChevronDown size={15} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">

          {/* Inline: Create */}
          {mode === 'create' && (
            <div className="p-3 border-b border-gray-100 bg-blue-50">
              <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1"><Plus size={12} /> New Category</p>
              <input
                autoFocus
                type="text"
                placeholder="Category name *"
                value={newName}
                onChange={e => { setNewName(e.target.value); setError(''); }}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm mb-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="text-xs text-red-500 mb-1.5">{error}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={handleCreateSave} disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-1">
                  <Check size={12} /> {saving ? 'Saving...' : 'Create & Select'}
                </button>
                <button type="button" onClick={cancelInline}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Inline: Edit */}
          {mode === 'edit' && editingCat && (
            <div className="p-3 border-b border-gray-100 bg-yellow-50">
              <p className="text-xs font-semibold text-yellow-700 mb-2 flex items-center gap-1"><Pencil size={12} /> Edit "{editingCat.name}"</p>
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={e => { setNewName(e.target.value); setError(''); }}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm mb-1.5 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              {error && <p className="text-xs text-red-500 mb-1.5">{error}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={handleEditSave} disabled={saving}
                  className="flex-1 bg-yellow-500 text-white py-1.5 rounded-lg text-xs font-medium hover:bg-yellow-600 disabled:opacity-60 flex items-center justify-center gap-1">
                  <Check size={12} /> {saving ? 'Saving...' : 'Update'}
                </button>
                <button type="button" onClick={cancelInline}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Category list */}
          <div className="max-h-48 overflow-y-auto">
            {categories.length === 0 && mode === 'select' && (
              <p className="text-xs text-gray-400 text-center py-4">No categories yet. Create one below.</p>
            )}
            {categories.map(cat => (
              <div
                key={cat._id}
                onClick={() => handleSelect(cat._id)}
                className={`flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-blue-50 transition-colors group
                  ${value === cat._id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {value === cat._id
                    ? <Check size={13} className="text-blue-600 flex-shrink-0" />
                    : <Tag size={13} className="text-gray-400 flex-shrink-0" />
                  }
                  <div className="min-w-0">
                    <p className={`text-sm truncate ${value === cat._id ? 'font-semibold text-blue-700' : 'text-gray-800'}`}>{cat.name}</p>
                    {cat.description && <p className="text-[10px] text-gray-400 truncate">{cat.description}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => startEdit(e, cat)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-all flex-shrink-0 ml-2"
                  title="Edit category"
                >
                  <Pencil size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Create new button */}
          {mode === 'select' && (
            <div className="border-t border-gray-100">
              <button
                type="button"
                onClick={startCreate}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium"
              >
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Plus size={12} />
                </div>
                Create new category
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function LibrarianBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState(EMPTY_BOOK);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchBooks(); }, [search, filterCategory]);
  useEffect(() => { fetchCategories(); }, []);

  const fetchBooks = async () => {
    try {
      const res = await api.get(`/library/books?search=${search}&category=${filterCategory}`);
      setBooks(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/library/categories');
      setCategories(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const openAdd = () => { setEditingBook(null); setFormData(EMPTY_BOOK); setShowModal(true); };

  const openEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title, isbn: book.isbn, author: book.author,
      publisher: book.publisher, edition: book.edition || '',
      category: book.category?._id || '', language: book.language,
      total_copies: book.total_copies, available_copies: book.available_copies,
      rack_number: book.rack_number || '', shelf_number: book.shelf_number || '',
      description: book.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBook) await api.put(`/library/books/${editingBook._id}`, formData);
      else await api.post('/library/books', formData);
      setShowModal(false);
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving book');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this book?')) return;
    try { await api.delete(`/library/books/${id}`); fetchBooks(); }
    catch (err) { alert(err.response?.data?.message || 'Error deleting book'); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg"><Book className="text-indigo-600" size={24} /></div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Book Management</h1>
                <p className="text-xs text-gray-500">{books.length} books found</p>
              </div>
            </div>
            <button onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm">
              <Plus size={16} /> Add Book
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search by title, author, ISBN..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-w-[180px]">
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
          </div>

          {/* Books Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Book Details', 'ISBN', 'Category', 'Location', 'Copies', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {books.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No books found</td></tr>
                  ) : books.map(book => (
                    <tr key={book._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 text-sm">{book.title}</p>
                        <p className="text-xs text-gray-500">{book.author}</p>
                        <p className="text-xs text-gray-400">{book.publisher}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{book.isbn}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                          {book.category?.name || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {book.rack_number && <div>Rack: {book.rack_number}</div>}
                        {book.shelf_number && <div>Shelf: {book.shelf_number}</div>}
                        {!book.rack_number && !book.shelf_number && '—'}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="text-gray-600">Total: <span className="font-medium">{book.total_copies}</span></div>
                        <div className="text-green-600">Available: <span className="font-medium">{book.available_copies}</span></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => openEdit(book)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={15} /></button>
                          <button onClick={() => handleDelete(book._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                          <button className="p-1.5 text-purple-500 hover:bg-purple-50 rounded-lg transition-colors"><QrCode size={15} /></button>
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

      {/* Add / Edit Book Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input type="text" required value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                {/* ISBN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
                  <input type="text" required value={formData.isbn}
                    onChange={e => setFormData({...formData, isbn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                  <input type="text" required value={formData.author}
                    onChange={e => setFormData({...formData, author: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                {/* Publisher */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Publisher *</label>
                  <input type="text" required value={formData.publisher}
                    onChange={e => setFormData({...formData, publisher: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                {/* Edition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Edition</label>
                  <input type="text" value={formData.edition}
                    onChange={e => setFormData({...formData, edition: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                {/* Category — Smart Selector */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category * <span className="text-xs text-gray-400 font-normal ml-1">— select existing or create new</span>
                  </label>
                  <CategorySelector
                    categories={categories}
                    value={formData.category}
                    onChange={val => setFormData({...formData, category: val})}
                    onCategoryCreated={cat => setCategories(prev => [...prev, cat])}
                    onCategoryUpdated={updated => setCategories(prev => prev.map(c => c._id === updated._id ? updated : c))}
                  />
                  {!formData.category && <p className="text-xs text-red-400 mt-1">Please select or create a category</p>}
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <input type="text" value={formData.language}
                    onChange={e => setFormData({...formData, language: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                {/* Total Copies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies *</label>
                  <input type="number" required min="1" value={formData.total_copies}
                    onChange={e => setFormData({...formData, total_copies: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                {/* Available Copies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Copies *</label>
                  <input type="number" required min="0" value={formData.available_copies}
                    onChange={e => setFormData({...formData, available_copies: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                {/* Rack */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rack Number</label>
                  <input type="text" value={formData.rack_number}
                    onChange={e => setFormData({...formData, rack_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                {/* Shelf */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shelf Number</label>
                  <input type="text" value={formData.shelf_number}
                    onChange={e => setFormData({...formData, shelf_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={formData.description} rows={3}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button type="submit" disabled={saving || !formData.category}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-medium text-sm disabled:opacity-60 transition-colors">
                  {saving ? 'Saving...' : editingBook ? 'Update Book' : 'Add Book'}
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
