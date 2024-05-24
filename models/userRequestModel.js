import mongoose from 'mongoose'
const requestedUser = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,

    },
    requestedUser: [
        {

            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    ]


}, { timestamps: true })

const RequestedUser = mongoose.model("RequestedUser", requestedUser);
export default RequestedUser;