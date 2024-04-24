import express from "express";
import { sendMessages, getMessages, getChatList } from "../controller/messageController.js"
const router = express.Router();
router.post('/send/:userId', sendMessages);
router.get('/:userId', getMessages);
router.get('/', getChatList);

export default router;