import { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, Award } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { stemAPI } from '../services/api';

const StaffStem = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });

  useEffect(() => {
    fetchMentorProjects();
  }, []);

  const fetchMentorProjects = async () => {
    try {
      const res = await stemAPI.getMentorProjects();
      setProjects(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const handleGradeSubmission = async (projectId, submissionId) => {
    try {
      await stemAPI.gradeSubmission(projectId, submissionId, gradeData);
      fetchMentorProjects();
      setIsModalOpen(false);
      setGradeData({ grade: '', feedback: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to grade submission');
    }
  };

  const handleMilestoneUpdate = async (projectId, milestoneId, completed) => {
    try {
      await stemAPI.updateMilestone(projectId, milestoneId, { completed });
      fetchMentorProjects();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update milestone');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">My STEM Projects</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Projects</p>
                  <p className="text-3xl font-bold text-blue-600">{projects.length}</p>
                </div>
                <Award className="text-blue-500" size={40} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Projects</p>
                  <p className="text-3xl font-bold text-green-600">
                    {projects.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <Clock className="text-green-500" size={40} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Students</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {projects.reduce((sum, p) => sum + (p.enrolledStudents?.length || 0), 0)}
                  </p>
                </div>
                <Users className="text-purple-500" size={40} />
              </div>
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{project.title}</h3>
                    <p className="text-gray-600 mt-2">{project.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                    project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-gray-500 text-sm">Category:</span>
                    <span className="ml-2 font-medium">{project.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Difficulty:</span>
                    <span className="ml-2 font-medium">{project.difficulty}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Students:</span>
                    <span className="ml-2 font-medium">
                      {project.enrolledStudents?.length || 0}/{project.maxStudents}
                    </span>
                  </div>
                </div>

                {/* Enrolled Students */}
                {project.enrolledStudents?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-3">Enrolled Students ({project.enrolledStudents.length})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {project.enrolledStudents.map((student) => (
                        <div key={student._id} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-sm text-gray-600">{student.email}</p>
                              <div className="flex gap-3 mt-1 text-xs text-gray-500">
                                {student.rollNumber && <span>Roll: {student.rollNumber}</span>}
                                {student.class && <span>Class: {student.class}</span>}
                                {student.section && <span>Section: {student.section}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestones */}
                {project.milestones?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-3">Milestones</h4>
                    <div className="space-y-2">
                      {project.milestones.map((milestone, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                          <input
                            type="checkbox"
                            checked={milestone.completed}
                            onChange={(e) => handleMilestoneUpdate(project._id, milestone._id, e.target.checked)}
                            className="w-5 h-5"
                          />
                          <div className="flex-1">
                            <p className={milestone.completed ? 'line-through text-gray-500' : ''}>
                              {milestone.title}
                            </p>
                            {milestone.dueDate && (
                              <p className="text-sm text-gray-500">
                                Due: {new Date(milestone.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {milestone.completed && <CheckCircle className="text-green-500" size={20} />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submissions */}
                {project.submissions?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-3">Student Submissions ({project.submissions.length})</h4>
                    <div className="space-y-3">
                      {project.submissions.map((sub) => (
                        <div key={sub._id} className="border rounded-lg p-4 bg-white">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-gray-900">{sub.student?.name}</p>
                                {sub.student?.rollNumber && (
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {sub.student.rollNumber}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{sub.student?.email}</p>
                            </div>
                            {!sub.grade && (
                              <button
                                onClick={() => {
                                  setSelectedProject({ projectId: project._id, submissionId: sub._id });
                                  setIsModalOpen(true);
                                }}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
                              >
                                Grade
                              </button>
                            )}
                          </div>
                          
                          <div className="mt-2 p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-700">{sub.description || sub.content}</p>
                          </div>
                          
                          <p className="text-xs text-gray-500 mt-2">
                            Submitted: {new Date(sub.submittedAt).toLocaleString()}
                          </p>
                          
                          {sub.grade && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-green-800">
                                  Grade: {sub.grade}
                                </p>
                                {sub.gradedBy && (
                                  <p className="text-xs text-gray-600">by {sub.gradedBy.name}</p>
                                )}
                              </div>
                              {sub.feedback && (
                                <p className="text-sm text-gray-700 mt-2">{sub.feedback}</p>
                              )}
                              {sub.gradedAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Graded on: {new Date(sub.gradedAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No projects assigned yet
            </div>
          )}

          {/* Grade Modal */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Grade Submission">
            <form onSubmit={(e) => {
              e.preventDefault();
              handleGradeSubmission(selectedProject?.projectId, selectedProject?.submissionId);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Grade *</label>
                <select
                  value={gradeData.grade}
                  onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Grade</option>
                  <option value="A+">A+ (Excellent)</option>
                  <option value="A">A (Very Good)</option>
                  <option value="B+">B+ (Good)</option>
                  <option value="B">B (Above Average)</option>
                  <option value="C+">C+ (Average)</option>
                  <option value="C">C (Below Average)</option>
                  <option value="D">D (Poor)</option>
                  <option value="F">F (Fail)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Feedback</label>
                <textarea
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Provide feedback..."
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                  Submit Grade
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

export default StaffStem;
