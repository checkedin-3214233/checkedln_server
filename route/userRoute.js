import express from 'express';
import { getUser, updateUser } from '../controller/userController.js';

const router = express.Router();
router.get('/', getUser);
router.post('/updateUser', updateUser);

export default router;