import Event from '../models/eventModel.js';
export const createEvent = async (req, res) => {
    try {
        const { type, bannerImages, checkInName, startDateTime, endDateTime, location, description } = req.body;
        const createdBy = req.user._id;
        const event = await Event.create({
            type,
            bannerImages,
            checkInName,
            startDateTime,
            endDateTime,
            location,
            description,
            createdBy,
            attendies: [createdBy],
            images: [bannerImages]

        });
        res.status(201).json({ event });
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