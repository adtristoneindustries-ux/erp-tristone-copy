import { useState, useEffect } from 'react';
import { examAPI, classAPI, subjectAPI, userAPI } from '../services/api';
import { FiPlus, FiTrash2, FiSend, FiEdit2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';

const AdminExamSchedule = () => {
  const [examSchedules, setExamSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [scheduleData, setScheduleData] = useState({
    examName: '',
    class: '',
    subjects: []
  });

  useEffect(() => {
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

      const schedules = Object.values(grouped).sort((a, b) => {
        const aTime = Math.max(...a.exams.map(e => new Date(e.updatedAt || e.createdAt).getTime()));
        const bTime = Math.max(...b.exams.map(e => new Date(e.updatedAt || e.createdAt).getTime()));
        return bTime - aTime;
      });

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
      if (editMode) {
        for (const subData of scheduleData.subjects) {
          if (subData.id) {
            await examAPI.deleteExam(subData.id);
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
          status: 'Scheduled'
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
    const grades = ['10', '11', '12'];
    return grades.map(grade => ({
      _id: grade,
      className: grade,
      displayName: `Class ${grade} (All Sections)`
    }));
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
            <h1 className="text-3xl font-bold text-gray-800">Exam Schedule Management</h1>
            <p className="text-gray-600 mt-1">Create and manage exam schedules</p>
          </div>
          <button
            onClick={handleCreateSchedule}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FiPlus /> Create Schedule
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Exam Schedules</h2>
          {examSchedules.map((schedule, idx) => (
            <div key={idx} className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-sm p-6 mb-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{schedule.examName}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Class {schedule.class?.className || 'N/A'} - {schedule.class?.section || 'N/A'} | {' '}
                    {new Date(schedule.startDate).toLocaleDateString('en-IN')} - {new Date(schedule.endDate).toLocaleDateString('en-IN')}
                  </p>
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-2">
                    Created by {schedule.createdBy?.name || 'Unknown'} ({schedule.createdBy?.role === 'admin' ? 'Admin' : 'Staff'})
                    {schedule.exams[0]?.updatedAt && (
                      <span className="block mt-1">
                        Last updated: {new Date(schedule.exams[0].updatedAt).toLocaleDateString('en-IN')} at {new Date(schedule.exams[0].updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSchedule(schedule)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(schedule)}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    <FiTrash2 /> Delete
                  </button>
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{editMode ? 'Edit' : 'Create'} Exam Schedule</h2>
              <button onClick={() => setShowModal(false)} className="text-3xl text-gray-500 hover:text-gray-700">×</button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Exam Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Mid Term Examination 2024"
                    value={scheduleData.examName}
                    onChange={(e) => setScheduleData({ ...scheduleData, examName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Class *</label>
                  <select
                    value={scheduleData.class}
                    onChange={(e) => setScheduleData({ ...scheduleData, class: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Class</option>
                    {getClassesByGrade().map(cls => (
                      <option key={cls._id} value={cls.className}>{cls.displayName}</option>
                    ))}
                  </select>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Subjects</h3>
                    <button
                      onClick={handleAddSubject}
                      disabled={!scheduleData.class}
                      className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:bg-gray-300 text-sm"
                    >
                      <FiPlus /> Add Subject
                    </button>
                  </div>

                  {scheduleData.subjects.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No subjects added yet</p>
                  )}

                  {scheduleData.subjects.map((subData, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4 border">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-700">Subject {index + 1}</h4>
                        <button
                          onClick={() => handleRemoveSubject(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Subject *</label>
                          <select
                            value={subData.subject}
                            onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="">Select Subject</option>
                            {subjects.map(sub => (
                              <option key={sub._id} value={sub._id}>{sub.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Date *</label>
                          <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={subData.date}
                            onChange={(e) => handleSubjectChange(index, 'date', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Start Time *</label>
                          <input
                            type="time"
                            value={subData.startTime}
                            onChange={(e) => handleSubjectChange(index, 'startTime', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                          {subData.startTime && (
                            <span className="text-xs text-gray-500 mt-1 block">
                              {new Date(`2000-01-01T${subData.startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">End Time *</label>
                          <input
                            type="time"
                            value={subData.endTime}
                            onChange={(e) => handleSubjectChange(index, 'endTime', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                          {subData.endTime && (
                            <span className="text-xs text-gray-500 mt-1 block">
                              {new Date(`2000-01-01T${subData.endTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </span>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Hall *</label>
                          <input
                            type="text"
                            placeholder="e.g., Hall A"
                            value={subData.hall}
                            onChange={(e) => handleSubjectChange(index, 'hall', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Invigilator *</label>
                          <select
                            value={subData.invigilator}
                            onChange={(e) => handleSubjectChange(index, 'invigilator', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="">Select Invigilator</option>
                            {staff.map(s => (
                              <option key={s._id} value={s._id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button
                  onClick={handlePublishSchedule}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
                >
                  <FiSend /> {editMode ? 'Update' : 'Publish'} Schedule
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminExamSchedule;