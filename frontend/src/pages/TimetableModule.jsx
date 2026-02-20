import { useState, useEffect } from 'react';
import { Calendar, Clock, Edit2, Users } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { classAPI, subjectAPI, userAPI, timetableAPI } from '../services/api';

const TimetableModule = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [timetables, setTimetables] = useState({});
  const [staff, setStaff] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];



  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchStaff();
    fetchTimetables();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getClasses();
      const classData = response.data.map(c => `${c.className}${c.section}`);
      setClasses(classData);
      console.log('Classes fetched:', classData);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getSubjects();
      setSubjects(response.data);
      console.log('Subjects fetched:', response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await userAPI.getUsers({ role: 'staff' });
      setStaff(response.data);
      console.log('Staff fetched:', response.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };
  const fetchTimetables = async () => {
    try {
      const response = await timetableAPI.getTimetable();
      console.log('Raw timetable response:', response.data);
      
      const timetableData = {};
      response.data.forEach(tt => {
        const className = `${tt.class}${tt.section}`;
        console.log(`Processing timetable for class ${className}:`, tt.schedule);
        
        // Preserve the exact schedule structure from database
        // Ensure teacher data is properly handled
        const processedSchedule = {};
        Object.keys(tt.schedule).forEach(day => {
          processedSchedule[day] = tt.schedule[day].map(period => ({
            ...period,
            // Ensure teacher is preserved whether it's populated or just ID
            teacher: period.teacher
          }));
        });
        
        timetableData[className] = processedSchedule;
      });
      
      console.log('Processed timetable data:', timetableData);
      setTimetables(timetableData);
    } catch (error) {
      console.error('Error fetching timetables:', error);
    }
  };

  const generateClassSchedule = () => {
    const schedule = {};
    
    days.forEach(day => {
      schedule[day] = {};
      
      periods.forEach(period => {
        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
        const subjectStaff = staff.filter(s => s.subject === randomSubject);
        const randomStaff = subjectStaff[Math.floor(Math.random() * subjectStaff.length)];
        
        schedule[day][period] = {
          subject: randomSubject,
          staff: randomStaff
        };
      });
    });
    
    return schedule;
  };

  const generateDefaultTimetables = async () => {
    if (staff.length === 0) return;
    
    const newTimetables = {};
    
    for (const className of classes) {
      newTimetables[className] = generateClassSchedule();
      
      // Save to database
      await saveTimetableToDatabase(className, newTimetables[className]);
    }
    
    setTimetables(newTimetables);
  };

  const generateMissingTimetables = async (missingClasses) => {
    if (staff.length === 0) return;
    
    const newTimetables = { ...timetables };
    
    for (const className of missingClasses) {
      newTimetables[className] = {};
      
      days.forEach(day => {
        newTimetables[className][day] = {};
        
        periods.forEach(period => {
          const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
          const subjectStaff = staff.filter(s => s.subject === randomSubject);
          const randomStaff = subjectStaff[Math.floor(Math.random() * subjectStaff.length)];
          
          newTimetables[className][day][period] = {
            subject: randomSubject,
            staff: randomStaff
          };
        });
      });
      
      // Save to database
      await saveTimetableToDatabase(className, newTimetables[className]);
    }
    
    setTimetables(newTimetables);
  };

  const handlePeriodClick = (day, period) => {
    if (period === 'Break' || period === 'Lunch') return;
    
    setEditingPeriod({ day, period });
    
    // Find current period data from array structure
    const daySchedule = timetables[selectedClass]?.[day] || [];
    const currentPeriod = daySchedule.find(p => p.period === period);
    
    setSelectedSubject(currentPeriod?.subject || '');
    
    // Handle teacher selection properly
    let teacherId = '';
    if (currentPeriod?.teacher) {
      // If teacher is populated object with _id
      if (typeof currentPeriod.teacher === 'object' && currentPeriod.teacher._id) {
        teacherId = currentPeriod.teacher._id;
      }
      // If teacher is ObjectId string
      else if (typeof currentPeriod.teacher === 'string') {
        teacherId = currentPeriod.teacher;
      }
    }
    
    setSelectedStaff(teacherId);
    setIsEditModalOpen(true);
  };

  const handleSavePeriod = async () => {
    if (!selectedSubject || !selectedStaff) {
      alert('Please select both subject and staff');
      return;
    }
    
    const staffMember = staff.find(s => s._id === selectedStaff);
    
    if (!staffMember) {
      alert('Staff member not found');
      return;
    }
    
    // Get current complete schedule (includes all previous assignments)
    const currentSchedule = timetables[selectedClass] || {};
    
    // Create updated schedule with all existing data
    const updatedSchedule = JSON.parse(JSON.stringify(currentSchedule));
    
    if (!updatedSchedule[editingPeriod.day]) {
      updatedSchedule[editingPeriod.day] = [];
    }
    
    const existingPeriodIndex = updatedSchedule[editingPeriod.day].findIndex(
      p => p.period === editingPeriod.period
    );
    
    const periodData = {
      period: editingPeriod.period,
      time: getTimeSlot(editingPeriod.period),
      subject: selectedSubject,
      teacher: staffMember._id
    };
    
    if (existingPeriodIndex >= 0) {
      updatedSchedule[editingPeriod.day][existingPeriodIndex] = periodData;
    } else {
      updatedSchedule[editingPeriod.day].push(periodData);
      updatedSchedule[editingPeriod.day].sort((a, b) => a.period - b.period);
    }
    
    // Update UI state immediately
    setTimetables(prev => ({ ...prev, [selectedClass]: updatedSchedule }));
    
    // Close modal
    setIsEditModalOpen(false);
    setEditingPeriod(null);
    setSelectedSubject('');
    setSelectedStaff('');
    
    // Save complete schedule to database
    try {
      const classNum = selectedClass.slice(0, -1);
      const section = selectedClass.slice(-1);
      
      // Get existing timetable first to preserve all periods
      const response = await timetableAPI.getTimetable();
      const existingTimetable = response.data.find(tt => 
        tt.class === classNum && tt.section === section
      );
      
      let finalSchedule;
      
      if (existingTimetable) {
        // Start with existing database schedule
        finalSchedule = JSON.parse(JSON.stringify(existingTimetable.schedule));
        
        // Update only the specific period we just changed
        if (!finalSchedule[editingPeriod.day]) {
          finalSchedule[editingPeriod.day] = [];
        }
        
        const existingIndex = finalSchedule[editingPeriod.day].findIndex(
          p => p.period === editingPeriod.period
        );
        
        if (existingIndex >= 0) {
          finalSchedule[editingPeriod.day][existingIndex] = periodData;
        } else {
          finalSchedule[editingPeriod.day].push(periodData);
          finalSchedule[editingPeriod.day].sort((a, b) => a.period - b.period);
        }
      } else {
        // Use updated schedule for new timetable
        finalSchedule = updatedSchedule;
      }
      
      const timetableData = {
        class: classNum,
        section: section,
        schedule: finalSchedule
      };
      
      if (existingTimetable) {
        await timetableAPI.updateTimetable(existingTimetable._id, timetableData);
      } else {
        await timetableAPI.createTimetable(timetableData);
      }
      
      alert('Staff assignment saved successfully!');
    } catch (error) {
      console.error('Database save failed:', error);
      alert('Failed to save to database. Changes will be lost on refresh.');
    }
  };

  const updateTimetableInDatabase = async (className, period, subject, staffName) => {
    // Since API is not available, just log the update
    console.log('✅ Timetable Update:', {
      class: className,
      day: period.day,
      period: period.period,
      subject: subject,
      staff: staffName
    });
    
    // In a real scenario, this would update the database
    // For now, the frontend state is updated which is sufficient
    alert(`Updated ${className} ${period.day} Period ${period.period} to ${subject} with ${staffName}`);
  };



  const getTimeSlot = (period) => {
    const timeSlots = {
      1: '9:00-9:45',
      2: '9:45-10:30',
      3: '10:45-11:30',
      4: '11:30-12:15',
      5: '1:00-1:45',
      6: '1:45-2:30',
      7: '2:30-3:15',
      8: '3:15-4:00'
    };
    return timeSlots[period] || '';
  };

  const renderPeriodCell = (day, period, dayIndex) => {
    if (period === 'Break1') {
      return (
        <td key="break1" className="px-4 py-6 text-center bg-yellow-50 border" rowSpan={dayIndex === 0 ? 5 : undefined}>
          {dayIndex === 0 && (
            <div className="font-semibold text-yellow-800 leading-tight">
              {'BREAK'.split('').map((letter, i) => (
                <div key={i}>{letter}</div>
              ))}
            </div>
          )}
        </td>
      );
    }
    
    if (period === 'Lunch') {
      return (
        <td key="lunch" className="px-4 py-6 text-center bg-orange-50 border" rowSpan={dayIndex === 0 ? 5 : undefined}>
          {dayIndex === 0 && (
            <div className="font-semibold text-orange-800 leading-tight">
              {'LUNCH'.split('').map((letter, i) => (
                <div key={i}>{letter}</div>
              ))}
            </div>
          )}
        </td>
      );
    }
    
    if (period === 'Break2') {
      return (
        <td key="break2" className="px-4 py-6 text-center bg-yellow-50 border" rowSpan={dayIndex === 0 ? 5 : undefined}>
          {dayIndex === 0 && (
            <div className="font-semibold text-yellow-800 leading-tight">
              {'BREAK'.split('').map((letter, i) => (
                <div key={i}>{letter}</div>
              ))}
            </div>
          )}
        </td>
      );
    }

    const periodData = timetables[selectedClass]?.[day]?.find(p => p.period === period);
    
    // Get teacher name properly
    const getTeacherName = (teacherData) => {
      if (!teacherData) return 'Not Assigned';
      
      // If teacher is populated object with name
      if (typeof teacherData === 'object' && teacherData.name) {
        return teacherData.name;
      }
      
      // If teacher is ObjectId string, find in staff array
      if (typeof teacherData === 'string') {
        const staffMember = staff.find(s => s._id === teacherData);
        return staffMember ? staffMember.name : 'Not Assigned';
      }
      
      return 'Not Assigned';
    };

    return (
      <td 
        key={period} 
        className="px-4 py-4 text-center border hover:bg-blue-50 cursor-pointer transition-colors"
        onClick={() => handlePeriodClick(day, period)}
      >
        {periodData ? (
          <div className="bg-blue-100 p-3 rounded-lg">
            <div className="font-semibold text-blue-800">
              {period}{period === 1 ? 'st' : period === 2 ? 'nd' : period === 3 ? 'rd' : 'th'} Period - {periodData.subject}
            </div>
            <div className="text-sm text-blue-600 mt-1">
              Staff: {getTeacherName(periodData.teacher)}
            </div>
            <Edit2 size={14} className="mx-auto mt-2 text-blue-500" />
          </div>
        ) : (
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="text-gray-500">No Subject</div>
            <div className="text-xs text-gray-400">Click to assign</div>
          </div>
        )}
      </td>
    );
  };

  const renderTimetableRow = (day, dayIndex) => {
    const periodSequence = [1, 2, 'Break1', 3, 4, 'Lunch', 5, 6, 'Break2', 7, 8];
    
    return (
      <tr key={day} className="hover:bg-gray-50">
        <td className="px-4 py-4 font-semibold text-gray-700 bg-gray-100 border">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            {day}
          </div>
        </td>
        {periodSequence.map(period => {
          // Skip break/lunch cells for rows after the first one
          if ((period === 'Break1' || period === 'Lunch' || period === 'Break2') && dayIndex > 0) {
            return null;
          }
          return renderPeriodCell(day, period, dayIndex);
        })}
      </tr>
    );
  };

  const filteredStaff = selectedSubject ? staff.filter(s => s.subject === selectedSubject) : [];

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 lg:ml-64 transition-all duration-300 min-w-0">
        <Navbar />
        <div className="p-4 lg:p-6 overflow-hidden">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Timetable Management</h1>
          </div>

          {/* Class Selection */}
          <div className="mb-6">
            <label className="block text-base font-medium mb-3">Select Class:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {classes.map(className => (
                <button
                  key={className}
                  onClick={() => setSelectedClass(className)}
                  className={`p-3 min-h-[80px] rounded-lg border-2 transition-all flex flex-col items-center justify-center ${
                    selectedClass === className
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100'
                  }`}
                >
                  <Users size={20} className="mb-2" />
                  <div className="text-base font-semibold">Class {className}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Timetable Display */}
          {selectedClass && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
                <h2 className="text-xl font-bold">Class {selectedClass} - Weekly Timetable</h2>
                <p className="text-sm text-blue-100 mt-1">Click on any period to edit subject and staff assignment</p>
              </div>
              
              <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
                <table className="w-full min-w-[1200px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Day</th>
                      <th className="px-4 py-3 text-center font-semibold">Period 1<br/><span className="text-xs text-gray-500">9:00-9:45</span></th>
                      <th className="px-4 py-3 text-center font-semibold">Period 2<br/><span className="text-xs text-gray-500">9:45-10:30</span></th>
                      <th className="px-4 py-3 text-center font-semibold bg-yellow-50">Break<br/><span className="text-xs text-gray-500">10:30-10:45</span></th>
                      <th className="px-4 py-3 text-center font-semibold">Period 3<br/><span className="text-xs text-gray-500">10:45-11:30</span></th>
                      <th className="px-4 py-3 text-center font-semibold">Period 4<br/><span className="text-xs text-gray-500">11:30-12:15</span></th>
                      <th className="px-4 py-3 text-center font-semibold bg-orange-50">Lunch<br/><span className="text-xs text-gray-500">12:15-1:00</span></th>
                      <th className="px-4 py-3 text-center font-semibold">Period 5<br/><span className="text-xs text-gray-500">1:00-1:45</span></th>
                      <th className="px-4 py-3 text-center font-semibold">Period 6<br/><span className="text-xs text-gray-500">1:45-2:30</span></th>
                      <th className="px-4 py-3 text-center font-semibold bg-yellow-50">Break<br/><span className="text-xs text-gray-500">2:30-2:45</span></th>
                      <th className="px-4 py-3 text-center font-semibold">Period 7<br/><span className="text-xs text-gray-500">2:45-3:30</span></th>
                      <th className="px-4 py-3 text-center font-semibold">Period 8<br/><span className="text-xs text-gray-500">3:30-4:15</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day, index) => renderTimetableRow(day, index))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!selectedClass && (
            <div className="text-center py-12">
              <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">Select a class to view and edit its timetable</p>
            </div>
          )}

          {/* Edit Period Modal */}
          <Modal 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            title={`Edit ${editingPeriod?.day} - Period ${editingPeriod?.period}`}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Subject:</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setSelectedStaff(''); // Reset staff when subject changes
                  }}
                  className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose Subject</option>
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject.name}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSubject && (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Staff:</label>
                  <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="w-full px-4 py-3 min-h-[48px] text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose Staff</option>
                    {staff.map(staffMember => (
                      <option key={staffMember._id} value={staffMember._id}>
                        {staffMember.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSavePeriod}
                  disabled={!selectedSubject || !selectedStaff}
                  className="flex-1 bg-blue-500 text-white py-3 min-h-[48px] text-base font-medium px-4 rounded-lg hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-gray-500 text-white py-3 min-h-[48px] text-base font-medium px-4 rounded-lg hover:bg-gray-600 active:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default TimetableModule;