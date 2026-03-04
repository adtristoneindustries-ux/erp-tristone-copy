const mongoose = require('mongoose');

const applicationStatusHistorySchema = new mongoose.Schema({
  application_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  status: { type: String, required: true },
  changed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changed_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ApplicationStatusHistory', applicationStatusHistorySchema);
