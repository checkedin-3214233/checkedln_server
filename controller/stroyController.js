import Stories from "../models/storyModel.js";
import User from "../models/userModels.js";
import UserStory from "../models/userStoryModel.js";

export const createStory = async (req, res) => {
    try {
        const { imageUrls } = req.body;
        const userId = req.user._id;
        if (!userId || !Array.isArray(imageUrls) || imageUrls.length === 0) {
            return res.status(400).json({ error: 'Invalid input' });
        }
        const userStories = await Promise.all(imageUrls.map(async (imageUrl) => {
            const userStory = new UserStory({ userId, imageUrl });
            await userStory.save();
            return userStory._id;
        }));

        // Update Stories document for the user
        await Stories.updateOne(
            { userId },
            { $push: { userStories: { $each: userStories } } },
            { upsert: true }
        );

        return res.status(201).json({ message: 'Stories created successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

}
export const getUserStory = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const friendsUser = user.buddies;
        const stories = await Stories.find({ userId: { $in: friendsUser } })
            .populate('userStories userId')
            .exec();

        return res.status(200).json(stories);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
