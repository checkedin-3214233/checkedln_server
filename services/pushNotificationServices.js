import https from 'https';
import Notification from '../models/notificationModel.js';

async function SendNotification(data, callback) {
    var headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic " + process.env.NOTIFICATION_API_KEY
    }
    var options = {
        host: "onesignal.com",
        port: 443,
        path: "/api/v1/notifications",
        method: "POST",
        headers: headers
    };
    var req = await https.request(options, function (res) {
        res.on("data", function (data) {
            console.log(JSON.parse(data));
            return callback(null, JSON.parse(data))
        });
    });

    req.on("error",
        function (e) {

            console.log(e.message);
            return callback({ message: e.message })

        })

    req.write(JSON.stringify(data));
    req.end()
}


async function pushNotification(userId, notificationType, data, fromUser) {
    const notificationUser = await Notification.findOne({ userId });
    if (!notificationUser) {
        const newNotification = new Notification({
            userId,
            notifications: [{
                notificationData: JSON.stringify(data),
                type: notificationType,
                fromUser: fromUser

            }]
        });
        await newNotification.save();
    } else {
        notificationUser.notifications.push({
            notificationData: JSON.stringify(data),
            type: notificationType,
            fromUser: fromUser

        });
        await notificationUser.save();
    }
}
export { SendNotification, pushNotification };
