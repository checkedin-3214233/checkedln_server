import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    coordinates: {
        type: {
            type: String,
            enum: ['Point'], // We specify 'Point' for GeoJSON point
            default: 'Point'
        },
        coordinates: {
            type: [Number], // Should be an array of numbers [longitude, latitude]
            required: true
        }
    },
    address: {
        type: String,
        required: [true, "Event Venue is required"]
    }
}, { timestamps: true });

// Create 2dsphere index on the 'coordinates' field
locationSchema.index({ coordinates: '2dsphere' });

const Location = mongoose.model("Location", locationSchema);

export default Location;
