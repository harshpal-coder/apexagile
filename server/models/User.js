const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Member'],
    default: 'Member'
  },
  avatar: {
    type: String,
    default: ''
  },
  workspaces: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
