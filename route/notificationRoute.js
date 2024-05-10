import express from "express";
import { notificationController, getAllNotifications } from "../controller/notificationController.js";
const router = express.Router();
router.get('/', notificationController).get('/all', getAllNotifications);

export default router;