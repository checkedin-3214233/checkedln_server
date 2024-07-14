import express from "express";
import { checkUser, signup, login, refreshToken, sendOtp, verifyOtp } from '../controller/userController.js';

const router = express.Router();
router.post('/checkUser', checkUser);
router.post('/register', signup);
router.post('/login', login);
router.post('/sendOtp', sendOtp);
router.post('/verifyOtp', verifyOtp);
router.post("/refresh-token", refreshToken);

export default router;