const mongoose = require('mongoose');
const User = require('./models/User');
const Homework = require('./models/Homework');
const HomeworkSubmission = require('./models/HomeworkSubmission');

mongoose.connect('mongodb://localhost:27017/school_erp').then(async () => {
  const studentId = '699c2c9fb2ec1e8cbb983160';
  
  const student = await User.findById(studentId);
  console.log('Student:', student.name, '| Class:', student.class, '| Section:', student.section);
  
  const homework = await Homework.find()
    .populate('subject', 'name')
    .populate('class', 'className section')
    .sort({ dueDate: -1 });
  
  console.log('\nTotal homework:', homework.length);
  
  const result = [];
  for (const hw of homework) {
    if (!hw.class) continue;
    
    const match = hw.class.className == student.class && hw.class.section == student.section;
    console.log(`${match ? '✓' : '✗'} "${hw.topic}" | ${hw.class.className}-${hw.class.section} vs ${student.class}-${student.section}`);
    
    if (match) {
      const submission = await HomeworkSubmission.findOne({ homework: hw._id, student: studentId });
      result.push({
        _id: hw._id,
        topic: hw.topic,
        subject: hw.subject,
        dueDate: hw.dueDate,
        status: submission ? 'completed' : 'pending'
      });
    }
  }
  
  console.log('\nFiltered homework:', result.length);
  console.log(JSON.stringify(result, null, 2));
  
  process.exit(0);
});
