import { useState, useEffect } from 'react';
import { examAPI, classAPI, subjectAPI, userAPI } from '../services/api';
import { FiPlus, FiTrash2, FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';

const AdminExamSchedule = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [filterClass, setFilterClass] = useState('');

  const [bulkData, setBulkData] = useState({
    class: '',
    examType: 'Major Exam',
    date: '',
    startTime: '09:00',
    hall: 'Hall 1',
    invigilators: [],
    totalMarks: 100
  });

  useEffect(() => {
    fetchData();
  }, [filterClass]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = filterClass ? { classId: filterClass } : {};
      const [examsRes, classesRes, subjectsRes, staffRes] = await Promise.all([
        examAPI.getExams(params),
        classAPI.getClasses(),
        subjectAPI.getSubjects(),
        userAPI.getUsers({ role: 'staff' })
      ]);
      setExams(examsRes.data);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
      setStaff(staffRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSchedule = async (e) => {
    e.preventDefault();
    try {
      const classSubjects = subjects.filter(s => s.class?._id === bulkData.class || !s.class);
      
      let currentTime = bulkData.startTime;
      for (const subject of classSubjects) {
        const [hours, minutes] = currentTime.split(':');
        const endHour = parseInt(hours) + 3;
        const endTime = `${endHour.toString().padStart(2, '0')}:${minutes}`;
        
        await examAPI.createExam({
          examName: `${bulkData.examType} - ${subject.name}`,
          examType: bulkData.examType,
          subject: subject._id,
          class: bulkData.class,
          date: bulkData.date,
          startTime: currentTime,
          endTime: endTime,
          duration: 3,
          hall: bulkData.hall,
          invigilators: bulkData.invigilators,
          totalMarks: bulkData.totalMarks,
          status: 'Scheduled'
        });
        
        currentTime = endTime;
      }
      
      toast.success(`${classSubjects.length} exams scheduled`);
      fetchData();
      setShowBulkModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this exam?')) {
      try {
        await examAPI.deleteExam(id);
        toast.success('Deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed');
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Exam Schedule</h1>
            <p className="text-gray-600 mt-1">Manage examinations</p>
          </div>
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FiPlus /> Bulk Schedule
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border rounded-lg"
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls._id} value={cls._id}>{cls.name} - {cls.section}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(exam => (
            <div key={exam._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-bold">{exam.examName}</h3>
                <button onClick={() => handleDelete(exam._id)} className="text-red-600">
                  <FiTrash2 />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-blue-600" />
                  <span>{new Date(exam.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiClock className="text-green-600" />
                  <span>{exam.startTime} - {exam.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-red-600" />
                  <span>{exam.hall}</span>
                </div>
                <p className="pt-2 border-t"><strong>Subject:</strong> {exam.subject.name}</p>
                <p><strong>Class:</strong> {exam.class.name} - {exam.class.section}</p>
              </div>
            </div>
          ))}
        </div>

        {exams.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600">No exams scheduled</p>
          </div>
        )}
      </div>

      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between">
              <h2 className="text-2xl font-bold">Bulk Schedule Exams</h2>
              <button onClick={() => setShowBulkModal(false)} className="text-2xl">×</button>
            </div>

            <form onSubmit={handleBulkSchedule} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Class *</label>
                  <select
                    required
                    value={bulkData.class}
                    onChange={(e) => setBulkData({ ...bulkData, class: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select Class</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>{cls.name} - {cls.section}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">All subjects will be scheduled</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Exam Type *</label>
                  <select
                    value={bulkData.examType}
                    onChange={(e) => setBulkData({ ...bulkData, examType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Major Exam">Major Exam</option>
                    <option value="Mid Term">Mid Term</option>
                    <option value="Final Exam">Final Exam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    value={bulkData.date}
                    onChange={(e) => setBulkData({ ...bulkData, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={bulkData.startTime}
                    onChange={(e) => setBulkData({ ...bulkData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Each exam 3 hours, times auto-adjust</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hall *</label>
                  <input
                    type="text"
                    required
                    value={bulkData.hall}
                    onChange={(e) => setBulkData({ ...bulkData, hall: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Invigilators</label>
                  <select
                    multiple
                    value={bulkData.invigilators}
                    onChange={(e) => setBulkData({ ...bulkData, invigilators: Array.from(e.target.selectedOptions, o => o.value) })}
                    className="w-full px-3 py-2 border rounded-lg h-32"
                  >
                    {staff.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd for multiple</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Schedule All
                </button>
                <button type="button" onClick={() => setShowBulkModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminExamSchedule;
