import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import logger from './logger.js';

let transporter = null;
let etherealAccount = null;

export const initEmail = async () => {
  if (config.email.host && config.email.user && config.email.pass) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
    logger.info('Email transporter initialized with configured SMTP settings');
    return;
  }

  if (config.env !== 'production') {
    try {
      etherealAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: etherealAccount.user,
          pass: etherealAccount.pass,
        },
      });
      logger.info(`Email transporter initialized with Ethereal (test) account. View emails at: https://ethereal.email`);
      logger.info(`Ethereal account: ${etherealAccount.user} / ${etherealAccount.pass}`);
    } catch (error) {
      logger.error('Failed to create Ethereal test account:', error);
      logger.warn('Email transporter not initialized. Email notifications disabled.');
    }
    return;
  }

  logger.warn('Email credentials not configured. Email notifications disabled.');
};

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    logger.warn('Email transporter not initialized. Skipping email send.');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: config.email.from || etherealAccount?.user || 'no-reply@canopy.local',
      to,
      subject,
      text,
      html,
    });

    if (etherealAccount && config.env !== 'production') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info(`Email sent (Ethereal preview): ${previewUrl}`);
      }
    } else {
      logger.info(`Email sent: ${info.messageId}`);
    }

    return info;
  } catch (error) {
    logger.error('Email send error:', error);
    throw error;
  }
};

export const getTransporter = () => transporter;
