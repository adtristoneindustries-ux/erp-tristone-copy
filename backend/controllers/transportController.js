const { TransportRoute, StudentTransport, BusLocation } = require('../models/Transport');

// Get student's transport details
exports.getStudentTransport = async (req, res) => {
  try {
    const studentTransport = await StudentTransport.findOne({ student: req.user.id })
      .populate('route');
    
    if (!studentTransport) {
      return res.status(404).json({ success: false, message: 'No transport assigned' });
    }

    res.json({ success: true, data: studentTransport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all routes (for admin)
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await TransportRoute.find({ active: true });
    res.json({ success: true, data: routes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Track bus location
exports.trackBusLocation = async (req, res) => {
  try {
    const studentTransport = await StudentTransport.findOne({ student: req.user.id });
    if (!studentTransport) {
      return res.status(404).json({ success: false, message: 'No transport assigned' });
    }

    const location = await BusLocation.findOne({ route: studentTransport.route })
      .sort({ lastUpdated: -1 });

    res.json({ 
      success: true, 
      data: location || { status: 'not-available', message: 'Location tracking not available' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign transport to student (Admin)
exports.assignTransport = async (req, res) => {
  try {
    const { studentId, routeId, pickupPoint } = req.body;
    
    let studentTransport = await StudentTransport.findOne({ student: studentId });
    if (studentTransport) {
      studentTransport.route = routeId;
      studentTransport.pickupPoint = pickupPoint;
      await studentTransport.save();
    } else {
      studentTransport = await StudentTransport.create({
        student: studentId,
        route: routeId,
        pickupPoint
      });
    }

    res.json({ success: true, data: studentTransport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create route (Admin)
exports.createRoute = async (req, res) => {
  try {
    const route = await TransportRoute.create(req.body);
    res.json({ success: true, data: route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update route (Admin)
exports.updateRoute = async (req, res) => {
  try {
    const route = await TransportRoute.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
