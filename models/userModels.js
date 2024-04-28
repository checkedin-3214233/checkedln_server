import mongoose from 'mongoose'
import validator from 'validator'


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is Required']
    },
    userName: {
        type: String,
        required: [true, "UserName is required"],
        unique: true,
        index: true,
        sparse: true
    },
    phone: {
        type: String,
        required: [true, "Phone Number is required"],
        unique: true,
        validate: validator.isMobilePhone
    },
    profileImageUrl: {
        type: String,
        required: [false],
    },
    notificationToken: {
        type: String,
        required: [false]
    },
    dateOfBirth: {
        type: Date,
        required: [true, "Date of Birth is required"]
    },
    gender: {
        type: String,
        required: [true, "Gender is required"],
        enum: ["male", "female", "other"]
    },
    userImages: [
        {
            type: String,
            required: [true, "User Image is required"]
        }
    ],
    bio: {
        type: String,
        required: [false]
    },
    buddies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],



}, {
    timestamps: true
})


export default mongoose.model("User", userSchema)