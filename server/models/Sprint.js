const mongoose = require('mongoose');

const SprintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  goal: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Planned', 'Active', 'Completed'],
    default: 'Planned'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sprint', SprintSchema);
