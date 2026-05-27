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
  }],
  subscription: {
    plan: {
      type: String,
      enum: ['Free', 'Pro', 'Enterprise'],
      default: 'Free'
    },
    status: {
      type: String,
      default: 'Active'
    },
    currentPeriodEnd: {
      type: Date,
      default: null
    },
    paymentCard: {
      type: String,
      default: null
    },
    customerName: {
      type: String,
      default: null
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
