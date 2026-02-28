import { useState, useEffect } from 'react';
import { examAPI, classAPI, subjectAPI, userAPI } from '../services/api';
import { FiPlus, FiTrash2, FiSend, FiEdit2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';

const StaffExamSchedule = () => {
  const [examSchedules, setExamSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [scheduleData, setScheduleData] = useState({
    examName: '',
    class: '',
    subjects: []
  });

  useEffect(() => {
    // Get current user
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      setCurrentUser(user);
    } catch (e) {
      console.error('Error parsing user:', e);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsRes, classesRes, subjectsRes, staffRes] = await Promise.all([
        examAPI.getExams(),
        classAPI.getClasses(),
        subjectAPI.getSubjects(),
        userAPI.getUsers({ role: 'staff' })
      ]);

      const exams = examsRes.data;
      
      const grouped = {};
      exams.forEach(exam => {
        if (!grouped[exam.examName]) {
          grouped[exam.examName] = {
            examName: exam.examName,
            exams: [],
            startDate: exam.date,
            endDate: exam.date,
            class: exam.class,
            createdBy: exam.createdBy
          };
        }
        grouped[exam.examName].exams.push(exam);
        
        const examDate = new Date(exam.date);
        if (examDate < new Date(grouped[exam.examName].startDate)) {
          grouped[exam.examName].startDate = exam.date;
        }
        if (examDate > new Date(grouped[exam.examName].endDate)) {
          grouped[exam.examName].endDate = exam.date;
        }
      });

      const schedules = Object.values(grouped).sort((a, b) => 
        new Date(b.startDate) - new Date(a.startDate)
      );

      setExamSchedules(schedules);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
      setStaff(staffRes.data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = () => {
    setEditMode(false);
    setScheduleData({
      examName: '',
      class: '',
      subjects: []
    });
    setShowModal(true);
  };

  const handleEditSchedule = (schedule) => {
    setEditMode(true);
    setScheduleData({
      examName: schedule.examName,
      class: schedule.class._id,
      subjects: schedule.exams.map(exam => ({
        id: exam._id,
        subject: exam.subject._id,
        date: new Date(exam.date).toISOString().split('T')[0],
        startTime: exam.startTime,
        endTime: exam.endTime,
        hall: exam.hall,
        invigilator: exam.invigilators?.[0]?._id || ''
      }))
    });
    setShowModal(true);
  };

  const handleAddSubject = () => {
    setScheduleData({
      ...scheduleData,
      subjects: [
        ...scheduleData.subjects,
        {
          subject: '',
          date: '',
          startTime: '',
          endTime: '',
          hall: '',
          invigilator: ''
        }
      ]
    });
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...scheduleData.subjects];
    newSubjects[index][field] = value;
    setScheduleData({ ...scheduleData, subjects: newSubjects });
  };

  const handleRemoveSubject = (index) => {
    const newSubjects = scheduleData.subjects.filter((_, i) => i !== index);
    setScheduleData({ ...scheduleData, subjects: newSubjects });
  };

  const validateSchedule = () => {
    if (!scheduleData.examName.trim()) {
      toast.error('Please enter exam name');
      return false;
    }
    if (!scheduleData.class) {
      toast.error('Please select a class');
      return false;
    }
    if (scheduleData.subjects.length === 0) {
      toast.error('Please add at least one subject');
      return false;
    }

    for (let i = 0; i < scheduleData.subjects.length; i++) {
      const sub = scheduleData.subjects[i];
      if (!sub.subject || !sub.date || !sub.startTime || !sub.endTime || !sub.hall || !sub.invigilator) {
        toast.error(`Please fill all fields for subject ${i + 1}`);
        return false;
      }

      for (let j = 0; j < i; j++) {
        const prevSub = scheduleData.subjects[j];
        if (prevSub.invigilator === sub.invigilator && prevSub.date === sub.date) {
          const prevStart = prevSub.startTime;
          const prevEnd = prevSub.endTime;
          const currStart = sub.startTime;
          const currEnd = sub.endTime;

          if (
            (currStart >= prevStart && currStart < prevEnd) ||
            (currEnd > prevStart && currEnd <= prevEnd) ||
            (currStart <= prevStart && currEnd >= prevEnd)
          ) {
            toast.error(`Invigilator conflict at ${sub.date}`);
            return false;
          }
        }
      }
    }

    return true;
  };

  const handlePublishSchedule = async () => {
    if (!validateSchedule()) return;

    try {
      let currentUser = null;
      try {
        currentUser = JSON.parse(localStorage.getItem('user'));
      } catch (e) {
        if (!localStorage.getItem('token')) {
          toast.error('User not authenticated');
          return;
        }
      }
      
      if (editMode) {
        for (const subData of scheduleData.subjects) {
          if (subData.id) {
            try {
              await examAPI.deleteExam(subData.id);
            } catch (error) {
              console.log('Delete failed, continuing with creation');
            }
          }
        }
      }
      
      for (const subData of scheduleData.subjects) {
        const startTime = new Date(`2000-01-01T${subData.startTime}`);
        const endTime = new Date(`2000-01-01T${subData.endTime}`);
        const duration = (endTime - startTime) / (1000 * 60 * 60);

        await examAPI.createExam({
          examName: scheduleData.examName,
          examType: 'Major Exam',
          subject: subData.subject,
          class: scheduleData.class,
          date: subData.date,
          startTime: subData.startTime,
          endTime: subData.endTime,
          duration: duration,
          hall: subData.hall,
          invigilators: [subData.invigilator],
          totalMarks: 100,
          status: 'Scheduled',
          createdBy: currentUser?.id || 'staff'
        });
      }

      toast.success(editMode ? 'Schedule updated' : 'Schedule published');
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Publish error:', error);
      toast.error(error.response?.data?.message || 'Failed to publish');
    }
  };

  const handleDeleteSchedule = async (schedule) => {
    if (!window.confirm(`Delete ${schedule.examName}?`)) return;

    try {
      for (const exam of schedule.exams) {
        await examAPI.deleteExam(exam._id);
      }
      toast.success('Schedule deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getClassesByGrade = () => {
    return classes.filter(c => ['10', '11', '12'].includes(c.className));
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
            <p className="text-gray-600 mt-1">View exam schedules</p>
          </div>

        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Exam Schedules</h2>
          {examSchedules.map((schedule, idx) => (
            <div key={idx} className="bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow-sm p-6 mb-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{schedule.examName}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Class {schedule.class?.className || 'N/A'} - {schedule.class?.section || 'N/A'} | {' '}
                    {new Date(schedule.startDate).toLocaleDateString('en-IN')} - {new Date(schedule.endDate).toLocaleDateString('en-IN')}
                  </p>
                  <span className={`inline-block text-xs px-2 py-1 rounded-full mt-2 ${
                    currentUser && schedule.createdBy && schedule.createdBy._id === currentUser.id 
                      ? 'bg-blue-100 text-blue-800' 
                      : schedule.createdBy?.role === 'admin' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    Created by {currentUser && schedule.createdBy && schedule.createdBy._id === currentUser.id 
                      ? 'me' 
                      : schedule.createdBy?.name || 'Unknown'
                    } ({schedule.createdBy?.role === 'admin' ? 'Admin' : 'Staff'})
                    {schedule.exams[0]?.updatedAt && (
                      <span className="block mt-1">
                        Last updated: {new Date(schedule.exams[0].updatedAt).toLocaleDateString('en-IN')} at {new Date(schedule.exams[0].updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </span>
                </div>

              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Date</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Subject</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Time</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Duration</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Hall</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Invigilator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.exams.map(exam => (
                      <tr key={exam._id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">
                          {new Date(exam.date).toLocaleDateString('en-IN', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 font-medium">{exam.subject?.name || 'N/A'}</td>
                        <td className="border border-gray-300 px-4 py-3">{new Date(`2000-01-01T${exam.startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - {new Date(`2000-01-01T${exam.endTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</td>
                        <td className="border border-gray-300 px-4 py-3">{exam.duration} hrs</td>
                        <td className="border border-gray-300 px-4 py-3">{exam.hall}</td>
                        <td className="border border-gray-300 px-4 py-3">{exam.invigilators?.[0]?.name || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {examSchedules.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">No exams scheduled yet</p>
          </div>
        )}
      </div>


    </Layout>
  );
};

export default StaffExamSchedule;