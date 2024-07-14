import mongoose from 'mongoose'
const otp = new mongoose.Schema({
    number: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: { type: Date, default: Date.now, index: { expires: 300 } }
}, { timestamps: true });
const Otp = mongoose.model('Otp', otp);
export default Otp;