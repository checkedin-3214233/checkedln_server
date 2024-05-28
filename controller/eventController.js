import Event from '../models/eventModel.js';
import { SendNotification, pushNotification } from '../services/pushNotificationServices.js';
import User from "../models/userModels.js";
import Location from '../models/locationModel.js';
import EventStatus from '../models/eventStatusModel.js';
export const createEvent = async (req, res) => {
    try {
        const { type, bannerImages, checkInName, startDateTime, endDateTime, address, description, lat, long, price } = req.body;
        const createdBy = req.user._id;
        console.log([long, lat]);
        const newLocation = new Location({
            coordinates: {
                type: 'Point',
                coordinates: [long, lat] // [longitude, latitude] order
            },
            address: address
        });
        newLocation.save()
            .then(async (savedLocation) => {
                const event = await Event.create({
                    type,
                    bannerImages,
                    checkInName,
                    startDateTime,
                    endDateTime,

                    description,
                    createdBy,
                    attendies: [createdBy],
                    images: [bannerImages],
                    location: savedLocation._id,
                    price: price

                });
                return res.status(201).json({ event });
            })
            .catch((error) => {

                return res.status(400).json({ error: error, message: "Error saving location" });
            });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getNearByEvents = async (req, res) => {
    try {
        const { latitude, longitude, maxDistance } = req.body;
        const coordinates = [longitude, latitude]; // [longitude, latitude] order

        // Perform a $geoNear aggregation query to find nearby locations
        const nearbyLocations = await Location.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: coordinates
                    },
                    distanceField: 'distance',
                    maxDistance: maxDistance, // in meters
                    spherical: true
                }
            }
        ]);
        console.log(nearbyLocations);

        // Extract location IDs from nearby locations
        const locationIds = nearbyLocations.map(location => location._id);
        console.log(locationIds);
        // Find events that have a location within the specified IDs
        const nearbyEvents = await Event.find({
            location: { $in: locationIds }, type: "public", startDateTime: {
                $gt: new Date()
            }, createdBy: { $ne: req.user._id }
        }).populate('location'); // Populate the 'location' field with Location details



        res.status(200).json({ nearbyEvents });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const getPastEvents = async (req, res) => {
    const userId = req.user._id;

    try {
        const events = await Event.find({ startDateTime: { $lt: new Date() }, attendies: userId });
        res.status(200).json({ events });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
export const getUpcomingEvents = async (req, res) => {
    const userId = req.user._id;
    try {
        const events = await Event.find({ startDateTime: { $gt: new Date() }, attendies: userId });
        res.status(200).json({ events });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getEventById = async (req, res) => {
    const { eventId } = req.params;
    try {
        const event = await Event.findById(eventId).populate("attendies location");
        const eventStatus = await EventStatus.findOne({ userId: req.user._id, 'events.event': eventId });
        if (eventStatus) {
            const events = eventStatus.events.find(eventItem => eventItem.event.equals(eventId));


            return res.status(200).json({ event, status: events.status });
        }
        return res.status(200).json({ event, status: "not going" });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: error.message });
    }

}

export const requestEvent = async (req, res) => {
    const { eventId, status } = req.params;
    const userId = req.user._id;
    try {
        if (status === "going" || status === "interested" || status === "not going") {
            return res.status(400).json({ message: "Invalid Status" });
        }
        const eventStatus = await EventStatus.findOne({ userId });
        if (!eventStatus) {
            const newEventStatus = new EventStatus({
                userId,
                events: [
                    {
                        event: eventId,
                        status: status
                    }
                ]
            });
            await newEventStatus.save();
            const event = await Event.findById(eventId);
            const createdUser = event.createdBy;
            console.log(createdUser.notificationToken);
            if (createdUser.notificationToken) {
                var notificationMessage = {
                    app_id: process.env.NOTIFICATION_APP_ID,
                    contents: {
                        "en": `Event Request`
                    },
                    headings: {
                        "en": `New Request from ${req.user.name} to join your event ${event.checkInName} .`
                    },

                    buttons: [{ "action": "accept", "id": "id1", "text": "Accept", "icon": "https://cdn-icons-png.flaticon.com/512/2550/2550322.png" }, { "id": "id2", "text": "Reject", "icon": "https://cdn.vectorstock.com/i/1000v/10/97/reject-icon-vector-10851097.jpg", "action": "reject" }],
                    included_segments: ["include_subscription_ids"],
                    include_subscription_ids: [`${createdUser.notificationToken}`],
                    content_available: true,
                    large_icon: req.user.profileImageUrl,
                    big_picture: event.bannerImages,
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
            return res.status(200).json({ message: "Event Requested Successfully You Will be notified once Admin Accept it." });
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
            findEventStatusById.events[eventIndex].status = status;
            await findEventStatusById.save();
            const event = await Event.findById(eventId).populate("createdBy");
            const createdUser = event.createdBy;
            console.log(createdUser);
            console.log(createdUser.notificationToken);
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
            return res.status(200).json({ message: `Event ${status} Successfully You Will be notified about the event in future.` });

        }


        eventStatus.events.push({
            event: eventId,
            status: status
        });
        await eventStatus.save();
        const event = await Event.findById(eventId);
        const createdUser = event.createdBy;
        if (createdUser.notificationToken) {
            var notificationMessage = {
                app_id: process.env.NOTIFICATION_APP_ID,
                contents: {
                    "en": `Event Request`
                },
                headings: {
                    "en": `New Request from ${req.user.name} to join your event ${event.checkInName} .`
                },

                included_segments: ["include_subscription_ids"],
                include_subscription_ids: [`${createdUser.notificationToken}`],
                content_available: true,
                small_icon: "ic_notification_icon",
                large_icon: req.user.profileImageUrl,
                big_picture: event.bannerImages,
                buttons: [{ "action": "accept", "id": "id1", "text": "Accept", "icon": "https://cdn-icons-png.flaticon.com/512/2550/2550322.png" }, { "id": "id2", "text": "Reject", "icon": "https://cdn.vectorstock.com/i/1000v/10/97/reject-icon-vector-10851097.jpg", "action": "reject" }],

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
        return res.status(200).json({
            message: "Event Requested Successfully You Will be notified once Admin Accept it."
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: error.message });
    }
}

export const acceptRequest = async (req, res) => {
    const { eventId, otherUserId } = req.params;
    const userId = req.user._id;
    console.log('userId:', otherUserId);
    console.log('eventId:', eventId);

    try {
        const eventStatus = await EventStatus.findOne({ userId: otherUserId });
        if (!eventStatus) {
            console.log("eventStatus0", eventStatus);
            return res.status(404).json({ message: "Event not found" });
        }
        const userEventStatus = await EventStatus.findOne({
            userId: otherUserId,
            'events.event': eventId
        });
        if (!userEventStatus) {
            console.log("eventStatus1", userEventStatus);

            return res.status(404).json({ message: "Event not found" });
        }
        const eventIndex = userEventStatus.events.findIndex(eventItem => eventItem.event.equals(eventId));

        if (eventIndex === -1) {
            throw new Error(`Event not found in the events array for user ${userId} and event ${eventId}`);
        }
        userEventStatus.events[eventIndex].status = "going";
        await userEventStatus.save();
        const event = await Event.findById(eventId).populate("createdBy");
        event.attendies.push(otherUserId);
        await event.save();
        const createdUser = await User.findById(otherUserId);
        console.log(createdUser);
        console.log(createdUser.notificationToken);
        if (createdUser.notificationToken) {
            var notificationMessage = {
                app_id: process.env.NOTIFICATION_APP_ID,
                contents: {
                    "en": `Event Request.`
                },
                headings: {
                    "en": `Your Request has been accepted by ${req.user.name} to join the event ${event.checkInName} .`
                },

                large_icon: req.user.profileImageUrl,
                big_picture: event.bannerImages,
                included_segments: ["include_subscription_ids"],

                include_subscription_ids: [`${createdUser.notificationToken}`],
                content_available: true,
                small_icon: "ic_notification_icon",
                data: {
                    event: event,
                    PushTitle: `Your Request has been accepted by ${req.user.name} to join the event ${event.checkInName} .`
                }
            };
            SendNotification(notificationMessage, async (error, results) => {

            })
        }
        pushNotification(createdUser._id, "eventStatus", {
            event: event,

            PushTitle: `Your Request has been accepted by ${req.user.name} to join the event ${event.checkInName} .`
        }, req.user,)
        return res.status(200).json({ message: `User Marked as going.` });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}