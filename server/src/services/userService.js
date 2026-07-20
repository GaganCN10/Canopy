import User from '../models/User.js';
import logger from '../utils/logger.js';

export const updateProfile = async (userId, updateData) => {
  const allowedFields = ['firstName', 'lastName', 'phone', 'organization'];
  const update = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      update[field] = updateData[field];
    }
  }

  const user = await User.findByIdAndUpdate(userId, update, { new: true, runValidators: true });
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const getAllUsers = async ({ page = 1, limit = 20, search = '' } = {}) => {
  const query = search ? { email: { $regex: search, $options: 'i' } } : {};
  const users = await User.find(query)
    .select('-password')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  return { users, total, page, limit };
};

export const updateUserRole = async (userId, role) => {
  const validRoles = ['public', 'citizen', 'ranger', 'researcher', 'rescue', 'admin'];
  if (!validRoles.includes(role)) {
    throw new Error('Invalid role');
  }

  const user = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true }).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const toggleBanUser = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }

  const updatedUser = await User.findByIdAndUpdate(userId, { isBanned: !user.isBanned }, { new: true }).select('-password');
  return updatedUser;
};
