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
    const { shareEventId } = req.params;
    const userId = req.user._id;

    try {
        const updatedEvent = await ShareEvent.findByIdAndUpdate(
            shareEventId,
            { status: "expired" },
            { new: true } // to return the updated document
        );
        if (updatedEvent) {
            console.log('Event status updated to expired:', updatedEvent);
        } else {
            console.log('Event not found');
        }
        const eventStatus = await EventStatus.findOne({ userId });
        console.log(eventStatus);
        const event = await Event.findById(updatedEvent.event);

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
            const eventR = await Event.findById(updatedEvent.event).populate("createdBy");
            const createdUser = eventR.createdBy;
            if (createdUser.notificationToken) {
                await notify(req.user.name, eventR.checkInName, createdUser.notificationToken, req.user.profileImageUrl, eventR.bannerImages, eventR)

            }
            pushNotification(createdUser._id, "normal", {
                event: eventR,

                PushTitle: `New Request from ${req.user.name} to join your event ${event.checkInName} .`
            }, req.user,)
            return res.status(200).json({ message: "Event joined successfully" });

        }
        const findEventStatusById = await EventStatus.findOne({
            userId: userId,
            'events.event': updatedEvent.event // Match the specific event within the events array
        });
        if (findEventStatusById) {
            // Find the index of the event object within the events array that matches the eventId
            const eventIndex = findEventStatusById.events.findIndex(eventItem => eventItem.event.equals(updatedEvent.event));

            if (eventIndex === -1) {
                throw new Error(`Event not found in the events array for user ${userId} and event ${updatedEvent.event}`);
            }
            findEventStatusById.events[eventIndex].status = "going";
            await findEventStatusById.save();
            const eventR = await Event.findById(updatedEvent.event).populate("createdBy");
            const createdUser = eventR.createdBy;
            console.log(createdUser);
            console.log(createdUser.notificationToken);
            event.attendies.push(userId);
            await event.save();
            if (createdUser.notificationToken) {
                console.log("notificationToken", createdUser.notificationToken);
                await notify(req.user.name, eventR.checkInName, createdUser.notificationToken, req.user.profileImageUrl, eventR.bannerImages, eventR)

            }
            pushNotification(createdUser._id, "eventStatus", {
                event: event,

                PushTitle: `New Request from ${req.user.name} to join your event ${event.checkInName} .`
            }, req.user,)
            return res.status(200).json({ message: "Event joined successfully. You will be notified about the event in future." });

        }
        eventStatus.events.push({
            event: updatedEvent.event,
            status: "going"
        });
        await eventStatus.save();
        event.attendies.push(userId);
        await event.save();
        const eventR = await Event.findById(updatedEvent.event);
        const createdUser = event.createdBy;
        if (createdUser.notificationToken) {
            console.log("notificationToken1", createdUser.notificationToken);

            await notify(req.user.name, eventR.checkInName, createdUser.notificationToken, req.user.profileImageUrl, eventR.bannerImages, eventR)
        }
        pushNotification(createdUser._id, "normal", {
            event: event,

            PushTitle: `${req.user.name} has joined your event ${eventR.checkInName} .`
        }, req.user,)
        return res.status(200).json({
            message: "Event joined successfully. You will be notified about the event in future."
        });


    } catch (error) {
        res.status(500).json({ error: error.message });

    }
}

export const getShareEventId = async (req, res) => {
    const { shareEventId } = req.params;
    try {
        const shareEvent = await ShareEvent.findById(shareEventId);
        if (!shareEvent) {
            return res.status(404).json({ message: "Share Event not found" });
        }
        return res.status(200).json({ shareEvent });
    } catch (error) {
        res.status(500).json({ error: error.message });

    }

}

async function notify(userName, checkInName, userToken, profileImageUrl, bannerImages, eventR) {
    var notificationMessage = {
        app_id: process.env.NOTIFICATION_APP_ID,
        contents: {
            "en": `Event Joined.`
        },
        headings: {
            "en": `${userName} has joined your event ${checkInName} .`
        },

        included_segments: ["include_subscription_ids"],
        include_subscription_ids: [`${userToken}`],
        content_available: true,
        small_icon: "ic_notification_icon",
        large_icon: profileImageUrl,
        big_picture: bannerImages,
        buttons: [{ "action": "accept", "id": "id1", "text": "Accept", "icon": "https://cdn-icons-png.flaticon.com/512/2550/2550322.png" }, { "id": "id2", "text": "Reject", "icon": "https://cdn.vectorstock.com/i/1000v/10/97/reject-icon-vector-10851097.jpg", "action": "reject" }],

        data: {
            event: eventR,
            PushTitle: `${userName} has joined your event ${checkInName} .`
        }
    };
    await SendNotification(notificationMessage, async (error, results) => {

    })
}