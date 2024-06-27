import express from "express";
import { createStory, getUserStory } from '../controller/stroyController.js';
const router = express.Router();
router.post('/', createStory);
router.get('/', getUserStory);
export default router;