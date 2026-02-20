import { useState, useEffect, useContext } from 'react';
import { Calendar, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user?.class) {
      fetchTimetable();
    }
  }, [user]);

  const fetchTimetable = async () => {
    // Temporary hardcoded timetable structure for demo
    const defaultTimetable = {
      class: user.class,
      section: 'A',
      schedule: {
        Monday: [
          { period: 1, time: '9:00-9:45', subject: 'Tamil', teacher: { name: 'Rajesh Sharma' } },
          { period: 2, time: '9:45-10:30', subject: 'English', teacher: { name: 'Amit Singh' } },
          { period: 3, time: '10:45-11:30', subject: 'Math', teacher: { name: 'Vikram Kumar' } },
          { period: 4, time: '11:30-12:15', subject: 'Science', teacher: { name: 'Suresh Reddy' } },
          { period: 5, time: '1:00-1:45', subject: 'Social', teacher: { name: 'Ravi Iyer' } },
          { period: 6, time: '1:45-2:30', subject: 'Tamil', teacher: { name: 'Rajesh Sharma' } },
          { period: 7, time: '2:30-3:15', subject: 'English', teacher: { name: 'Amit Singh' } },
          { period: 8, time: '3:15-4:00', subject: 'Math', teacher: { name: 'Vikram Kumar' } }
        ],
        Tuesday: [
          { period: 1, time: '9:00-9:45', subject: 'Tamil', teacher: { name: 'Rajesh Sharma' } },
          { period: 2, time: '9:45-10:30', subject: 'English', teacher: { name: 'Amit Singh' } },
          { period: 3, time: '10:45-11:30', subject: 'Math', teacher: { name: 'Vikram Kumar' } },
          { period: 4, time: '11:30-12:15', subject: 'Science', teacher: { name: 'Suresh Reddy' } },
          { period: 5, time: '1:00-1:45', subject: 'Social', teacher: { name: 'Ravi Iyer' } },
          { period: 6, time: '1:45-2:30', subject: 'Tamil', teacher: { name: 'Rajesh Sharma' } },
          { period: 7, time: '2:30-3:15', subject: 'English', teacher: { name: 'Amit Singh' } },
          { period: 8, time: '3:15-4:00', subject: 'Math', teacher: { name: 'Vikram Kumar' } }
        ],
        Wednesday: [
          { period: 1, time: '9:00-9:45', subject: 'Tamil', teacher: { name: 'Rajesh Sharma' } },
          { period: 2, time: '9:45-10:30', subject: 'English', teacher: { name: 'Amit Singh' } },
          { period: 3, time: '10:45-11:30', subject: 'Math', teacher: { name: 'Vikram Kumar' } },
          { period: 4, time: '11:30-12:15', subject: 'Science', teacher: { name: 'Suresh Reddy' } },
          { period: 5, time: '1:00-1:45', subject: 'Social', teacher: { name: 'Ravi Iyer' } },
          { period: 6, time: '1:45-2:30', subject: 'Tamil', teacher: { name: 'Rajesh Sharma' } },
          { period: 7, time: '2:30-3:15', subject: 'English', teacher: { name: 'Amit Singh' } },
          { period: 8, time: '3:15-4:00', subject: 'Math', teacher: { name: 'Vikram Kumar' } }
        ],
        Thursday: [
          { period: 1, time: '9:00-9:45', subject: 'Tamil', teacher: { name: 'Rajesh Sharma' } },
          { period: 2, time: '9:45-10:30', subject: 'English', teacher: { name: 'Amit Singh' } },
          { period: 3, time: '10:45-11:30', subject: 'Math', teacher: { name: 'Vikram Kumar' } },
          { period: 4, time: '11:30-12:15', subject: 'Science', teacher: { name: 'Suresh Reddy' } },
          { period: 5, time: '1:00-1:45', subject: 'Social', teacher: { name: 'Ravi Iyer' } },
          { period: 6, time: '1:45-2:30', subject: 'Tamil', teacher: { name: 'Rajesh Sharma' } },
          { period: 7, time: '2:30-3:15', subject: 'English', teacher: { name: 'Amit Singh' } },
          { period: 8, time: '3:15-4:00', subject: 'Math', teacher: { name: 'Vikram Kumar' } }
        ],
        Friday: [
          { period: 1, time: '9:00-9:45', subject: 'Tamil', teacher: { name: 'Rajesh Sharma' } },
          { period: 2, time: '9:45-10:30', subject: 'English', teacher: { name: 'Amit Singh' } },
          { period: 3, time: '10:45-11:30', subject: 'Math', teacher: { name: 'Vikram Kumar' } },
          { period: 4, time: '11:30-12:15', subject: 'Science', teacher: { name: 'Suresh Reddy' } },
          { period: 5, time: '1:00-1:45', subject: 'Social', teacher: { name: 'Ravi Iyer' } },
          { period: 6, time: '1:45-2:30', subject: 'Tamil', teacher: { name: 'Rajesh Sharma' } },
          { period: 7, time: '2:30-3:15', subject: 'English', teacher: { name: 'Amit Singh' } },
          { period: 8, time: '3:15-4:00', subject: 'Math', teacher: { name: 'Vikram Kumar' } }
        ]
      }
    };
    setTimetable(defaultTimetable);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <Layout title={`My Timetable - Class ${user?.class}`}>
      {!timetable ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No timetable available for your class</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
            <h2 className="text-xl font-bold">Class {user?.class} - Weekly Timetable</h2>
            <p className="text-sm text-blue-100 mt-1">Your class schedule</p>
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
                {days.map((day, dayIndex) => (
                  <tr key={day} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-semibold text-gray-700 bg-gray-100 border">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {day}
                      </div>
                    </td>
                    {[1, 2, 'Break1', 3, 4, 'Lunch', 5, 6, 'Break2', 7, 8].map((period) => {
                      if ((period === 'Break1' || period === 'Lunch' || period === 'Break2') && dayIndex > 0) {
                        return null;
                      }
                      
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
                      
                      const periodData = timetable.schedule[day][period - 1];
                      return (
                        <td key={period} className="px-4 py-4 text-center border">
                          {periodData ? (
                            <div className="bg-blue-100 p-3 rounded-lg">
                              <div className="font-semibold text-blue-800">
                                {period}{period === 1 ? 'st' : period === 2 ? 'nd' : period === 3 ? 'rd' : 'th'} Period - {periodData.subject}
                              </div>
                              <div className="text-sm text-blue-600 mt-1">
                                Teacher: {periodData.teacher?.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {periodData.time}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-100 p-3 rounded-lg">
                              <div className="text-gray-500">Free Period</div>
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
    </Layout>
  );
};

export default StudentTimetable;