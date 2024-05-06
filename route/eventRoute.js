import express from "express";
import { createEvent, getPastEvents, getUpcomingEvents, getNearByEvents, getEventById } from '../controller/eventController.js';

const router = express.Router();
router.post('/', createEvent).get('/past', getPastEvents).get('/upcoming', getUpcomingEvents).post('/nearby', getNearByEvents).get("/:eventId", getEventById);
export default router;