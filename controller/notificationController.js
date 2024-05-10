import { SendNotification } from '../services/pushNotificationServices.js';
import Notification from '../models/notificationModel.js';
export const notificationController = async (req, res) => {
    var message = {
        app_id: process.env.NOTIFICATION_APP_ID,
        contents: {
            "en": "Test push notification"
        },
        included_segments: ["All"],
        content_available: true,
        small_icon: "ic_notification_icon",
        data: {
            PushTitle: "CUSTOM NOTIFICATION"
        }

    }
    SendNotification(message, (error, results) => {
        if (error) return next(error);
        return res.status(200).send({
            message: "Success",
            data: results
        })
    })



}


export const getAllNotifications = async (req, res) => {
    const userId = req.user._id;
    try {
        const notificationUser = await Notification.findOne({ userId }).populate('notifications.fromUser');
        if (!notificationUser) return res.status(200).send({ message: "No notifications found", data: [] });
        return res.status(200).send({ message: "Success", data: notificationUser.notifications });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}