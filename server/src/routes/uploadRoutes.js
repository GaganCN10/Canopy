import express from 'express';
import upload from '../middlewares/upload.js';
import { uploadImage, serveUpload } from '../controllers/uploadController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.post('/species', authMiddleware, upload.single('image'), uploadImage);
router.get('/:filename', serveUpload);

export default router;
