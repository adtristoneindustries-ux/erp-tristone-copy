const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  hostelName: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  roomType: {
    type: String,
    enum: ['Single', 'Double Sharing', 'Triple Sharing', 'Four Sharing'],
    required: true
  },
  roommates: {
    type: Number,
    required: true
  },
  wardenName: {
    type: String,
    required: true
  },
  wardenContact: {
    type: String,
    required: true
  },
  wardenEmail: {
    type: String,
    required: true
  },
  officeHours: {
    type: String,
    required: true
  },
  laundrySchedule: [
    {
      day: String,
      time: String
    }
  ],
  notices: [
    {
      title: String,
      message: String,
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Hostel', hostelSchema);
