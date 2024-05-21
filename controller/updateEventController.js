import Event from '../models/eventModel.js';
import ShareEvent from '../models/shareEventModel.js';
import EventStatus from '../models/eventStatusModel.js';
import { SendNotification, pushNotification } from '../services/pushNotificationServices.js';

export const getShareEventLink = async (req, res) => {
    const { eventId } = req.params;
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        const shareEvent = new ShareEvent({
            createdBy: req.userId,
            event: eventId
        });
        await shareEvent.save();
        return res.status(200).json({ shareEvent });
    } catch (error) {
        res.status(500).json({ error: error.message });

    }


}

export const joinEvent = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user._id;

    try {

        const eventStatus = await EventStatus.findOne({ userId });
        console.log(eventStatus);
        const event = await Event.findById(eventId);

        if (!eventStatus) {
            const newEventStatus = new EventStatus({
                userId,
                events: [
                    {
                        event: event,
                        status: "going"
                    }
                ]
            });
            await newEventStatus.save();
            event.attendies.push(userId);
            await event.save();
            return res.status(200).json({ message: "Event joined successfully" });

        }
        const findEventStatusById = await EventStatus.findOne({
            userId: userId,
            'events.event': eventId // Match the specific event within the events array
        });
        if (findEventStatusById) {
            // Find the index of the event object within the events array that matches the eventId
            const eventIndex = findEventStatusById.events.findIndex(eventItem => eventItem.event.equals(eventId));

            if (eventIndex === -1) {
                throw new Error(`Event not found in the events array for user ${userId} and event ${eventId}`);
            }
            findEventStatusById.events[eventIndex].status = "going";
            await findEventStatusById.save();
            const event = await Event.findById(eventId).populate("createdBy");
            const createdUser = event.createdBy;
            console.log(createdUser);
            console.log(createdUser.notificationToken);
            event.attendies.push(userId);
            await event.save();
            if (createdUser.notificationToken) {
                var notificationMessage = {
                    app_id: process.env.NOTIFICATION_APP_ID,
                    contents: {
                        "en": `Event Request.`
                    },
                    headings: {
                        "en": `New Request from ${req.user.name} to join your event ${event.checkInName} .`
                    },

                    large_icon: req.user.profileImageUrl,
                    big_picture: event.bannerImages,
                    included_segments: ["include_subscription_ids"],
                    buttons: [{ "action": "accept", "id": "id1", "text": "Accept", "icon": "https://cdn-icons-png.flaticon.com/512/2550/2550322.png" }, { "id": "id2", "text": "Reject", "icon": "https://cdn.vectorstock.com/i/1000v/10/97/reject-icon-vector-10851097.jpg", "action": "reject" }],

                    include_subscription_ids: [`${createdUser.notificationToken}`],
                    content_available: true,
                    small_icon: "ic_notification_icon",
                    data: {
                        event: event,
                        PushTitle: `New Request from ${req.user.name} to join your event ${event.checkInName} .`
                    }
                };
                SendNotification(notificationMessage, async (error, results) => {

                })
            }
            pushNotification(createdUser._id, "eventStatus", {
                event: event,

                PushTitle: `New Request from ${req.user.name} to join your event ${event.checkInName} .`
            }, req.user,)
            return res.status(200).json({ message: "Event joined successfully. You will be notified about the event in future." });

        }
        eventStatus.events.push({
            event: eventId,
            status: "going"
        });
        await eventStatus.save();
        event.attendies.push(userId);
        await event.save();
        const eventR = await Event.findById(eventId);
        const createdUser = event.createdBy;
        if (createdUser.notificationToken) {
            var notificationMessage = {
                app_id: process.env.NOTIFICATION_APP_ID,
                contents: {
                    "en": `Event Request`
                },
                headings: {
                    "en": `New Request from ${req.user.name} to join your event ${eventR.checkInName} .`
                },

                included_segments: ["include_subscription_ids"],
                include_subscription_ids: [`${createdUser.notificationToken}`],
                content_available: true,
                small_icon: "ic_notification_icon",
                large_icon: req.user.profileImageUrl,
                big_picture: eventR.bannerImages,
                buttons: [{ "action": "accept", "id": "id1", "text": "Accept", "icon": "https://cdn-icons-png.flaticon.com/512/2550/2550322.png" }, { "id": "id2", "text": "Reject", "icon": "https://cdn.vectorstock.com/i/1000v/10/97/reject-icon-vector-10851097.jpg", "action": "reject" }],

                data: {
                    event: eventR,
                    PushTitle: `New Request from ${req.user.name} to join your event ${eventR.checkInName} .`
                }
            };
            SendNotification(notificationMessage, async (error, results) => {

            })
        }
        pushNotification(createdUser._id, "eventStatus", {
            event: event,

            PushTitle: `New Request from ${req.user.name} to join your event ${eventR.checkInName} .`
        }, req.user,)
        return res.status(200).json({
            message: "Event joined successfully. You will be notified about the event in future."
        });


    } catch (error) {
        res.status(500).json({ error: error.message });

    }
}

