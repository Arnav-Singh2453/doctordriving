import mongoose from "mongoose";

const busLocationSchema = new mongoose.Schema({
    busId: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    routeId: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("BusLocation", busLocationSchema);
