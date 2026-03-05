const Chat = require('../models/Chat');
const User = require('../models/User');

// Get chat history between two users
exports.getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Chat.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'name email role')
    .populate('receiver', 'name email role')
    .sort({ createdAt: 1 });

    // Mark messages as read
    await Chat.updateMany(
      { sender: userId, receiver: currentUserId, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message, chatType } = req.body;
    const senderId = req.user.id;

    const newMessage = new Chat({
      sender: senderId,
      receiver: receiverId,
      message,
      chatType
    });

    await newMessage.save();
    await newMessage.populate('sender', 'name email role');
    await newMessage.populate('receiver', 'name email role');

    // Emit socket event
    const io = req.app.get('io');
    io.emit('newMessage', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all teachers for student
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'staff' })
      .select('name email subjects class section isOnline')
      .sort({ name: 1 });
    
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get students by class and section for staff (with parent info)
exports.getStudentsByClass = async (req, res) => {
  try {
    const { class: className, section } = req.query;
    
    const query = { role: 'student' };
    if (className && className !== '') query.class = className;
    if (section && section !== '') query.section = section;

    const students = await User.find(query)
      .select('name email class section rollNumber isOnline fatherName fatherPhone fatherEmail motherName motherPhone motherEmail')
      .sort({ class: 1, section: 1, rollNumber: 1 });
    
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get parents for staff (grouped by students)
exports.getParents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name class section rollNumber fatherName fatherPhone fatherEmail motherName motherPhone motherEmail isOnline')
      .sort({ class: 1, section: 1, rollNumber: 1 });
    
    // Create parent contacts with student info
    const parentContacts = students.map(student => ({
      _id: student._id,
      studentId: student._id,
      studentName: student.name,
      name: student.name,
      fatherName: student.fatherName,
      motherName: student.motherName,
      phone: student.fatherPhone || student.motherPhone,
      email: student.fatherEmail || student.motherEmail,
      class: student.class,
      section: student.section,
      rollNumber: student.rollNumber,
      isOnline: student.isOnline
    }));
    
    res.json(parentContacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Chat.countDocuments({
      receiver: userId,
      isRead: false
    });
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recent chats
exports.getRecentChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const recentChats = await Chat.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: { newRoot: '$lastMessage' }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'receiver',
          foreignField: '_id',
          as: 'receiver'
        }
      },
      {
        $unwind: '$sender'
      },
      {
        $unwind: '$receiver'
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.json(recentChats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
