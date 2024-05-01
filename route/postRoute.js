import express from "express";
import { createPost, getMyPosts, likePost } from '../controller/postController.js';
const router = express.Router();
router.post('/', createPost).get('/', getMyPosts)
router.get('/likePost/:postUserId/:postId', likePost);

export default router;