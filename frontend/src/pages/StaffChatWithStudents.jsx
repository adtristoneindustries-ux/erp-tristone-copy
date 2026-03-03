import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Send, Search, MessageCircle, ArrowLeft, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatAPI, classAPI } from '../services/api';

const StaffChatWithStudents = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showContactList, setShowContactList] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (activeTab === 'parents') {
      fetchParents();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    }
  }, [selectedClass, selectedSection, activeTab]);

  useEffect(() => {
    if (socket) {
      socket.emit('userOnline', user._id);

      socket.on('newMessage', (message) => {
        if (selectedContact && 
            (message.sender._id === selectedContact._id || message.receiver._id === selectedContact._id)) {
          setMessages(prev => [...prev, message]);
        }
      });

      socket.on('userStatusChange', ({ userId, isOnline }) => {
        setStudents(prev => prev.map(s => 
          s._id === userId ? { ...s, isOnline } : s
        ));
        setParents(prev => prev.map(p => 
          p._id === userId ? { ...p, isOnline } : p
        ));
      });

      return () => {
        socket.off('newMessage');
        socket.off('userStatusChange');
      };
    }
  }, [socket, selectedContact, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getClasses();
      console.log('Classes fetched:', response.data);
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedClass) params.class = selectedClass;
      if (selectedSection) params.section = selectedSection;
      
      const response = await chatAPI.getStudents(params);
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchParents = async () => {
    setLoading(true);
    try {
      const response = await chatAPI.getParents();
      setParents(response.data);
    } catch (error) {
      toast.error('Failed to fetch parents');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async (contactId) => {
    try {
      const response = await chatAPI.getChatHistory(contactId);
      // Filter messages based on active tab
      const filteredMessages = response.data.filter(msg => {
        if (activeTab === 'students') {
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

  const handleContactSelect = (contact) => {
    setSelectedContact(contact);
    fetchChatHistory(contact._id);
    setShowContactList(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedContact(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      await chatAPI.sendMessage({
        receiverId: selectedContact._id,
        message: newMessage,
        chatType: activeTab === 'students' ? 'teacher-student' : 'teacher-parent'
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleBackToList = () => {
    setShowContactList(true);
    setSelectedContact(null);
  };

  const contactList = activeTab === 'students' ? students : parents;
  const filteredContacts = contactList.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const uniqueClasses = [...new Set(classes.map(c => c.className))].filter(Boolean);
  const uniqueSections = selectedClass 
    ? classes.filter(c => c.className === selectedClass).map(c => c.section).filter(Boolean)
    : [...new Set(classes.map(c => c.section))].filter(Boolean);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <Navbar />
        <div className="flex-1 flex overflow-hidden">
          {/* Contacts List */}
          <div className={`${showContactList ? 'flex' : 'hidden'} lg:flex w-full lg:w-96 bg-white lg:border-r flex-col shadow-lg`}>
            <div className="p-4 lg:p-6 bg-white border-b">
              <h2 className="text-xl lg:text-2xl font-bold mb-3 lg:mb-4 text-gray-800">Messages</h2>
              
              {/* Tabs */}
              <div className="flex space-x-2 mb-3 lg:mb-4">
                <button
                  onClick={() => handleTabChange('students')}
                  className={`flex-1 py-2 px-3 lg:px-4 text-sm lg:text-base rounded-lg font-medium transition ${
                    activeTab === 'students'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Students
                </button>
                <button
                  onClick={() => handleTabChange('parents')}
                  className={`flex-1 py-2 px-3 lg:px-4 text-sm lg:text-base rounded-lg font-medium transition ${
                    activeTab === 'parents'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Parents
                </button>
              </div>

              {/* Filters for Students */}
              {activeTab === 'students' && (
                <div className="mb-3 lg:mb-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 lg:px-4 py-2 rounded-lg transition text-sm lg:text-base"
                  >
                    <span className="flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </span>
                    {(selectedClass || selectedSection) && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        {selectedClass} {selectedSection}
                      </span>
                    )}
                  </button>
                  
                  {showFilters && (
                    <div className="mt-2 space-y-2">
                      <select
                        value={selectedClass}
                        onChange={(e) => {
                          setSelectedClass(e.target.value);
                          setSelectedSection('');
                        }}
                        className="w-full px-3 py-2 text-sm lg:text-base rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Classes</option>
                        {uniqueClasses.map((className) => (
                          <option key={className} value={className}>{className}</option>
                        ))}
                      </select>
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="w-full px-3 py-2 text-sm lg:text-base rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Sections</option>
                        {uniqueSections.map((section) => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </select>
                      {(selectedClass || selectedSection) && (
                        <button
                          onClick={() => {
                            setSelectedClass('');
                            setSelectedSection('');
                          }}
                          className="w-full flex items-center justify-center bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear Filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 lg:h-5 w-4 lg:w-5" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 lg:pl-10 pr-4 py-2 lg:py-3 text-sm lg:text-base rounded-lg text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 lg:p-6 text-center text-gray-500">Loading...</div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-4 lg:p-6 text-center text-gray-500">
                  {activeTab === 'students' 
                    ? 'No students found'
                    : 'No parents found'}
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    onClick={() => handleContactSelect(contact)}
                    className={`p-3 lg:p-4 border-b cursor-pointer transition hover:bg-blue-50 ${
                      selectedContact?._id === contact._id ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base lg:text-lg shadow-lg">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        {contact.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="ml-3 lg:ml-4 flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-base lg:text-lg truncate">{contact.name}</div>
                        <div className="text-xs lg:text-sm text-gray-600">
                          {activeTab === 'students' 
                            ? `${contact.class} ${contact.section} - Roll: ${contact.rollNumber}`
                            : (
                              <div>
                                <div className="font-medium text-blue-600">
                                  {contact.fatherName && `Father: ${contact.fatherName}`}
                                  {contact.fatherName && contact.motherName && ' • '}
                                  {contact.motherName && `Mother: ${contact.motherName}`}
                                </div>
                                <div className="text-xs">{contact.class} {contact.section}</div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${!showContactList ? 'flex' : 'hidden'} lg:flex flex-1 bg-white flex-col`}>
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b p-3 lg:p-4 flex items-center shadow-sm">
                  <button
                    onClick={handleBackToList}
                    className="lg:hidden mr-3 p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-700" />
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base lg:text-lg">
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </div>
                    {selectedContact.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="ml-3 lg:ml-4 flex-1 min-w-0">
                    <div className="font-semibold text-base lg:text-lg truncate text-gray-800">{selectedContact.name}</div>
                    <div className="text-xs lg:text-sm text-gray-600 truncate">
                      {activeTab === 'students' 
                        ? `${selectedContact.class} ${selectedContact.section}`
                        : `Parent - ${selectedContact.class} ${selectedContact.section}`}
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 lg:p-6 space-y-3 lg:space-y-4 bg-gray-50">
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
                              ? 'bg-blue-600 text-white rounded-br-none'
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
                <form onSubmit={handleSendMessage} className="p-3 lg:p-4 bg-white border-t">
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
                      className="px-4 lg:px-6 py-2 lg:py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
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
                  <p className="text-base lg:text-xl font-medium text-gray-500">Select a contact to start chatting</p>
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

export default StaffChatWithStudents;
