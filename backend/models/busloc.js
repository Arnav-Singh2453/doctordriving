import mongoose from "mongoose";

const busLocationSchema = new mongoose.Schema({
    busId: {
        type: String,
        required: true, // unique ID for each bus/driver
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    routeId: {
        type: String,
        required: true, // which route this bus is on
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

export default mongoose.model("BusLocation", busLocationSchema);