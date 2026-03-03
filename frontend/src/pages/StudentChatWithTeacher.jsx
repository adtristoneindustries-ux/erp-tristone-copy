import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Send, Search, MessageCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatAPI } from '../services/api';

const StudentChatWithTeacher = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [activeTab, setActiveTab] = useState('student-teacher');
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showTeacherList, setShowTeacherList] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.emit('userOnline', user._id);

      socket.on('newMessage', (message) => {
        if (selectedTeacher && 
            (message.sender._id === selectedTeacher._id || message.receiver._id === selectedTeacher._id)) {
          setMessages(prev => [...prev, message]);
        }
      });

      socket.on('userStatusChange', ({ userId, isOnline }) => {
        setTeachers(prev => prev.map(t => 
          t._id === userId ? { ...t, isOnline } : t
        ));
      });

      return () => {
        socket.off('newMessage');
        socket.off('userStatusChange');
      };
    }
  }, [socket, selectedTeacher, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTeachers = async () => {
    try {
      const response = await chatAPI.getTeachers();
      setTeachers(response.data);
    } catch (error) {
      toast.error('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async (teacherId) => {
    try {
      const response = await chatAPI.getChatHistory(teacherId);
      // Filter messages based on active tab
      const filteredMessages = response.data.filter(msg => {
        if (activeTab === 'student-teacher') {
          return msg.chatType === 'student-teacher' || msg.chatType === 'teacher-student';
        } else {
          return msg.chatType === 'parent-teacher' || msg.chatType === 'teacher-parent';
        }
      });
      setMessages(filteredMessages);
    } catch (error) {
      toast.error('Failed to fetch chat history');
    }
  };

  const handleTeacherSelect = (teacher) => {
    setSelectedTeacher(teacher);
    fetchChatHistory(teacher._id);
    setShowTeacherList(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (selectedTeacher) {
      fetchChatHistory(selectedTeacher._id);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTeacher) return;

    try {
      await chatAPI.sendMessage({
        receiverId: selectedTeacher._id,
        message: newMessage,
        chatType: activeTab
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleBackToList = () => {
    setShowTeacherList(true);
    setSelectedTeacher(null);
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Navbar />
        <div className="flex-1 flex overflow-hidden">
          {/* Teachers List */}
          <div className={`${showTeacherList ? 'flex' : 'hidden'} lg:flex w-full lg:w-96 bg-white lg:border-r flex-col`}>
            <div className="p-4 lg:p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h2 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4">Classroom Communication</h2>
              
              {/* Tabs */}
              <div className="flex space-x-2 mb-3 lg:mb-4">
                <button
                  onClick={() => handleTabChange('student-teacher')}
                  className={`flex-1 py-2 px-3 lg:px-4 text-sm lg:text-base rounded-lg font-medium transition ${
                    activeTab === 'student-teacher'
                      ? 'bg-white text-blue-600'
                      : 'bg-blue-500 text-white hover:bg-blue-400'
                  }`}
                >
                  Student ↔ Teacher
                </button>
                <button
                  onClick={() => handleTabChange('parent-teacher')}
                  className={`flex-1 py-2 px-3 lg:px-4 text-sm lg:text-base rounded-lg font-medium transition ${
                    activeTab === 'parent-teacher'
                      ? 'bg-white text-blue-600'
                      : 'bg-blue-500 text-white hover:bg-blue-400'
                  }`}
                >
                  Parent ↔ Teacher
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 lg:h-5 w-4 lg:w-5" />
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 lg:pl-10 pr-4 py-2 lg:py-3 text-sm lg:text-base rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 lg:p-6 text-center text-gray-500">Loading...</div>
              ) : filteredTeachers.length === 0 ? (
                <div className="p-4 lg:p-6 text-center text-gray-500">No teachers found</div>
              ) : (
                filteredTeachers.map((teacher) => (
                  <div
                    key={teacher._id}
                    onClick={() => handleTeacherSelect(teacher)}
                    className={`p-3 lg:p-4 border-b cursor-pointer transition hover:bg-blue-50 ${
                      selectedTeacher?._id === teacher._id ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base lg:text-lg shadow-lg">
                          {teacher.name.charAt(0).toUpperCase()}
                        </div>
                        {teacher.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="ml-3 lg:ml-4 flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-base lg:text-lg truncate">{teacher.name}</div>
                        <div className="text-xs lg:text-sm text-gray-600 truncate">
                          {teacher.subjects?.map(s => s.name).join(', ') || 'Teacher'}
                        </div>
                        {teacher.isOnline && (
                          <div className="flex items-center mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-xs text-green-600 font-medium">Online</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${!showTeacherList ? 'flex' : 'hidden'} lg:flex flex-1 bg-white flex-col`}>
            {selectedTeacher ? (
              <>
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 lg:p-4 flex items-center">
                  <button
                    onClick={handleBackToList}
                    className="lg:hidden mr-3 p-2 hover:bg-white/20 rounded-full"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-base lg:text-lg">
                      {selectedTeacher.name.charAt(0).toUpperCase()}
                    </div>
                    {selectedTeacher.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="ml-3 lg:ml-4 flex-1 min-w-0">
                    <div className="font-semibold text-base lg:text-lg truncate">{selectedTeacher.name}</div>
                    <div className="text-xs lg:text-sm text-blue-100 truncate">
                      {activeTab === 'student-teacher' ? 'Student Communication' : 'Parent Communication'}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 lg:p-6 space-y-3 lg:space-y-4 bg-gradient-to-b from-gray-50 to-white">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <MessageCircle className="h-12 w-12 lg:h-16 lg:w-16 mx-auto mb-3 lg:mb-4 opacity-50" />
                        <p className="text-sm lg:text-base">No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] lg:max-w-xs xl:max-w-md px-3 lg:px-5 py-2 lg:py-3 rounded-2xl shadow-md text-sm lg:text-base ${
                            msg.sender._id === user._id
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none'
                              : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                          }`}
                        >
                          <div className="break-words">{msg.message}</div>
                          <div
                            className={`text-xs mt-1 lg:mt-2 ${
                              msg.sender._id === user._id ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-3 lg:p-4 bg-gray-50 border-t">
                  <div className="flex space-x-2 lg:space-x-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-3 lg:px-5 py-2 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
                    >
                      <Send className="h-4 w-4 lg:h-5 lg:w-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 p-4">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 lg:h-24 lg:w-24 mx-auto mb-4 lg:mb-6 opacity-30" />
                  <p className="text-base lg:text-xl font-medium text-gray-500">Select a teacher to start chatting</p>
                  <p className="text-xs lg:text-sm text-gray-400 mt-2">Choose from the list</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentChatWithTeacher;
