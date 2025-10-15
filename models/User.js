const mongoose = require('mongoose');

// This uses the same User model as your main CartResQ app
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'user'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stores: [{
    storeId: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      enum: ['woocommerce', 'shopify', 'magento'],
      required: true
    },
    storeUrl: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    credentials: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    connectedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  stripeCustomerId: {
    type: String,
    default: null
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'starter', 'professional', 'enterprise', null],
    default: null
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'trialing', 'past_due', 'canceled', 'unpaid', null],
    default: null
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
