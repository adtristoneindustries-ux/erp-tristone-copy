const StemProject = require('../models/StemProject');

// GET all projects
exports.getProjects = async (req, res) => {
  try {
    const { category, status, difficulty, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const projects = await StemProject.find(filter)
      .populate('mentor', 'name email')
      .populate('enrolledStudents', 'name rollNumber')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single project
exports.getProject = async (req, res) => {
  try {
    const project = await StemProject.findById(req.params.id)
      .populate('mentor', 'name email')
      .populate('enrolledStudents', 'name rollNumber class section')
      .populate('submissions.student', 'name rollNumber')
      .populate('submissions.gradedBy', 'name');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE project (admin/staff)
exports.createProject = async (req, res) => {
  try {
    const project = new StemProject({ ...req.body, mentor: req.body.mentor || req.user._id });
    await project.save();
    const populated = await project.populate('mentor', 'name email');
    req.io?.emit('stemProjectCreated', populated);
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE project (admin/staff)
exports.updateProject = async (req, res) => {
  try {
    const project = await StemProject.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('mentor', 'name email')
      .populate('enrolledStudents', 'name rollNumber');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    req.io?.emit('stemProjectUpdated', project);
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE project (admin)
exports.deleteProject = async (req, res) => {
  try {
    await StemProject.findByIdAndDelete(req.params.id);
    req.io?.emit('stemProjectDeleted', { id: req.params.id });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ENROLL student
exports.enrollStudent = async (req, res) => {
  try {
    const project = await StemProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.enrolledStudents.includes(req.user._id))
      return res.status(400).json({ message: 'Already enrolled' });
    if (project.enrolledStudents.length >= project.maxStudents)
      return res.status(400).json({ message: 'Project is full' });
    project.enrolledStudents.push(req.user._id);
    if (project.status === 'active') project.status = 'active';
    await project.save();
    req.io?.emit('stemEnrollment', { projectId: project._id, studentId: req.user._id });
    res.json({ message: 'Enrolled successfully', project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UNENROLL student
exports.unenrollStudent = async (req, res) => {
  try {
    const project = await StemProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.enrolledStudents = project.enrolledStudents.filter(
      s => s.toString() !== req.user._id.toString()
    );
    await project.save();
    res.json({ message: 'Unenrolled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SUBMIT project work (student)
exports.submitWork = async (req, res) => {
  try {
    const project = await StemProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const existing = project.submissions.find(s => s.student.toString() === req.user._id.toString());
    if (existing) {
      existing.description = req.body.content || req.body.description || existing.description;
      existing.submittedAt = new Date();
    } else {
      project.submissions.push({ 
        student: req.user._id, 
        description: req.body.content || req.body.description,
        fileUrl: req.body.fileUrl 
      });
    }
    await project.save();
    req.io?.emit('stemSubmission', { projectId: project._id, studentId: req.user._id });
    res.json({ message: 'Submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GRADE submission (staff/admin)
exports.gradeSubmission = async (req, res) => {
  try {
    const project = await StemProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    // Find submission by student ID or submission ID
    let submission = project.submissions.find(s => s._id.toString() === req.params.submissionId);
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    
    submission.grade = req.body.grade;
    submission.feedback = req.body.feedback;
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;
    
    await project.save();
    
    // Populate and return updated project
    const updatedProject = await StemProject.findById(req.params.id)
      .populate('enrolledStudents', 'name email rollNumber class section')
      .populate('submissions.student', 'name rollNumber')
      .populate('submissions.gradedBy', 'name');
    
    req.io?.emit('stemGraded', { projectId: project._id, studentId: submission.student, grade: req.body.grade });
    res.json({ message: 'Graded successfully', project: updatedProject });
  } catch (err) {
    console.error('Grade submission error:', err);
    res.status(500).json({ message: err.message });
  }
};

// UPDATE milestone
exports.updateMilestone = async (req, res) => {
  try {
    const project = await StemProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const milestone = project.milestones.find(m => m._id.toString() === req.params.milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
    
    milestone.completed = req.body.completed;
    if (req.body.completed) {
      milestone.completedAt = new Date();
    } else {
      milestone.completedAt = null;
    }
    
    await project.save();
    
    const updatedProject = await StemProject.findById(req.params.id)
      .populate('enrolledStudents', 'name email rollNumber class section')
      .populate('submissions.student', 'name rollNumber');
    
    req.io?.emit('stemMilestone', { projectId: project._id });
    res.json({ message: 'Milestone updated', project: updatedProject });
  } catch (err) {
    console.error('Update milestone error:', err);
    res.status(500).json({ message: err.message });
  }
};

// GET stats
exports.getStats = async (req, res) => {
  try {
    const total = await StemProject.countDocuments();
    const active = await StemProject.countDocuments({ status: 'active' });
    const completed = await StemProject.countDocuments({ status: 'completed' });
    const totalEnrollments = await StemProject.aggregate([
      { $project: { count: { $size: '$enrolledStudents' } } },
      { $group: { _id: null, total: { $sum: '$count' } } }
    ]);
    res.json({
      total,
      active,
      completed,
      students: totalEnrollments[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET my projects (student)
exports.getMyProjects = async (req, res) => {
  try {
    const projects = await StemProject.find({ enrolledStudents: req.user._id })
      .populate('mentor', 'name email')
      .populate('enrolledStudents', 'name email rollNumber class section')
      .sort({ createdAt: -1 });
    
    // Filter submissions to show only current user's submissions
    const projectsWithMySubmissions = projects.map(project => {
      const projectObj = project.toObject();
      projectObj.submissions = projectObj.submissions.filter(
        sub => sub.student.toString() === req.user._id.toString()
      );
      return projectObj;
    });
    
    res.json(projectsWithMySubmissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET mentor projects (staff)
exports.getMentorProjects = async (req, res) => {
  try {
    const projects = await StemProject.find({ mentor: req.user._id })
      .populate('enrolledStudents', 'name email rollNumber class section')
      .populate('submissions.student', 'name email rollNumber')
      .populate('submissions.gradedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
