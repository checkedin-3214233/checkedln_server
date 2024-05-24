import express from 'express';
import { getUser, updateUser, getSearchedUser, getUserById } from '../controller/userController.js';
import { acceptCatchUpRequest, rejectCatchUpRequest, catchUpUser } from '../controller/catchupController.js';
const router = express.Router();
router.get('/', getUser);
router.post('/updateUser', updateUser);
router.post('/getSearchedUser', getSearchedUser);
router.get("/getUserById/:otherUserId", getUserById);
router.get("/catchUpUser/:catchUpUserId", catchUpUser);
router.get("/acceptCatchUpRequest/:requestId", acceptCatchUpRequest);
router.get("/rejectCatchUpRequest/:requestId", rejectCatchUpRequest);
export default router;