import path from 'path';
import { fileURLToPath } from 'url';
import { sendSuccess, sendError } from '../utils/response.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'No file uploaded');
    }

    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    sendSuccess(res, 201, 'Image uploaded successfully', { url: fileUrl, filename: req.file.filename });
  } catch (error) {
    logger.error('Upload error:', error);
    sendError(res, 500, 'Image upload failed');
  }
};

export const serveUpload = (req, res) => {
  const filePath = path.join(__dirname, '../../uploads/', req.params.filename);
  res.sendFile(filePath);
};
