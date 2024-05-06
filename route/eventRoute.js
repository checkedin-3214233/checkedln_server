import express from "express";
import { createEvent, getPastEvents, getUpcomingEvents, getNearByEvents } from '../controller/eventController.js';

const router = express.Router();
router.post('/', createEvent).get('/past', getPastEvents).get('/upcoming', getUpcomingEvents).post('/nearby', getNearByEvents);
export default router;