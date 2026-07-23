import twilio from 'twilio';
import { config } from '../config/env.js';
import logger from './logger.js';

let twilioClient = null;

export const initTwilio = () => {
  if (!config.twilio.accountSid || !config.twilio.authToken) {
    logger.warn('Twilio credentials not configured. SMS/WhatsApp notifications disabled.');
    return;
  }

  twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
};

export const sendSMS = async ({ to, body }) => {
  if (!twilioClient) {
    logger.warn('Twilio client not initialized. Skipping SMS send.');
    return;
  }

  try {
    const message = await twilioClient.messages.create({
      body,
      from: config.twilio.whatsappNumber,
      to,
    });
    logger.info(`SMS sent: ${message.sid}`);
    return message;
  } catch (error) {
    logger.error('SMS send error:', error);
    throw error;
  }
};

export const sendWhatsApp = async ({ to, body }) => {
  if (!twilioClient) {
    logger.warn('Twilio client not initialized. Skipping WhatsApp send.');
    return;
  }

  try {
    const message = await twilioClient.messages.create({
      body,
      from: `whatsapp:${config.twilio.whatsappNumber}`,
      to: `whatsapp:${to}`,
    });
    logger.info(`WhatsApp sent: ${message.sid}`);
    return message;
  } catch (error) {
    logger.error('WhatsApp send error:', error);
    throw error;
  }
};
