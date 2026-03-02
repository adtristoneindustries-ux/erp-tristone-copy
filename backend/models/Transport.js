const mongoose = require('mongoose');

const transportRouteSchema = new mongoose.Schema({
  routeNumber: { type: String, required: true, unique: true },
  busNumber: { type: String, required: true },
  driverName: { type: String, required: true },
  driverContact: { type: String, required: true },
  pickupPoint: { type: String, required: true },
  pickupTime: { type: String, required: true },
  dropTime: { type: String, required: true },
  routePath: { type: String, default: 'Main Street → School Road → EduPortal Campus' },
  stops: [{ name: String, time: String }],
  active: { type: Boolean, default: true }
});

const studentTransportSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportRoute', required: true },
  pickupPoint: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

const busLocationSchema = new mongoose.Schema({
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportRoute', required: true },
  latitude: Number,
  longitude: Number,
  lastUpdated: { type: Date, default: Date.now },
  status: { type: String, enum: ['on-route', 'stopped', 'completed'], default: 'on-route' }
});

const TransportRoute = mongoose.model('TransportRoute', transportRouteSchema);
const StudentTransport = mongoose.model('StudentTransport', studentTransportSchema);
const BusLocation = mongoose.model('BusLocation', busLocationSchema);

module.exports = { TransportRoute, StudentTransport, BusLocation };
