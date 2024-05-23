import express from "express";
import { createEvent, getPastEvents, getUpcomingEvents, getNearByEvents, getEventById, requestEvent } from '../controller/eventController.js';
import { getShareEventLink, joinEvent, getShareEventId } from '../controller/updateEventController.js';
const router = express.Router();
router.post('/', createEvent).get('/past', getPastEvents).get('/upcoming', getUpcomingEvents).post('/nearby', getNearByEvents).get("/:eventId", getEventById).get("/request/:eventId/:status", requestEvent);
router.get("/shareEvent/:eventId", getShareEventLink).get("/joinEvent/:shareEventId", joinEvent).get("/getShareEventId/:shareEventId", getShareEventId);

export default router;