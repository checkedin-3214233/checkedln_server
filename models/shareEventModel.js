import mongoose from 'mongoose'

const shareEventSchema = new mongoose.Schema({

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Events",
    },

}, { timestamps: true })
const ShareEvent = mongoose.model("ShareEvents", shareEventSchema);
export default ShareEvent;