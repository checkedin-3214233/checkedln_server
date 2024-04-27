import express from "express";
import { createEvent, getPastEvents, getUpcomingEvents } from '../controller/eventController.js';

const router = express.Router();
router.post('/', createEvent).get('/past', getPastEvents).get('/upcoming', getUpcomingEvents);
export default router;