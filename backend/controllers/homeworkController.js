const Homework = require('../models/Homework');
const HomeworkSubmission = require('../models/HomeworkSubmission');
const User = require('../models/User');

// Create homework (Staff only)
exports.createHomework = async (req, res) => {
  try {
    const { subject, class: classId, topic, description, dueDate } = req.body;
    
    const homework = await Homework.create({
      subject,
      class: classId,
      teacher: req.user.id,
      topic,
      description,
      dueDate
    });

    const populatedHomework = await Homework.findById(homework._id)
      .populate('subject', 'name')
      .populate('class', 'name section')
      .populate('teacher', 'name');

    req.io.emit('homeworkCreated', populatedHomework);
    
    res.status(201).json(populatedHomework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all homework
exports.getAllHomework = async (req, res) => {
  try {
    const { classId, studentId } = req.query;
    console.log('\n=== getAllHomework ===');
    console.log('Params:', { classId, studentId });
    
    let query = {};
    if (classId) query.class = classId;

    const homework = await Homework.find(query)
      .populate('subject', 'name')
      .populate('class', 'className section classCode')
      .populate('teacher', 'name')
      .sort({ dueDate: -1 });

    console.log('Total homework:', homework.length);

    if (studentId) {
      const student = await User.findById(studentId);
      if (!student) return res.json([]);
      
      console.log('Student:', student.name, '| Class:', student.class, '| Section:', student.section);

      const result = [];
      for (const hw of homework) {
        if (!hw.class) continue;
        
        const match = hw.class.className == student.class && hw.class.section == student.section;
        console.log(`${match ? '✓' : '✗'} "${hw.topic}" | ${hw.class.className}-${hw.class.section} vs ${student.class}-${student.section}`);
        
        if (match) {
          const submission = await HomeworkSubmission.findOne({ homework: hw._id, student: studentId });
          result.push({
            ...hw.toObject(),
            status: submission ? 'completed' : 'pending',
            submission: submission || null
          });
        }
      }

      console.log('Returning:', result.length, 'homework\n');
      return res.json(result);
    }

    res.json(homework);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get homework by ID
exports.getHomeworkById = async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id)
      .populate('subject', 'name')
      .populate('class', 'name section')
      .populate('teacher', 'name');

    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Submit homework (Student only)
exports.submitHomework = async (req, res) => {
  try {
    const { homeworkId } = req.params;
    const { fileUrl, fileName } = req.body;

    const homework = await Homework.findById(homeworkId);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    const existingSubmission = await HomeworkSubmission.findOne({
      homework: homeworkId,
      student: req.user.id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Homework already submitted' });
    }

    const status = new Date() > homework.dueDate ? 'late' : 'completed';

    const submission = await HomeworkSubmission.create({
      homework: homeworkId,
      student: req.user.id,
      fileUrl,
      fileName,
      status
    });

    req.io.emit('homeworkSubmitted', { homeworkId, studentId: req.user.id });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get homework submissions (Staff only)
exports.getHomeworkSubmissions = async (req, res) => {
  try {
    const { homeworkId, classId } = req.query;

    if (homeworkId) {
      const homework = await Homework.findById(homeworkId).populate('class');
      if (!homework) {
        return res.status(404).json({ message: 'Homework not found' });
      }

      const students = await User.find({ 
        role: 'student',
        class: homework.class.className,
        section: homework.class.section
      }).select('name rollNumber email');

      const submissions = await HomeworkSubmission.find({ homework: homeworkId })
        .populate('student', 'name rollNumber email');

      const submissionMap = {};
      submissions.forEach(sub => {
        submissionMap[sub.student._id.toString()] = sub;
      });

      const result = students.map(student => ({
        student: {
          _id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email
        },
        submission: submissionMap[student._id.toString()] || null,
        status: submissionMap[student._id.toString()] ? 'completed' : 'pending'
      }));

      return res.json(result);
    }

    if (classId) {
      const homeworks = await Homework.find({ class: classId })
        .populate('subject', 'name')
        .populate('class', 'className section')
        .sort({ dueDate: -1 });

      const Class = require('../models/Class');
      const classDoc = await Class.findById(classId);
      
      const students = await User.find({ 
        role: 'student',
        class: classDoc?.className,
        section: classDoc?.section
      }).select('name rollNumber');

      const homeworkWithStats = await Promise.all(
        homeworks.map(async (hw) => {
          const submissions = await HomeworkSubmission.countDocuments({ 
            homework: hw._id 
          });
          
          return {
            ...hw.toObject(),
            totalStudents: students.length,
            completed: submissions,
            pending: students.length - submissions
          };
        })
      );

      return res.json(homeworkWithStats);
    }

    res.status(400).json({ message: 'Please provide homeworkId or classId' });
  } catch (error) {
    console.error('Error in getHomeworkSubmissions:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update homework
exports.updateHomework = async (req, res) => {
  try {
    const { subject, class: classId, topic, description, dueDate } = req.body;
    
    const homework = await Homework.findByIdAndUpdate(
      req.params.id,
      { subject, class: classId, topic, description, dueDate },
      { new: true }
    )
      .populate('subject', 'name')
      .populate('class', 'className section')
      .populate('teacher', 'name');

    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    req.io.emit('homeworkUpdated', homework);
    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete homework
exports.deleteHomework = async (req, res) => {
  try {
    const homework = await Homework.findById(req.params.id);
    if (!homework) {
      return res.status(404).json({ message: 'Homework not found' });
    }

    await HomeworkSubmission.deleteMany({ homework: req.params.id });
    await Homework.findByIdAndDelete(req.params.id);

    res.json({ message: 'Homework deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
