import mongoose from 'mongoose';

const userStorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400,  // 86400 seconds = 24 hours
    }
}, { timestamps: true });

const UserStory = mongoose.model("UserStory", userStorySchema);

export default UserStory;
