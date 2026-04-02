import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Users, Award, Target, TrendingUp } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { stemAPI, userAPI } from '../services/api';

const AdminStem = () => {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, students: 0 });
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', difficulty: '', mentor: '',
    maxStudents: '', startDate: '', endDate: '', status: 'active',
    objectives: '', requirements: '', resources: '', milestones: []
  });

  useEffect(() => {
    fetchProjects();
    fetchStats();
    fetchMentors();
  }, [search]);

  const fetchProjects = async () => {
    try {
      const res = await stemAPI.getProjects({ search });
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await stemAPI.getStats();
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchMentors = async () => {
    try {
      console.log('Fetching mentors...');
      const res = await userAPI.getUsers({ role: 'staff' });
      console.log('Full API response:', res);
      console.log('Response data:', res.data);
      
      // Handle both {success: true, data: []} and direct array response
      let mentorsList = [];
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        mentorsList = res.data.data;
      } else if (Array.isArray(res.data)) {
        mentorsList = res.data;
      }
      
      console.log('Final mentors list:', mentorsList);
      console.log('Number of mentors:', mentorsList.length);
      setMentors(mentorsList);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setMentors([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await stemAPI.updateProject(editingProject._id, formData);
      } else {
        await stemAPI.createProject(formData);
      }
      fetchProjects();
      fetchStats();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this project?')) {
      await stemAPI.deleteProject(id);
      fetchProjects();
      fetchStats();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', description: '', category: '', difficulty: '', mentor: '',
      maxStudents: '', startDate: '', endDate: '', status: 'active',
      objectives: '', requirements: '', resources: '', milestones: []
    });
    setEditingProject(null);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      category: project.category,
      difficulty: project.difficulty,
      mentor: project.mentor?._id || '',
      maxStudents: project.maxStudents,
      startDate: project.startDate?.split('T')[0] || '',
      endDate: project.endDate?.split('T')[0] || '',
      status: project.status,
      objectives: project.objectives || '',
      requirements: project.requirements || '',
      resources: project.resources || '',
      milestones: project.milestones || []
    });
    setIsModalOpen(true);
  };

  const filteredProjects = Array.isArray(projects) ? projects.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Innovation & STEM Projects</h1>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log('Current mentors state:', mentors);
                  fetchMentors();
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Refresh Mentors ({mentors.length})
              </button>
              <button
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-600"
              >
                <Plus size={20} /> Add Project
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Projects</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <Target className="text-blue-500" size={40} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Projects</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <TrendingUp className="text-green-500" size={40} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.completed}</p>
                </div>
                <Award className="text-purple-500" size={40} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Students Enrolled</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.students}</p>
                </div>
                <Users className="text-orange-500" size={40} />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{project.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(project)}
                      className="text-blue-500 hover:text-blue-700 p-2"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium">{project.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Difficulty:</span>
                    <span className={`font-medium ${
                      project.difficulty === 'beginner' ? 'text-green-600' :
                      project.difficulty === 'intermediate' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {project.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mentor:</span>
                    <span className="font-medium">{project.mentor?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Students:</span>
                    <span className="font-medium">{project.enrolledStudents?.length || 0}/{project.maxStudents}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No projects found
            </div>
          )}

          {/* Modal */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProject ? 'Edit Project' : 'Add Project'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-2">Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Robotics">Robotics</option>
                    <option value="AI/ML">AI/ML</option>
                    <option value="IoT">IoT</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Apps">Mobile Apps</option>
                    <option value="3D Printing">3D Printing</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Science">Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty *</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Difficulty</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mentor * ({mentors.length} available)</label>
                  <select
                    value={formData.mentor}
                    onChange={(e) => setFormData({ ...formData, mentor: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Mentor</option>
                    {mentors.length === 0 ? (
                      <option disabled>No staff members found</option>
                    ) : (
                      mentors.map(m => (
                        <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Max Students *</label>
                  <input
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Objectives</label>
                <textarea
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Learning objectives..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Requirements</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Prerequisites..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Resources</label>
                <textarea
                  value={formData.resources}
                  onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Required materials..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                  {editingProject ? 'Update' : 'Create'} Project
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default AdminStem;
