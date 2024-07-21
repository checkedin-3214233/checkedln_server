import express from "express";
import otpGenerator from "otp-generator";
import { sendSMS } from "../services/vonnageServices.js";
import bcrypt from "bcryptjs"
import Otp from "../models/otpModel.js";
import User from "../models/userModels.js";
import RequestedUser from "../models/userRequestModel.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../services/jwt_helper.js"

export const checkUser = async (req, res, next) => {
    console.log("Check User");
    const number = req.body.number;
    const user = await User.findOne({
        phone: number
    })
    if (user) return res.status(200).send({ "message": "Please Login", "isUserExists": true })

    return res.status(200).send({ "message": "Please Register", "isUserExists": false })
}

export const signup = async (req, res, next) => {
    const { name, userName, phone, profileImageUrl, notificationToken, dateOfBirth, gender, userImages, bio } = req.body;
    if (!name) {
        return res.status(400).send({ "message": "Name is Required", "isSuccesfull": false });
    }
    if (!userName) {
        return res.status(400).send({ "message": "UserName is Required", "isSuccesfull": false });

    }
    if (!phone) {
        return res.status(400).send({ "message": "Phone is Required", "isSuccesfull": false });

    }

    if (!dateOfBirth) {
        return res.status(400).send({ "message": "Date of Birth is Required", "isSuccesfull": false });
    }

    if (!gender) {
        return res.status(400).send({ "message": "Gender is Required", "isSuccesfull": false });
    }
    const emailUser = await User.findOne({ userName: userName });
    const phoneUser = await User.findOne({ phone: phone });
    if (emailUser || phoneUser) return res.status(400).send({ "message": "UserName or Phone Number  Already Exit", "isSuccesfull": false });
    try {
        const newUser = await User.create({ name, userName, phone, profileImageUrl, notificationToken, dateOfBirth, gender, userImages, bio })

        const accessToken = await signAccessToken(newUser.id);
        const refreshToken = await signRefreshToken(newUser.id);
        const requestedUser = await RequestedUser.create({ userId: newUser.id, requestedUser: [] });
        newUser.requestedUser = requestedUser.id;
        await newUser.save();

        return res.status(201).send({
            success: true,
            message: "User Created Successfully",
            user: {
                name: newUser.name,
                userName: newUser.userName,
                phone: newUser.phone,
                profileImageUrl: newUser.profileImageUrl,
                dateOfBirth: newUser.dateOfBirth,
                gender: newUser.gender,
                userImages: newUser.userImages,
                userId: newUser._id,
                bio: newUser.bio,
                accessToken: accessToken,
                refreshToken: refreshToken
            },

        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Unable to create user",
            error: error

        })
    }


}
export const sendOtp = async (req, res, next) => {
    const { number } = req.body;
    if (!number) {
        return res.status(400).send({ "message": "Phone is Required", "isSuccesfull": false });

    }
    try {
        const userOtp = await Otp.findOne({ number: number });
        if (userOtp) {
            await Otp.deleteOne({ number: number });
        }
        const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, digits: true, lowerCaseAlphabets: false });
        const otp = new Otp({
            number: number,
            otp: OTP
        });
        const salt = await bcrypt.genSalt(10);
        otp.otp = await bcrypt.hash(otp.otp, salt);

        const result = await otp.save();
        console.log(result);
        if (result) {
            await sendSMS(number, `Your Otp for Checkedln verification is ${OTP}.Valid for 5 minutes only`, async (error, results) => {
                console.log(error, results);
                if (error) {
                    return res.status(500).send({
                        success: false,
                        message: "Unable to send OTP",
                        error: error

                    })
                }
                return res.status(200).send({
                    success: true,
                    message: "OTP Sent Successfully",
                    otp: OTP
                })
            });
        } else {
            return res.status(500).send({
                success: false,
                message: "Unable to send OTP",
                error: error

            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Unable to send OTP",
            error: error

        })
    }

}

export const verifyOtp = async (req, res, next) => {
    const { number, otp } = req.body;
    console.log(otp);
    if (!number) {
        return res.status(400).send({ "message": "Phone is Required", "isSuccesfull": false });


    }
    if (!otp) {
        return res.status(400).send({ "message": "OTP is Required", "isSuccesfull": false });

    }
    try {
        const userOtp = await Otp.findOne({ number: number });
        if (!userOtp) return res.status(400).send({ "message": "OTP Not Found", "isSuccesfull": false });
        const isValid = await bcrypt.compare(otp, userOtp.otp);
        console.log(isValid);
        if (!isValid) return res.status(400).send({ "message": "Invalid OTP", "isSuccesfull": false });
        await Otp.deleteOne({ number: number });
        return res.status(200).send({ "message": "OTP Verified Successfully", "isSuccesfull": true });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Unable to verify OTP",
            error: error

        })
    }


}


