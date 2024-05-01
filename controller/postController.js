import Post from '../models/postModel.js';

export const createPost = async (req, res) => {
    try {
        const userId = req.user._id;
        const { images, friends, location, description } = req.body;
        var userPost = await Post.findOne({ userId: userId });
        if (!userPost) {
            const post = await Post.create({
                userId,
                posts: [
                    {
                        images,
                        friends,
                        location,
                        description
                    }
                ]
            });
            await post.save();
            return res.status(200).json({
                "message": "Post Created Successfully", post: {
                    images,
                    friends,
                    location,
                    description
                }
            });
        }
        const newpost = userPost.posts.push({
            images,
            friends,
            location,
            description
        });
        await userPost.save();

        return res.status(200).json({
            "message": "Post Created Successfully", post: {
                images,
                friends,
                location,
                description,
            }
        });
    } catch (error) {
        return res.status(401).json({ "message": "Unable to Creat Post ", error: error.message });

    }
}

export const getMyPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const userPost = await Post.findOne({ userId: userId }).populate('posts.friends');
        if (!userPost) return res.status(404).json({ "message": "No Post Found" });
        return res.status(200).json({
            "message": "Post Fethced Successfully", post: userPost.posts
        });
    } catch (error) {
        return res.status(404).json({ "message": "Unable to Fetch Post ", error: error.message });

    }
}

export const likePost = async (req, res) => {
    const userId = req.user._id;
    let isLike = false;
    const { postUserId, postId } = req.params; // Destructure postUserId and postId from request params

    try {
        const post = await Post.findOne({ userId: postUserId, 'posts._id': postId });

        if (!post) {
            return res.status(404).json({ message: "Post Not Found" });
        }

        const filteredPost = post.posts.find(p => p._id.equals(postId));

        if (!filteredPost) {
            return res.status(404).json({ message: "Post Not Found" });
        }

        const userIndex = filteredPost.likes.indexOf(userId);
        if (userIndex !== -1) {
            // User has already liked the post, remove their like
            filteredPost.likes.splice(userIndex, 1); // Remove user's ID from likes array
        } else {
            // User has not liked the post, add their like
            isLike = true;
            filteredPost.likes.push(userId); // Add user's ID to likes array
        }

        // Save the updated post document
        await post.save();

        // Return the updated post with the modified likes
        return res.status(200).json({ message: `Post ${isLike == true ? "Liked" : "Unliked"} Successfully`, });

    } catch (error) {
        console.error("Error toggling like:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};