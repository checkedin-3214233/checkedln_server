import Event from '../models/eventModel.js';
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
            return res.status(200).json({ message: `Event ${status} Successfully You Will be notified about the event in future.` });

        }


        eventStatus.events.push({
            event: eventId,
            status: status
        });
        await eventStatus.save();

        return res.status(200).json({
            message: "Event Requested Successfully You Will be notified once Admin Accept it."
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: error.message });
    }
}