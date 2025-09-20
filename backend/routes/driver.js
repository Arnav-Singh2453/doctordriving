import express from "express";
import BusLocation from "../models/busloc.js";

const router = express.Router();

// ✅ Update driver location
router.post("/update-location", async (req, res) => {
    try {
        const { busId, latitude, longitude, routeId } = req.body;

        if (!busId || !latitude || !longitude || !routeId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Find bus and update or create new entry
        const location = await BusLocation.findOneAndUpdate(
            { busId }, // find by busId
            { latitude, longitude, routeId, updatedAt: Date.now() }, // update fields
            { new: true, upsert: true } // create if not exists
        );

        res.json({ message: "Location updated", location });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Get current location of a bus
router.get("/:busId", async (req, res) => {
    try {
        const location = await BusLocation.findOne({ busId: req.params.busId });
        if (!location) {
            return res.status(404).json({ message: "Bus not found" });
        }
        res.json(location);
    } catch (err) {
        res.status(500).json({ message: "Server error"+err });
    }
});

export default router;
