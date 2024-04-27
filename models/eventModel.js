import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, "Event Type is required"],
        enum: ["public", "private"]
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
    location: {
        type: String,
        required: [true, "Event Venue is required"]
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
    images: [
        {
            type: String,
            default: []
        }
    ]
}, { timestamps: true })
const Event = mongoose.model("Events", eventSchema);
export default Event;