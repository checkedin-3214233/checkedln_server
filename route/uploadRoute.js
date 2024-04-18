import express from "express";
import multer from 'multer';
import { uploadImage } from '../controller/uploadController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), uploadImage);

export default router;
