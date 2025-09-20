import express from "express";
import BusLocation from "../models/busloc.js";
import Driver from "../models/driver.js";
const router = express.Router();

router.post("/update-location", async (req, res) => {
    try {
        console.log("Received location:", req.body);
        const { vehicleNumber, busId, latitude, longitude, routeId, driverName } = req.body;
        
        if (!vehicleNumber || !latitude || !longitude) {
            return res.status(400).json({ 
                success: false, 
                message: "Vehicle number, latitude, and longitude are required" 
            });
        }

        // Verify driver exists and is active
        const driver = await Driver.findOne({ 
            vehicleNumber: vehicleNumber.toUpperCase(),
            isActive: true 
        });

        if (!driver) {
            return res.status(401).json({ 
                success: false, 
                message: "Driver not authorized" 
            });
        }

        const location = await BusLocation.findOneAndUpdate(
            { vehicleNumber: vehicleNumber.toUpperCase() },
            { 
                vehicleNumber: vehicleNumber.toUpperCase(),
                busId: busId || vehicleNumber,
                latitude, 
                longitude, 
                routeId: routeId || driver.routeId,
                driverName: driverName || driver.driverName,
                isActive: true,
                lastPing: new Date(),
                updatedAt: new Date()
            },
            { new: true, upsert: true }
        );
        
        console.log("Saved location:", location);
        res.json({ 
            success: true, 
            message: "Location updated successfully", 
            location 
        });
    } catch (err) {
        console.error("Location update error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Server error updating location" 
        });
    }
});

// Get current location for a vehicle
router.get("/location/:vehicleNumber", async (req, res) => {
    try {
        const { vehicleNumber } = req.params;
        const location = await BusLocation.findOne({ 
            vehicleNumber: vehicleNumber.toUpperCase() 
        });

        if (!location) {
            return res.status(404).json({ 
                success: false, 
                message: "Location not found" 
            });
        }

        res.json({ 
            success: true, 
            location 
        });
    } catch (err) {
        console.error("Error fetching location:", err);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});

// Stop tracking (set inactive)
router.post("/stop-tracking", async (req, res) => {
    try {
        const { vehicleNumber } = req.body;
        
        if (!vehicleNumber) {
            return res.status(400).json({ 
                success: false, 
                message: "Vehicle number is required" 
            });
        }

        const location = await BusLocation.findOneAndUpdate(
            { vehicleNumber: vehicleNumber.toUpperCase() },
            { isActive: false, updatedAt: new Date() },
            { new: true }
        );

        res.json({ 
            success: true, 
            message: "Tracking stopped", 
            location 
        });
    } catch (err) {
        console.error("Error stopping tracking:", err);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});

export default router;
