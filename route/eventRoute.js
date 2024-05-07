import express from "express";
import { createEvent, getPastEvents, getUpcomingEvents, getNearByEvents, getEventById, requestEvent } from '../controller/eventController.js';

const router = express.Router();
router.post('/', createEvent).get('/past', getPastEvents).get('/upcoming', getUpcomingEvents).post('/nearby', getNearByEvents).get("/:eventId", getEventById).get("/request/:eventId/:status", requestEvent);
export default router;