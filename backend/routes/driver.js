import express from "express";
import BusLocation from "../models/busloc.js";
const router = express.Router();

router.post("/update-location", async (req, res) => {
    try {
        console.log("Received location:", req.body);
        const { busId, latitude, longitude, routeId } = req.body;
        if (!busId || !latitude || !longitude || !routeId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const location = await BusLocation.findOneAndUpdate(
            { busId },
            { latitude, longitude, routeId, updatedAt: Date.now() },
            { new: true, upsert: true } // create if not exists
        );
        console.log("Saved location:", location);
        res.json({ message: "Location updated", location });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;
