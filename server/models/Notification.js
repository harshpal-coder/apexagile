const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Mention', 'Assign', 'StatusUpdate', 'SprintStart', 'Comment'],
    default: 'StatusUpdate'
  },
  read: {
    type: Boolean,
    default: false
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', NotificationSchema);
