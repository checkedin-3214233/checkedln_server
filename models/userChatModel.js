import mongoose from 'mongoose'
const userChat = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,

    },
    allUsers: [
        {
            users: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            lastMessage: {

                type: mongoose.Schema.Types.ObjectId,
                ref: "Message",
                required: false,

            },
            totalUnreadMessage: { type: Number, required: false },
            lastSeen: {
                type: Date,
                required: false,
            }

        }
    ]


}, { timestamps: true })

const UsersChat = mongoose.model("UsersChat", userChat);
export default UsersChat;