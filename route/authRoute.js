import express from "express";
import { checkUser, signup, login, refreshToken } from '../controller/userController.js';

const router = express.Router();
router.post('/checkUser', checkUser);
router.post('/register', signup);
router.post('/login', login);
router.post("/refresh-token", refreshToken);

export default router;