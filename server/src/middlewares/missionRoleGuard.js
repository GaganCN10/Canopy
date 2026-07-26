import MissionMembership from '../models/MissionMembership.js';

export const missionRoleGuard = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      if (req.user.role === 'admin') {
        return next();
      }

      const missionId = req.params.id;
      if (!missionId) {
        return res.status(400).json({
          success: false,
          message: 'Mission ID is required',
        });
      }

      const membership = await MissionMembership.findOne({
        mission: missionId,
        user: req.user._id,
        status: 'approved',
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'You are not a member of this mission',
        });
      }

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action on this mission',
        });
      }

      req.membership = membership;
      next();
    } catch (error) {
      console.error('Mission role guard error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  };
};

export const isMissionMember = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const missionId = req.params.id;
    if (!missionId) {
      return res.status(400).json({
        success: false,
        message: 'Mission ID is required',
      });
    }

    const membership = await MissionMembership.findOne({
      mission: missionId,
      user: req.user._id,
      status: 'approved',
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this mission',
      });
    }

    req.membership = membership;
    next();
  } catch (error) {
    console.error('Is mission member middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
