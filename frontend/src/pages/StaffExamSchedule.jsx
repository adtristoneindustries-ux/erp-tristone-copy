import { useState, useEffect } from 'react';
import { examAPI, classAPI } from '../services/api';
import { FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';

const StaffExamSchedule = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState('');
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchData();
  }, [filterClass]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = filterClass ? { classId: filterClass } : {};
      const [examsRes, classesRes] = await Promise.all([
        examAPI.getExams(params),
        classAPI.getClasses()
      ]);
      setExams(examsRes.data);
      setClasses(classesRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Exam Schedule</h1>
          <p className="text-gray-600 mt-1">View exam timetable</p>
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
              <h3 className="text-xl font-bold mb-4">{exam.examName}</h3>
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
    </Layout>
  );
};

export default StaffExamSchedule;
