import User from "../models/userModels.js";
import RequestedUser from "../models/userRequestModel.js";
export const catchUpUser = async (req, res, next) => {

    try {
        const { catchUpUserId } = req.params;
        const userId = req.user.id;
        const requestedUser = await RequestedUser.findOne({ userId: catchUpUserId });
        if (!requestedUser) return res.status(400).send({
            success: false,
            message: "User Not Found"
        });
        requestedUser.requestedUser.push(userId);
        await requestedUser.save();
        return res.status(200).send({
            success: true,
            message: "User Catched Up. You will be notified when user accepts your request."
        });

    } catch (error) {
        return res.status(500).send({
            success: false,
            message: "Unable to catch up user",
            error: error

        })
    }
}
export const acceptCatchUpRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;
        const requestedUser = await RequestedUser.findOne({ userId: userId });
        if (!requestedUser) return res.status(400).send({
            success: false,
            message: "User Not Found"
        });
        const index = requestedUser.requestedUser.indexOf(requestId);
        if (index > -1) {
            requestedUser.requestedUser.splice(index, 1);
        }

        await requestedUser.save();
        const myUser = await User.findById(userId);
        const catchUpUser = await User.findById(requestId);
        myUser.buddies.push(requestId);
        catchUpUser.buddies.push(userId);
        await myUser.save();
        await catchUpUser.save();
        return res.status(200).send({
            success: true,
            message: "User Request Accepted"
        });
    }
    catch (e) {
        return res.status(500).send({
            success: false,
            message: "Unable to accept request",
            error: e
        });


    }
}
export const rejectCatchUpRequest = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;
        const requestedUser = await RequestedUser.findOne({
            userId: userId
        });
        if (!requestedUser) return res.status(400).send({
            success: false,
            message: "User Not Found"
        });
        const index = requestedUser.requestedUser.indexOf(requestId);
        if (index > -1) {
            requestedUser.requestedUser.splice(index, 1);
        }
        await requestedUser.save();
        return res.status(200).send({
            success: true,
            message: "User Request Rejected"
        });
    } catch (e) {
        return res.status(500).send({
            success: false,
            message: "Unable to reject request",
            error: e
        });
    }
}