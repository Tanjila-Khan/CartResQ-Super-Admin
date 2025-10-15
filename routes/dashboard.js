const express = require('express');
const User = require('../models/User');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Get dashboard overview
router.get('/overview', authenticate, requireSuperAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      subscribedUsers,
      freeUsers,
      starterUsers,
      professionalUsers,
      enterpriseUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ 
        subscriptionStatus: { $in: ['active', 'trialing'] },
        subscriptionPlan: { $ne: null }
      }),
      User.countDocuments({ subscriptionPlan: 'free' }),
      User.countDocuments({ subscriptionPlan: 'starter' }),
      User.countDocuments({ subscriptionPlan: 'professional' }),
      User.countDocuments({ subscriptionPlan: 'enterprise' })
    ]);

    // Get recent users
    const recentUsers = await User.find()
      .select('name email role subscriptionPlan subscriptionStatus createdAt lastLogin')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get users by subscription status
    const subscriptionBreakdown = await User.aggregate([
      { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } }
    ]);

    // Get users by role
    const roleBreakdown = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    res.json({
      overview: {
        totalUsers,
        activeUsers,
        subscribedUsers,
        inactiveUsers: totalUsers - activeUsers
      },
      subscriptions: {
        free: freeUsers,
        starter: starterUsers,
        professional: professionalUsers,
        enterprise: enterpriseUsers,
        breakdown: subscriptionBreakdown
      },
      roles: roleBreakdown,
      recentUsers
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;
