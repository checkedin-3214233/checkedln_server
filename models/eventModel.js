import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, "Event Type is required"],
        enum: ["public", "private"]
    },
    status: {
        type: String,
        required: [true, "Status is required"],
        enum: ["active", "inactive"],
        default: "active"

    },
    bannerImages: {
        type: String,
        required: [true, "Banner Image is required"],
    },
    checkInName: {
        type: String,
        required: [true, "Check In Name is required"]
    },
    startDateTime: {
        type: Date,
        required: [true, "Start Date Time is required"]
    },
    endDateTime: {
        type: Date,
        required: [true, "End Date Time is required"],
        validate: {
            validator: function (value) {
                // 'this' refers to the document being validated
                return this.startDateTime < value; // Validate that endDateTime is greater than startDateTime
            },
            message: "End Date Time must be later than Start Date Time"
        }
    },

    description: {
        type: String,
        required: [true, "Description is required"]
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }, attendies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: []
        }
    ],
    interested: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: []
        }
    ],
    checkedIn: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: []
        }
    ],
    images: [
        {
            type: String,
            default: []
        }
    ],
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: [true, "Location is required"]
    },
    price: {
        type: Number,
        required: [false]
    },

}, { timestamps: true })
const Event = mongoose.model("Events", eventSchema);
export default Event;