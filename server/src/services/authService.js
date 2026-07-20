import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry },
  );
  const refreshToken = jwt.sign(
    { id: userId },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry },
  );
  return { accessToken, refreshToken };
};

export const register = async ({ email, password, firstName, lastName, role, phone, organization }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    role: role || 'public',
    phone,
    organization,
  });

  const tokens = generateTokens(user._id);

  await user.save();

  return {
    user,
    ...tokens,
  };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new Error('Invalid credentials');
  }

  if (user.isBanned) {
    throw new Error('Your account has been banned');
  }

  const tokens = generateTokens(user._id);

  return {
    user,
    ...tokens,
  };
};

export const refreshAccessToken = (refreshToken) => {
  try {
    const payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const accessToken = jwt.sign(
      { id: payload.id },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry },
    );
    return { accessToken };
  } catch (error) {
    logger.error('Refresh token error:', error);
    throw new Error('Invalid refresh token');
  }
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
