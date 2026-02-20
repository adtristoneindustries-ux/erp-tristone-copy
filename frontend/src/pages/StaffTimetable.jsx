import { useState, useEffect, useContext } from "react";
import { Calendar, Clock } from "lucide-react";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import axios from "axios";

const StaffTimetable = () => {
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (user?.id) {
      fetchStaffTimetable();
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on("timetableUpdate", () => {
        if (user?.id) {
          fetchStaffTimetable();
        }
      });
      return () => socket.off("timetableUpdate");
    }
  }, [socket, user]);

  const fetchStaffTimetable = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/timetable/staff/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTimetable(response.data);
    } catch (error) {
      console.error("Error fetching staff timetable:", error);
    } finally {
      setLoading(false);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [
    "9:00-9:45",
    "9:45-10:30",
    "10:45-11:30",
    "11:30-12:15",
    "1:00-1:45",
    "1:45-2:30",
    "2:30-3:15",
    "3:15-4:00",
  ];

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading timetable...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 lg:p-6">
        <div className="mb-6">
          <h1 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
            <Calendar className="text-blue-600" />
            My Timetable
          </h1>
          <p className="text-gray-600">View your teaching schedule</p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {!timetable || Object.keys(timetable).length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No timetable assigned yet</p>
              <p className="text-gray-400 text-sm">
                Please contact the administrator
              </p>
            </div>
          ) : (
            <div>
              <div className="bg-blue-50 p-4 border-b">
                <h2 className="text-xl font-bold text-blue-800">
                  {user?.name}'s Teaching Schedule
                </h2>
              </div>
              <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
                <table className="w-full min-w-[1200px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">
                        Period
                      </th>
                      {days.map((day) => (
                        <th
                          key={day}
                          className="px-4 py-3 text-center font-semibold"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time, periodIndex) => (
                      <tr
                        key={periodIndex}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <div>
                              <div>Period {periodIndex + 1}</div>
                              <div className="text-xs text-gray-500">
                                {time}
                              </div>
                            </div>
                          </div>
                        </td>
                        {days.map((day) => {
                          const period = timetable[day]?.find(
                            (p) => p.period === periodIndex + 1
                          );
                          return (
                            <td key={day} className="px-4 py-3 text-center">
                              {period && period.type === "assigned" ? (
                                <div className="bg-green-50 p-2 rounded border border-green-200">
                                  <div className="font-semibold text-green-800">
                                    {period.subject}
                                  </div>
                                  <div className="text-sm text-green-600">
                                    Class {period.class} {period.section}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {period.time}
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                                  <span className="text-gray-500 text-sm">
                                    Free Hour
                                  </span>
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
        </div>

        {timetable && Object.keys(timetable).length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
            {days.map((day) => {
              const daySchedule =
                timetable[day]?.filter((p) => p.type === "assigned") || [];
              return (
                <div key={day} className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="font-bold text-lg mb-3 text-center text-blue-600">
                    {day}
                  </h3>
                  <div className="space-y-2">
                    {daySchedule.map((period, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-2 rounded text-sm"
                      >
                        <div className="font-medium">
                          P{period.period}: {period.subject}
                        </div>
                        <div className="text-gray-600">
                          Class {period.class} {period.section}
                        </div>
                      </div>
                    ))}
                    {daySchedule.length === 0 && (
                      <p className="text-gray-400 text-center py-4">
                        No classes
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StaffTimetable;
