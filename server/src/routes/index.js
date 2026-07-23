import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import speciesRoutes from './speciesRoutes.js';
import sightingRoutes from './sightingRoutes.js';
import tipRoutes from './tipRoutes.js';
import hwcRoutes from './hwcRoutes.js';
import rescueRoutes from './rescueRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import uploadRoutes from './uploadRoutes.js';

export default function mountRoutes(app) {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/species', speciesRoutes);
  app.use('/api/sightings', sightingRoutes);
  app.use('/api/tips', tipRoutes);
  app.use('/api/hwc', hwcRoutes);
  app.use('/api/rescue', rescueRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/upload', uploadRoutes);
}
