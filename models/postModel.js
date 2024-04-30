import mongoose from 'mongoose'
const post = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,

    },
    posts: [
        {
            images: [
                {
                    type: String,
                    default: []
                }
            ],
            friends: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    default: []
                }
            ],
            location: {
                type: String,
                required: [true, "Event Venue is required"]
            },
            description: {
                type: String,

            },

        }
    ]


}, { timestamps: true })

const Post = mongoose.model("Post", post);
export default Post;