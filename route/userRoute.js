import express from 'express';
import { getUser, updateUser, getSearchedUser } from '../controller/userController.js';

const router = express.Router();
router.get('/', getUser);
router.post('/updateUser', updateUser);
router.post('/getSearchedUser', getSearchedUser);

export default router;