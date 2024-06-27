import mongoose from 'mongoose'
const stories = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,

    },
    userStories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserStory"

        }
    ]


}, { timestamps: true })

const Stories = mongoose.model("Stories", stories);
export default Stories;