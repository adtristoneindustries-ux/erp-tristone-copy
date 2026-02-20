import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import axios from 'axios';

const AdminStudentTimetable = () => {
  const [timetables, setTimetables] = useState([]);
  const [classes, setClasses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const subjects = ['Tamil', 'English', 'Math', 'Science', 'Social'];

  useEffect(() => {
    fetchTimetables();
    fetchClasses();
    fetchStaff();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const timetable = timetables.find(t => t.class === selectedClass);
      setSelectedTimetable(timetable);
    }
  }, [selectedClass, timetables]);

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
      const response = await axios.get('/api/timetable/classes/list', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await axios.get('/api/timetable/staff/list', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Staff data:', response.data);
      setStaff(response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const initializeSchedule = (className) => {
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
      class: className,
      section: 'A',
      schedule
    });
  };

  const handleAddTimetable = () => {
    if (!selectedClass) {
      alert('Please select a class first');
      return;
    }
    initializeSchedule(selectedClass);
    setIsModalOpen(true);
  };

  const updatePeriod = (day, periodIndex, field, value) => {
    setNewTimetable(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: prev.schedule[day].map((period, index) =>
          index === periodIndex ? { ...period, [field]: value } : period
        )
      }
    }));
  };

  const saveTimetable = async () => {
    try {
      if (newTimetable._id) {
        // Update existing timetable
        await axios.put(`/api/timetable/${newTimetable._id}`, newTimetable, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        alert('Timetable updated successfully!');
      } else {
        // Create new timetable
        await axios.post('/api/timetable', newTimetable, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        alert('Timetable created successfully!');
      }
      fetchTimetables();
      setIsModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving timetable');
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Student Timetable Management</h1>
            <button
              onClick={handleAddTimetable}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
            >
              <Plus size={20} /> Add New Class Timetable
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Class:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a class</option>
              <option value="6">Class 6 - Section A</option>
              <option value="7">Class 7 - Section A</option>
              <option value="8">Class 8 - Section A</option>
              <option value="9">Class 9 - Section A</option>
              <option value="10">Class 10 - Section A</option>
            </select>
          </div>

          {selectedClass && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-50 p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-800">
                  Class {selectedClass} - Section A Timetable
                </h2>
                <button
                  onClick={() => {
                    if (selectedTimetable) {
                      setNewTimetable({
                        ...selectedTimetable,
                        _id: selectedTimetable._id
                      });
                      setIsModalOpen(true);
                    }
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
                >
                  Edit Timetable
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Period/Time</th>
                      {days.map(day => (
                        <th key={day} className="px-4 py-3 text-center font-semibold">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time, periodIndex) => (
                      <tr key={periodIndex} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <div>
                              <div>Period {periodIndex + 1}</div>
                              <div className="text-xs text-gray-500">{time}</div>
                            </div>
                          </div>
                        </td>
                        {days.map(day => {
                          const period = selectedTimetable?.schedule?.[day]?.[periodIndex];
                          return (
                            <td key={day} className="px-4 py-3 text-center">
                              {period ? (
                                <div className="bg-blue-50 p-2 rounded border">
                                  <div className="font-semibold text-blue-800">{period.subject}</div>
                                  <div className="text-sm text-blue-600">{period.teacher?.name || 'Staff needed'}</div>
                                </div>
                              ) : (
                                <div className="bg-gray-50 p-2 rounded border border-dashed">
                                  <div className="text-gray-400 text-sm">No subject</div>
                                  <div className="text-xs text-gray-400">Assign teacher</div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!selectedClass && (
            <div className="text-center py-12">
              <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Select a class to view its timetable</p>
            </div>
          )}

          {selectedClass && (
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Staff Assignment for Class {selectedClass}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map((teacher) => (
                  <div key={teacher._id} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="font-semibold text-gray-800">{teacher.name}</div>
                    <div className="text-sm text-gray-600">{teacher.subject}</div>
                    <div className="text-xs text-gray-500">{teacher.department}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${newTimetable._id ? 'Edit' : 'Create'} Timetable - Class ${selectedClass}`}>
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
                          onChange={(e) => {
                            updatePeriod(day, index, 'subject', e.target.value);
                            updatePeriod(day, index, 'teacher', ''); // Clear teacher when subject changes
                          }}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="">Select Subject</option>
                          {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </select>
                        <select
                          value={period.teacher}
                          onChange={(e) => updatePeriod(day, index, 'teacher', e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                          disabled={!period.subject}
                        >
                          <option value="">Select Teacher</option>
                          {staff
                            .filter(teacher => !period.subject || teacher.subject === period.subject)
                            .map(teacher => (
                              <option key={teacher._id} value={teacher._id}>
                                {teacher.name} ({teacher.subject})
                              </option>
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
                {newTimetable._id ? 'Update Timetable' : 'Save Timetable'}
              </button>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default AdminStudentTimetable;