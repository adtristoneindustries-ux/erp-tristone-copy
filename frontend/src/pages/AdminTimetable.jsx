import { useState, useEffect, useContext } from 'react';
import { Plus, Clock, Users } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { SocketContext } from '../context/SocketContext';
import axios from 'axios';

const AdminTimetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const socket = useContext(SocketContext);
  const [newTimetable, setNewTimetable] = useState({
    class: '',
    section: 'A',
    schedule: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    }
  });

  const timeSlots = [
    '9:00-9:45', '9:45-10:30', '10:45-11:30', '11:30-12:15',
    '1:00-1:45', '1:45-2:30', '2:30-3:15', '3:15-4:00'
  ];



  useEffect(() => {
    fetchTimetables();
    fetchClasses();
    fetchSubjects();
    fetchStaff();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('timetableUpdate', () => {
        fetchTimetables();
      });
      return () => socket.off('timetableUpdate');
    }
  }, [socket]);

  const fetchTimetables = async () => {
    try {
      const response = await axios.get('/api/timetable', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTimetables(response.data);
    } catch (error) {
      console.error('Error fetching timetables:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/api/classes', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/api/subjects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await axios.get('/api/timetable/staff/list', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleClassSelect = async (classObj) => {
    setSelectedClass(classObj);
    await loadExistingTimetable(classObj);
    setIsModalOpen(true);
  };

  const loadExistingTimetable = async (classObj) => {
    try {
      const response = await axios.get('/api/timetable/class', {
        params: { className: classObj.name, section: classObj.section || 'A' },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setNewTimetable({
        class: classObj.name,
        section: classObj.section || 'A',
        schedule: response.data.schedule
      });
    } catch (error) {
      console.error('Error loading existing timetable:', error);
      initializeSchedule(classObj);
    }
  };

  const initializeSchedule = (classObj) => {
    const schedule = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };

    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
      timeSlots.forEach((time, index) => {
        schedule[day].push({
          period: index + 1,
          time,
          subject: '',
          teacher: ''
        });
      });
    });

    setNewTimetable({
      class: classObj.name,
      section: classObj.section || 'A',
      schedule
    });
  };

  const updatePeriod = async (day, periodIndex, field, value) => {
    setNewTimetable(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: prev.schedule[day].map((period, index) =>
          index === periodIndex ? { ...period, [field]: value } : period
        )
      }
    }));

    const updatedPeriod = {
      ...newTimetable.schedule[day][periodIndex],
      [field]: value
    };

    if (updatedPeriod.subject && updatedPeriod.teacher) {
      try {
        await axios.post('/api/timetable/period', {
          className: newTimetable.class,
          section: newTimetable.section,
          day: day,
          periodNumber: updatedPeriod.period,
          time: updatedPeriod.time,
          subject: updatedPeriod.subject,
          teacher: updatedPeriod.teacher
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (error) {
        console.error('Error saving period:', error);
      }
    }
  };

  const saveTimetable = async () => {
    try {
      // Validate that all periods with subjects have teachers assigned
      const hasIncompleteAssignments = Object.values(newTimetable.schedule).some(daySchedule => 
        daySchedule.some(period => period.subject && !period.teacher)
      );
      
      if (hasIncompleteAssignments) {
        alert('Please assign teachers to all subjects before saving.');
        return;
      }
      
      console.log('Saving all periods individually...');
      
      // Save each period individually
      const savePromises = [];
      Object.keys(newTimetable.schedule).forEach(day => {
        newTimetable.schedule[day].forEach(period => {
          if (period.subject && period.teacher) {
            savePromises.push(
              axios.post('/api/timetable/period', {
                className: newTimetable.class,
                section: newTimetable.section,
                day: day,
                period: period.period,
                time: period.time,
                subject: period.subject,
                teacher: period.teacher
              }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              })
            );
          }
        });
      });
      
      await Promise.all(savePromises);
      console.log('All periods saved successfully');
      alert('Timetable saved successfully!');
      
      await fetchTimetables();
      setIsModalOpen(false);
      setEditingTimetable(null);
      
      // Reset form
      setNewTimetable({
        class: '',
        section: 'A',
        schedule: {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: []
        }
      });
    } catch (error) {
      console.error('Save error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Error saving timetable');
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Timetable Management</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
            >
              <Plus size={20} /> Add Timetable
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timetables.map((timetable) => (
              <div key={timetable._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="text-blue-500" size={24} />
                  <div>
                    <h3 className="font-bold text-lg">Class {timetable.class}</h3>
                    <p className="text-gray-600">Section {timetable.section}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Monday: {timetable.schedule.Monday.length} periods</p>
                  <p>Total periods: {Object.values(timetable.schedule).flat().length}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingTimetable(timetable);
                    // Process schedule to ensure teacher field shows correct ID and preserve all data
                    const processedSchedule = {};
                    Object.keys(timetable.schedule).forEach(day => {
                      processedSchedule[day] = timetable.schedule[day].map(period => ({
                        period: period.period,
                        time: period.time,
                        subject: period.subject || '',
                        teacher: period.teacher?._id || period.teacher || ''
                      }));
                    });
                    setNewTimetable({
                      class: timetable.class,
                      section: timetable.section,
                      schedule: processedSchedule
                    });
                    setIsModalOpen(true);
                  }}
                  className="mt-3 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 text-sm"
                >
                  Edit Timetable
                </button>
              </div>
            ))}
          </div>

          {classes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Available Classes</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {classes.map((classObj) => (
                  <button
                    key={classObj._id}
                    onClick={() => handleClassSelect(classObj)}
                    className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition"
                  >
                    <Users size={24} className="mx-auto mb-2" />
                    <div className="text-sm">
                      <div className="font-bold">{classObj.name}</div>
                      <div>Section {classObj.section || 'A'}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTimetable(null); }} title={editingTimetable ? `Edit Timetable - ${editingTimetable.class} Section ${editingTimetable.section}` : `Create Timetable - ${selectedClass?.name} Section ${selectedClass?.section || 'A'}`}>
            <div className="max-h-96 overflow-y-auto">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                <div key={day} className="mb-6">
                  <h3 className="font-bold text-lg mb-3 text-blue-600">{day}</h3>
                  <div className="space-y-2">
                    {newTimetable.schedule[day].map((period, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 items-center">
                        <span className="text-sm font-medium">P{period.period}</span>
                        <span className="text-sm text-gray-600">{period.time}</span>
                        <select
                          value={period.subject}
                          onChange={(e) => updatePeriod(day, index, 'subject', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="">Select Subject</option>
                          {subjects.map(subject => (
                            <option key={subject._id} value={subject.name}>{subject.name}</option>
                          ))}
                        </select>
                        <select
                          value={period.teacher}
                          onChange={(e) => updatePeriod(day, index, 'teacher', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                          disabled={!period.subject}
                        >
                          <option value="">Select Teacher</option>
                          {staff.map(teacher => (
                            <option key={teacher._id} value={teacher._id}>{teacher.name}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button
                onClick={saveTimetable}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mt-4"
              >
                Save Timetable
              </button>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default AdminTimetable;