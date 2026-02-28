const User = require("../models/User");
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG, and PDF files are allowed'));
    }
  }
});

exports.createUser = async (req, res) => {
  try {
    const userData = { ...req.body };
    
    // Auto-generate staff ID
    if (userData.role === "staff" && !userData.staffId) {
      const year = new Date().getFullYear();
      const count = (await User.countDocuments({ role: "staff" })) + 1;
      userData.staffId = `ST-${year}-${String(count).padStart(3, "0")}`;
    }
    
    // Auto-generate student ID
    if (userData.role === "student" && !userData.studentId) {
      const year = new Date().getFullYear();
      const count = (await User.countDocuments({ role: "student" })) + 1;
      userData.studentId = `STU-${year}-${String(count).padStart(4, "0")}`;
    }
    
    const user = await User.create(userData);

    if (user.role === "student") {
      req.io.emit("studentUpdate", {
        studentId: user._id,
        updatedData: user,
      });
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .populate("subjects");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("subjects");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // Check if user is updating their own profile or is admin
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const updateData = { ...req.body };
    delete updateData.password;
    delete updateData.role; // Prevent role changes
    
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      updateData,
      { new: true, runValidators: false }
    ).select("-password");
    
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "student") {
      req.io.emit("studentUpdate", {
        studentId: user._id,
        updatedData: user,
      });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Emit real-time update for student deletion
    if (user.role === "student") {
      req.io.emit("studentUpdate", {
        studentId: user._id,
        deleted: true,
      });
    }

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// New endpoint for creating staff with documents
exports.createStaffWithDocs = async (req, res) => {
  try {
    const userData = JSON.parse(req.body.userData || '{}');
    userData.role = 'staff';
    
    if (!userData.staffId) {
      const year = new Date().getFullYear();
      const count = (await User.countDocuments({ role: "staff" })) + 1;
      userData.staffId = `ST-${year}-${String(count).padStart(3, "0")}`;
    }

    // Process passport photo
    if (req.files && req.files.passportPhoto) {
      const photoFile = req.files.passportPhoto[0];
      if (photoFile.size > 2 * 1024 * 1024) {
        return res.status(400).json({ message: 'Passport photo must be less than 2MB' });
      }
      userData.passportPhoto = {
        data: photoFile.buffer.toString('base64'),
        contentType: photoFile.mimetype,
        filename: photoFile.originalname,
        uploadDate: new Date()
      };
    }

    // Process documents
    userData.documents = [];
    if (req.files && req.files.documents) {
      const docTypes = req.body.docTypes ? JSON.parse(req.body.docTypes) : {};
      
      for (let i = 0; i < req.files.documents.length; i++) {
        const file = req.files.documents[i];
        if (file.mimetype === 'application/pdf' && file.size > 5 * 1024 * 1024) {
          return res.status(400).json({ message: 'PDF files must be less than 5MB' });
        }
        if (file.mimetype.startsWith('image/') && file.size > 2 * 1024 * 1024) {
          return res.status(400).json({ message: 'Image files must be less than 2MB' });
        }
        
        userData.documents.push({
          type: docTypes[i] || 'other',
          name: file.originalname,
          filename: file.originalname,
          data: file.buffer.toString('base64'),
          contentType: file.mimetype,
          size: file.size,
          uploadDate: new Date()
        });
      }
    }

    const user = await User.create(userData);
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({
      user: userResponse,
      message: 'Staff created successfully with documents'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Export multer upload middleware
exports.uploadMiddleware = upload.fields([
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'documents', maxCount: 10 }
]);
