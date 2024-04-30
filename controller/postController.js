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
            return res.status(200).json({ "message": "Post Created Successfully", post: post.posts[0] });
        }
        const newpost = userPost.posts.push({
            images,
            friends,
            location,
            description
        });
        await userPost.save();

        return res.status(200).json({ "message": "Post Created Successfully", post: newpost });
    } catch (error) {
        return res.status(200).json({ "message": "Unable to Creat Post ", error: error.message });

    }
}