import Notification from '../models/Notification.js';
import { sendEmail } from '../utils/email.js';
import { sendSMS, sendWhatsApp } from '../utils/notifications.js';
import logger from '../utils/logger.js';

export const createNotification = async ({
  recipient,
  type,
  title,
  message,
  data = null,
  channels = { inApp: true, email: false, sms: false, whatsapp: false },
}) => {
  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    data,
    channels,
  });

  if (channels.email && data?.recipientEmail) {
    try {
      await sendEmail({
        to: data.recipientEmail,
        subject: title,
        html: `<p>${message}</p>`,
        text: message,
      });
    } catch (err) {
      logger.error('Failed to send email notification:', err);
    }
  }

  if (channels.sms && data?.recipientPhone) {
    try {
      await sendSMS({ to: data.recipientPhone, body: message });
    } catch (err) {
      logger.error('Failed to send SMS notification:', err);
    }
  }

  if (channels.whatsapp && data?.recipientPhone) {
    try {
      await sendWhatsApp({ to: data.recipientPhone, body: message });
    } catch (err) {
      logger.error('Failed to send WhatsApp notification:', err);
    }
  }

  return notification;
};

export const getNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const query = { recipient: userId };
  if (unreadOnly) query.readAt = { $exists: false };

  const notifications = await Notification.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({ recipient: userId, readAt: { $exists: false } });

  return { notifications, total, page, limit, unreadCount };
};

export const markNotificationAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOne({ _id: notificationId, recipient: userId });
  if (!notification) {
    throw new Error('Notification not found');
  }
  notification.readAt = new Date();
  await notification.save();
  return notification;
};

export const markAllNotificationsAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, readAt: { $exists: false } },
    { $set: { readAt: new Date() } }
  );
  return result;
};
