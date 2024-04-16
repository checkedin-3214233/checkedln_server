import express from "express";
import { checkUser, signup, login } from '../controller/userController.js';

const router = express.Router();
router.post('/checkUser', checkUser);
router.post('/register', signup);
router.post('/login', login);
export default router;