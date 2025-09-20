import mongoose from "mongoose";

const busLocationSchema = new mongoose.Schema({
    vehicleNumber: { type: String, required: true, unique: true },
    busId: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    routeId: { type: String, required: true },
    driverName: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    lastPing: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("BusLocation", busLocationSchema);
