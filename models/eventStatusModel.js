import mongoose from 'mongoose'
const eventStatus = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,

    },
    events: [
        {
            event: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Event",
                required: true,
            },
            status: {
                type: String,
                enum: ["going", "interested", "not going", "requested"],
                default: "not going"
            }


        }
    ]


}, { timestamps: true })

const EventStatus = mongoose.model("EventStatus", eventStatus);
export default EventStatus;