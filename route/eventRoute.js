import express from "express";
import { createEvent, getPastEvents, getUpcomingEvents, getNearByEvents, getEventById, requestEvent, changeEventStatus, acceptRequest, getBuddiesEvents, popularEvents, getLiveEvents } from '../controller/eventController.js';
import { getShareEventLink, joinEvent, getShareEventId, joinEventByThemSelf } from '../controller/updateEventController.js';

const router = express.Router();

router.get('/friendsCheckin', getBuddiesEvents);
router.get('/past', getPastEvents);
router.get('/upcoming', getUpcomingEvents);
router.post('/liveEvents', getLiveEvents);
router.post('/nearby', getNearByEvents);
router.post('/popularEvents', popularEvents);
router.post('/', createEvent);
router.get('/request/:eventId/:status', requestEvent);
router.get('/shareEvent/:eventId', getShareEventLink);
router.get("/changeStatus/:eventId/:status", changeEventStatus);
router.get('/joinEvent/:shareEventId', joinEvent);
router.get('/joinEventByThemSelf/:eventId', joinEventByThemSelf);
router.get('/acceptEvent/:eventId/:otherUserId', acceptRequest);
router.get('/getShareEventId/:shareEventId', getShareEventId);
router.get('/:eventId', getEventById);  // Ensure this is correctly placed

export default router;