export const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) throw createError.BadRequest();
        const userId = await verifyRefreshToken(refreshToken);
        const accessToken = await signAccessToken(userId);
        const refreshToken1 = await signRefreshToken(userId);
        res.send({ accessToken, refreshToken: refreshToken1 });
    } catch (error) {
        next(error);
    }
};


export const login = async (req, res, next) => {
    const { phone, notificationToken } = req.body;
    if (!phone) {
        return res.status(400).send({ "message": "Phone is Required", "isSuccesfull": false });

    }
    try {
        const phoneUser = await User.findOne({ phone: phone });
        if (!phoneUser) return res.status(400).send({ "message": "Phone Number is not Registered", "isSuccesfull": false });
        const accessToken = await signAccessToken(phoneUser.id);
        const refreshToken = await signRefreshToken(phoneUser.id);
        const newUser = await User.findOneAndUpdate({
            phone: phone
        }, {
            notificationToken: notificationToken
        }, {
            returnOriginal: false
        });
        return res.status(201).send({
            success: true,
            message: "User Logged In Successfully",
            user: {
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                profileImageUrl: newUser.profileImageUrl,
                dateOfBirth: newUser.dateOfBirth,
                gender: newUser.gender,
                userImages: newUser.userImages,
                userId: newUser._id,
                bio: newUser.bio,
                accessToken: accessToken,
                refreshToken: refreshToken
            },

        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Unable to login ",
            error: error

        })
    }



}

export const getUser = async (req, res, next) => {
    const userId = req.payload.userId;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).send({ "message": "User Not Found", success: false, });
        return res.status(200).send({
            success: true,
            message: "User Found",
            user: user,


        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Unable to get user",
            error: error

        })
    }
}


export const updateUser = async (req, res, next) => {
    const userId = req.payload.userId;
    const { name, userName, profileImageUrl, dateOfBirth, gender, bio } = req.body;
    try {
        const username = await User.findOne({ _id: { $ne: userId }, userName: userName });
        if (username) return res.status(400).send({ "message": "UserName Already Exit", success: false, });

        const newUser = await User.findOneAndUpdate({
            _id: userId
        }, {
            name: name,
            userName: userName,
            profileImageUrl: profileImageUrl,
            dateOfBirth: dateOfBirth,
            gender: gender,
            bio: bio
        }, {
            returnOriginal: false
        });
        return res.status(200).send({
            success: true,
            message: "User Updated Successfully", user: newUser
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Unable to update user",
            error: error

        })
    }

}

export const getSearchedUser = async (req, res, next) => {
    const { userName } = req.body;
    try {
        const users = await User.find({ userName: { $regex: userName, $options: 'i' } });
        return res.status(200).send({
            success: true,
            message: "Users Found",
            users: users
        })
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Unable to get users",
            error: error

        })
    }
}

export const getUserById = async (req, res, next) => {
    const { otherUserId } = req.params;
    const userId = req.user.id
    try {
        const user = await User.findById(otherUserId);
        if (!user) return res.status(404).send({ "message": "User Not Found", success: false, });
        const present = user.buddies.includes(userId);
        if (present) {
            return res.status(200).send({
                success: true,
                message: "User Found",
                user: user,
                isRequested: false,
                isSent: false
            });
        }
        // Find the requestedUser document by userId
        const requestedUser = await RequestedUser.findOne({ userId: userId });
        console.log(requestedUser);
        const sentUser = await RequestedUser.findOne({ userId: otherUserId });

        // Check if otherUserId is in the requestedUser array
        const isRequested = requestedUser && requestedUser.requestedUser.includes(otherUserId);
        const isSent = sentUser && sentUser.requestedUser.includes(userId);

        return res.status(200).send({
            success: true,
            message: "User Found",
            user: user,
            isRequested: !!isRequested, // Ensuring boolean value,
            isSent: !!isSent
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Unable to get user",
            error: error
        });
    }
}

export const getSuggestedUsers = async (req, res, next) => {
    const userId = req.user.id;
    const { phoneNumbers } = req.body;
    const phoneNumberSet = new Set(phoneNumbers);

    try {
        // Find the user by ID to get the buddies list
        const currentUser = await User.findById(userId).populate('buddies');

        if (!currentUser) {
            throw new Error('User not found');
        }

        // Extract buddies' IDs into a Set for fast lookup
        const buddiesSet = new Set(currentUser.buddies.map(buddy => buddy._id.toString()));

        // Find users with phone numbers in the Set and not in the buddies list
        const commonUsers = await User.find({
            phone: { $in: Array.from(phoneNumberSet) },
            _id: { $nin: Array.from(buddiesSet) }
        });

        return res.status(200).send({
            success: true,
            message: "Users Found",
            users: commonUsers
        });
    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Unable to get user",
            error: error
        });
    }
}