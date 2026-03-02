import { useState, useEffect } from 'react';
import { examAPI } from '../services/api';
import { FiCalendar, FiDownload } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import Layout from '../components/Layout';

const StudentExamSchedule = () => {
  const [examSchedules, setExamSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);

      const examsRes = await examAPI.getExams();
      const exams = examsRes.data;

      // Group exams by examName
      const grouped = {};
      exams.forEach(exam => {
        if (!grouped[exam.examName]) {
          grouped[exam.examName] = {
            examName: exam.examName,
            exams: [],
            startDate: exam.date,
            endDate: exam.date
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
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch exam schedule');
    } finally {
      setLoading(false);
    }
  };

  const downloadHallTicket = (schedule) => {
    try {
      const doc = new jsPDF();
      
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('HALL TICKET', 105, 15, { align: 'center' });
      doc.setFontSize(11);
      doc.text(schedule.examName, 105, 25, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.rect(15, 45, 180, 35);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Student Details:', 20, 52);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${user?.name || 'N/A'}`, 20, 59);
      doc.text(`Roll No: ${user?.rollNumber || 'N/A'}`, 20, 66);
      doc.text(`Class: ${user?.class || 'N/A'} - ${user?.section || 'N/A'}`, 20, 73);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Exam Schedule:', 15, 92);
      
      const headers = [['Date', 'Subject', 'Time', 'Hall']];
      const data = schedule.exams.map(exam => [
        new Date(exam.date).toLocaleDateString('en-IN'),
        exam.subject?.name || 'N/A',
        `${exam.startTime} - ${exam.endTime}`,
        exam.hall
      ]);
      
      let yPos = 98;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Date', 20, yPos);
      doc.text('Subject', 55, yPos);
      doc.text('Time', 110, yPos);
      doc.text('Hall', 155, yPos);
      
      doc.setLineWidth(0.3);
      doc.line(15, yPos + 2, 195, yPos + 2);
      
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      
      data.forEach(row => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(row[0], 20, yPos);
        doc.text(row[1], 55, yPos);
        doc.text(row[2], 110, yPos);
        doc.text(row[3], 155, yPos);
        yPos += 7;
      });
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Important Instructions:', 15, yPos + 10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('• Bring this hall ticket to the examination hall', 15, yPos + 16);
      doc.text('• Arrive 15 minutes before the exam starts', 15, yPos + 21);
      doc.text('• Carry your student ID card', 15, yPos + 26);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(15, 280, 195, 280);
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text('This is a computer-generated hall ticket.', 105, 285, { align: 'center' });
      
      doc.save(`Hall_Ticket_${schedule.examName.replace(/\s+/g, '_')}.pdf`);
      toast.success('Hall ticket downloaded');
    } catch (error) {
      console.error('PDF error:', error);
      toast.error('Failed to generate hall ticket');
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

  const upcomingSchedule = examSchedules.find(s => new Date(s.endDate) >= new Date());

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Exam Schedule</h1>
          <p className="text-gray-600 mt-1">View your exam timetable and download hall ticket</p>
        </div>

        {upcomingSchedule && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">Upcoming Examination</h3>
                <p className="text-lg font-semibold text-gray-800">{upcomingSchedule.examName}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(upcomingSchedule.startDate).toLocaleDateString('en-IN')} - {new Date(upcomingSchedule.endDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => downloadHallTicket(upcomingSchedule)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FiDownload /> Hall Ticket
              </button>
            </div>
          </div>
        )}

        {examSchedules.map((schedule, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{schedule.examName}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(schedule.startDate).toLocaleDateString('en-IN')} - {new Date(schedule.endDate).toLocaleDateString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => downloadHallTicket(schedule)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <FiDownload /> Download Hall Ticket
              </button>
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
                      <td className="border border-gray-300 px-4 py-3">{exam.startTime} - {exam.endTime}</td>
                      <td className="border border-gray-300 px-4 py-3">{exam.duration} hrs</td>
                      <td className="border border-gray-300 px-4 py-3">{exam.hall}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {examSchedules.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">No exams scheduled yet</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentExamSchedule;
