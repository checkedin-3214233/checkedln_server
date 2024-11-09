import express from 'express';
import { getUser, updateUser, getSearchedUser, getUserById, getSuggestedUsers, getMyBuddies, getBuddiesByUserId } from '../controller/userController.js';
import { acceptCatchUpRequest, rejectCatchUpRequest, catchUpUser, unfollowUser } from '../controller/catchupController.js';
const router = express.Router();
router.get('/', getUser);
router.post('/updateUser', updateUser);
router.post('/getSearchedUser', getSearchedUser);
router.get("/getUserById/:otherUserId", getUserById);
router.get("/catchUpUser/:catchUpUserId", catchUpUser);
router.get("/unfollowUser/:unfollowUserId", unfollowUser);
router.get("/acceptCatchUpRequest/:requestId", acceptCatchUpRequest);
router.get("/rejectCatchUpRequest/:requestId", rejectCatchUpRequest);
router.get("/getMyBuddies", getMyBuddies);
router.get("/getBuddiesById/:userId", getBuddiesByUserId)
router.post("/getSuggestedUsers", getSuggestedUsers);
export default router;