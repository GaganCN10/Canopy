import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import logger from './logger.js';

let transporter = null;

export const initEmail = () => {
  if (!config.email.host || !config.email.user || !config.email.pass) {
    logger.warn('Email credentials not configured. Email notifications disabled.');
    return;
  }

  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    logger.warn('Email transporter not initialized. Skipping email send.');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      text,
      html,
    });
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email send error:', error);
    throw error;
  }
};

export const getTransporter = () => transporter;
