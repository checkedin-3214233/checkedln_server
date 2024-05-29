import mongoose from 'mongoose'
const notification = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,

    },
    notifications: [
        {
            notificationData: {
                type: String,

                required: true,
            },
            fromUser: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            type: {
                type: String,
                enum: ["eventStatus", "newBuddies", "normal"],
                default: "not going"
            },
            createdAt: {
                type: Date,
                default: Date.now
            }


        }
    ]


}, { timestamps: true })

const Notification = mongoose.model("Notification", notification);
export default Notification;