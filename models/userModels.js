import mongoose from 'mongoose'
import validator from 'validator'


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is Required']
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        validate: validator.isEmail
    },
    phone: {
        type: String,
        required: [true, "Phone Number is required"],
        unique: true,
        validate: validator.isMobilePhone
    },
    profileImageUrl: {
        type: String,
        required: [true, "Profile Image is required"],
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


}, {
    timestamps: true
})


export default mongoose.model("User", userSchema)