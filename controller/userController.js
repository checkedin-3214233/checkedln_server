import e from "express";
import User from "../models/userModels.js";

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
    if (!profileImageUrl) {
        return res.status(400).send({ "message": "Profile Image is Required", "isSuccesfull": false });
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