import { useState, useEffect } from 'react';
import { Search, Users, Award, BookOpen, Send } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { stemAPI } from '../services/api';

const StudentStem = () => {
  const [allProjects, setAllProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchMyProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await stemAPI.getProjects({ status: 'active' });
      setAllProjects(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setAllProjects([]);
    }
  };

  const fetchMyProjects = async () => {
    try {
      const res = await stemAPI.getMyProjects();
      setMyProjects(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching my projects:', error);
      setMyProjects([]);
    }
  };

  const handleEnroll = async (projectId) => {
    try {
      await stemAPI.enroll(projectId);
      fetchProjects();
      fetchMyProjects();
      alert('Successfully enrolled!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to enroll');
    }
  };

  const handleUnenroll = async (projectId) => {
    if (window.confirm('Are you sure you want to unenroll?')) {
      try {
        await stemAPI.unenroll(projectId);
        fetchProjects();
        fetchMyProjects();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to unenroll');
      }
    }
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    try {
      await stemAPI.submitWork(selectedProject._id, { content: submissionContent });
      fetchMyProjects();
      setIsModalOpen(false);
      setSubmissionContent('');
      alert('Work submitted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit work');
    }
  };

  const filteredProjects = Array.isArray(allProjects) ? allProjects.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
                         p.category?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.category === filter;
    return matchesSearch && matchesFilter;
  }) : [];

  const isEnrolled = (projectId) => Array.isArray(myProjects) && myProjects.some(p => p._id === projectId);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Innovation & STEM Projects</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Available Projects</p>
                  <p className="text-3xl font-bold text-blue-600">{allProjects.length}</p>
                </div>
                <BookOpen className="text-blue-500" size={40} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">My Projects</p>
                  <p className="text-3xl font-bold text-green-600">{myProjects.length}</p>
                </div>
                <Award className="text-green-500" size={40} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {myProjects.filter(p => p.status === 'completed').length}
                  </p>
                </div>
                <Users className="text-purple-500" size={40} />
              </div>
            </div>
          </div>

          {/* My Enrolled Projects */}
          {myProjects.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">My Enrolled Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myProjects.map((project) => (
                  <div key={project._id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{project.title}</h3>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{project.description}</p>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium">{project.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Mentor:</span>
                        <span className="font-medium">{project.mentor?.name}</span>
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
                    </div>

                    {/* Milestones Progress */}
                    {project.milestones?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Progress</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${(project.milestones.filter(m => m.completed).length / project.milestones.length) * 100}%`
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {project.milestones.filter(m => m.completed).length} / {project.milestones.length} milestones
                        </p>
                      </div>
                    )}

                    {/* My Submissions */}
                    {project.submissions?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">My Submissions ({project.submissions.length})</p>
                        {project.submissions.map((sub) => (
                          <div key={sub._id} className="text-sm p-3 bg-gray-50 rounded-lg mb-2 border">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-gray-700 flex-1">{sub.description || sub.content}</p>
                              {sub.grade && (
                                <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  {sub.grade}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              Submitted: {new Date(sub.submittedAt).toLocaleString()}
                            </p>
                            {sub.grade && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs font-medium text-green-800 mb-1">Grade: {sub.grade}</p>
                                {sub.feedback && (
                                  <p className="text-xs text-gray-600 italic">"{sub.feedback}"</p>
                                )}
                                {sub.gradedAt && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Graded on: {new Date(sub.gradedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            )}
                            {!sub.grade && (
                              <p className="text-xs text-yellow-600 mt-2">⏳ Pending review</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {project.submissions?.length > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setSubmissionContent(project.submissions[0]?.description || project.submissions[0]?.content || '');
                            setIsModalOpen(true);
                          }}
                          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                        >
                          <Send size={16} /> Update Work
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setSubmissionContent('');
                            setIsModalOpen(true);
                          }}
                          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
                        >
                          <Send size={16} /> Submit Work
                        </button>
                      )}
                      <button
                        onClick={() => handleUnenroll(project._id)}
                        className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
                      >
                        Unenroll
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Enrolled Projects Message */}
          {myProjects.length === 0 && (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-blue-800 font-medium mb-2">You haven't enrolled in any projects yet!</p>
              <p className="text-blue-600 text-sm">Browse available projects below and enroll to get started.</p>
            </div>
          )}

          {/* Available Projects */}
          <div>
            <h2 className="text-xl font-bold mb-4">Available Projects</h2>

            {/* Search & Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
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

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div key={project._id} className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{project.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>

                  <div className="space-y-2 text-sm mb-4">
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
                      <span className="font-medium">{project.mentor?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Seats:</span>
                      <span className="font-medium">
                        {project.enrolledStudents?.length || 0}/{project.maxStudents}
                      </span>
                    </div>
                  </div>

                  {isEnrolled(project._id) ? (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed"
                    >
                      Already Enrolled
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(project._id)}
                      disabled={project.enrolledStudents?.length >= project.maxStudents}
                      className={`w-full px-4 py-2 rounded-lg ${
                        project.enrolledStudents?.length >= project.maxStudents
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {project.enrolledStudents?.length >= project.maxStudents ? 'Full' : 'Enroll Now'}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No projects found
              </div>
            )}
          </div>

          {/* Submit Work Modal */}
          <Modal isOpen={isModalOpen} onClose={() => {
            setIsModalOpen(false);
            setSubmissionContent('');
          }} title={selectedProject?.submissions?.length > 0 ? 'Update Work' : 'Submit Work'}>
            <form onSubmit={handleSubmitWork} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project: {selectedProject?.title}</label>
                {selectedProject?.submissions?.length > 0 && (
                  <p className="text-xs text-blue-600 mb-2">
                    ℹ️ You have already submitted work for this project. You can update your submission below.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Work *</label>
                <textarea
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="6"
                  placeholder="Describe your work, progress, findings, or attach links to your project..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tip: Include details about what you've accomplished, challenges faced, and any resources used.
                </p>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                  {selectedProject?.submissions?.length > 0 ? 'Update Submission' : 'Submit Work'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSubmissionContent('');
                  }}
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

export default StudentStem;
