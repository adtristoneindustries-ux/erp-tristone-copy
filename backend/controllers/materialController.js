const Material = require('../models/Material');
const path = require('path');

exports.createMaterial = async (req, res) => {
  try {
    let materialData = {
      ...req.body,
      uploadedBy: req.user._id
    };
    
    // Handle file upload
    if (req.file) {
      materialData.fileUrl = `/uploads/${req.file.filename}`;
      materialData.fileName = req.file.originalname;
      materialData.fileSize = req.file.size;
      
      // Determine file type from mimetype
      const mimeType = req.file.mimetype;
      if (mimeType.startsWith('image/')) {
        materialData.fileType = 'Image';
      } else if (mimeType.startsWith('video/')) {
        materialData.fileType = 'Video';
      } else if (mimeType === 'application/pdf') {
        materialData.fileType = 'PDF';
      } else if (mimeType.includes('word') || mimeType.includes('document')) {
        materialData.fileType = 'Document';
      } else {
        materialData.fileType = 'File';
      }
    } else if (materialData.fileUrl) {
      // Handle URL links - determine type from URL
      const url = materialData.fileUrl.toLowerCase();
      if (url.includes('.pdf')) materialData.fileType = 'PDF';
      else if (url.match(/\.(jpg|jpeg|png|gif)$/)) materialData.fileType = 'Image';
      else if (url.match(/\.(mp4|avi|mov|wmv)$/)) materialData.fileType = 'Video';
      else if (url.match(/\.(doc|docx)$/)) materialData.fileType = 'Document';
      else materialData.fileType = 'Link';
    }
    
    const material = await Material.create(materialData);
    const populated = await material.populate(['subject', 'uploadedBy']);
    
    // Emit socket event for real-time updates
    if (req.io) {
      req.io.emit('materialUploaded', {
        material: populated,
        class: material.class
      });
    }
    
    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getMaterials = async (req, res) => {
  try {
    const { class: className, section, subject } = req.query;
    let query = {};
    
    if (className) query.class = className;
    if (section) {
      query.$or = [
        { section: section },
        { section: 'All Sections' }
      ];
    }
    if (subject) query.subject = subject;

    const materials = await Material.find(query).populate(['subject', 'uploadedBy']).sort('-createdAt');
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markMaterialAsViewed = async (req, res) => {
  try {
    const { studentClass, studentSection } = req.body;
    
    await Material.updateMany(
      {
        class: studentClass,
        $or: [
          { section: studentSection },
          { section: 'All Sections' }
        ]
      },
      { isNewMaterial: false }
    );
    
    res.json({ message: 'Materials marked as viewed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNewMaterialsCount = async (req, res) => {
  try {
    const { class: className, section } = req.query;
    
    const count = await Material.countDocuments({
      class: className,
      $or: [
        { section: section },
        { section: 'All Sections' }
      ],
      isNewMaterial: true
    });
    
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }
    
    // Emit socket event for real-time updates
    if (req.io) {
      req.io.emit('materialDeleted', {
        materialId: req.params.id
      });
    }
    
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ message: error.message });
  }
};
