import { useState, useEffect } from 'react';
import { examAPI } from '../services/api';
import { FiCalendar, FiClock, FiMapPin, FiDownload, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import Layout from '../components/Layout';

const StudentExamSchedule = () => {
  const [exams, setExams] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
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

      const [examsRes, upcomingRes] = await Promise.all([
        examAPI.getExams(),
        examAPI.getUpcomingExams()
      ]);

      setExams(examsRes.data);
      setUpcomingExams(upcomingRes.data);
    } catch (error) {
      toast.error('Failed to fetch exam schedule');
    } finally {
      setLoading(false);
    }
  };

  const downloadHallTicket = (exam) => {
    try {
      const doc = new jsPDF();
      
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('HALL TICKET', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('School ERP System', 105, 30, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.5);
      doc.rect(15, 50, 180, 40);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Student Details:', 20, 58);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${user?.name || 'N/A'}`, 20, 66);
      doc.text(`Roll No: ${user?.rollNumber || 'N/A'}`, 20, 73);
      doc.text(`Class: ${exam.class?.name || 'N/A'} - ${exam.class?.section || 'N/A'}`, 20, 80);
      doc.text(`Email: ${user?.email || 'N/A'}`, 110, 66);
      
      doc.rect(15, 100, 180, 70);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Exam Details:', 20, 108);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Exam Name: ${exam.examName}`, 20, 118);
      doc.text(`Subject: ${exam.subject?.name || 'N/A'}`, 20, 126);
      doc.text(`Date: ${new Date(exam.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 20, 134);
      doc.text(`Time: ${exam.startTime} - ${exam.endTime}`, 20, 142);
      doc.text(`Duration: ${exam.duration} hours`, 20, 150);
      doc.text(`Hall: ${exam.hall}`, 20, 158);
      doc.text(`Total Marks: ${exam.totalMarks}`, 110, 118);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Important Notes:', 15, 190);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('• Bring this hall ticket to the examination hall', 15, 197);
      doc.text('• Arrive 15 minutes before the exam starts', 15, 203);
      doc.text('• Carry your student ID card', 15, 209);
      
      doc.setDrawColor(200, 200, 200);
      doc.line(15, 270, 195, 270);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('This is a computer-generated hall ticket.', 105, 277, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 105, 283, { align: 'center' });
      
      doc.save(`Hall_Ticket_${exam.examName.replace(/\s+/g, '_')}.pdf`);
      toast.success('Hall ticket downloaded');
    } catch (error) {
      toast.error('Failed to generate hall ticket');
    }
  };

  const getDaysUntilExam = (examDate) => {
    const today = new Date();
    const exam = new Date(examDate);
    const diffDays = Math.ceil((exam - today) / (1000 * 60 * 60 * 24));
    return diffDays;
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
          <p className="text-gray-600 mt-1">View your exam timetable and download hall tickets</p>
        </div>

        {upcomingExams.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-red-600 mt-1" size={24} />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800 mb-2">Upcoming Examinations</h3>
                {upcomingExams.slice(0, 3).map(exam => {
                  const daysUntil = getDaysUntilExam(exam.date);
                  return (
                    <div key={exam._id} className="bg-white rounded-lg p-4 mb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-800">{exam.examName}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {exam.subject.name} • {new Date(exam.date).toLocaleDateString()} • {exam.startTime}
                          </p>
                          <p className="text-sm font-semibold text-red-600 mt-1">
                            {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow!' : `In ${daysUntil} days`}
                          </p>
                        </div>
                        {exam.examType !== 'Quiz' && (
                          <button
                            onClick={() => downloadHallTicket(exam)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                          >
                            <FiDownload /> Hall Ticket
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Complete Exam Schedule</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(exam => (
              <div key={exam._id} className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md p-6 border">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{exam.examName}</h3>
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <FiCalendar className="text-blue-600" />
                    <span className="font-semibold">{new Date(exam.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FiClock className="text-green-600" />
                    <span>{exam.startTime} - {exam.endTime} ({exam.duration} hrs)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <FiMapPin className="text-red-600" />
                    <span className="font-semibold">{exam.hall}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-gray-600"><span className="font-semibold">Subject:</span> {exam.subject.name}</p>
                    <p className="text-gray-600"><span className="font-semibold">Total Marks:</span> {exam.totalMarks}</p>
                  </div>
                </div>

                {exam.examType !== 'Quiz' && exam.status === 'Scheduled' && (
                  <button
                    onClick={() => downloadHallTicket(exam)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    <FiDownload /> Download Hall Ticket
                  </button>
                )}
              </div>
            ))}
          </div>

          {exams.length === 0 && (
            <div className="text-center py-12">
              <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 text-lg">No exams scheduled yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentExamSchedule;
