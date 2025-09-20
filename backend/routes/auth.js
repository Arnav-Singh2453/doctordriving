import express from "express";
import Driver from "../models/driver.js";
const router = express.Router();

// Driver login route
router.post("/login", async (req, res) => {
    try {
        console.log("Login attempt:", req.body);
        const { vehicleNumber, password } = req.body;
        
        if (!vehicleNumber || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Vehicle number and password are required" 
            });
        }

        // Find driver by vehicle number
        const driver = await Driver.findOne({ 
            vehicleNumber: vehicleNumber.toUpperCase(),
            isActive: true 
        });

        if (!driver) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid vehicle number or not authorized" 
            });
        }

        // Simple password check (in production, use bcrypt)
        if (driver.password !== password) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid password" 
            });
        }

        // Update last login
        driver.lastLogin = new Date();
        await driver.save();

        console.log("Login successful for:", driver.vehicleNumber);
        res.json({
            success: true,
            message: "Login successful",
            driver: {
                id: driver._id,
                vehicleNumber: driver.vehicleNumber,
                driverName: driver.driverName,
                routeId: driver.routeId,
                contactNumber: driver.contactNumber
            }
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Server error during login" 
        });
    }
});

// Create new driver (for testing/admin purposes)
router.post("/register", async (req, res) => {
    try {
        console.log("Driver registration:", req.body);
        const { vehicleNumber, password, driverName, routeId, contactNumber } = req.body;
        
        if (!vehicleNumber || !password || !driverName || !routeId || !contactNumber) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
        }

        // Check if driver already exists
        const existingDriver = await Driver.findOne({ 
            vehicleNumber: vehicleNumber.toUpperCase() 
        });

        if (existingDriver) {
            return res.status(409).json({ 
                success: false, 
                message: "Driver with this vehicle number already exists" 
            });
        }

        // Create new driver
        const newDriver = new Driver({
            vehicleNumber: vehicleNumber.toUpperCase(),
            password,
            driverName,
            routeId,
            contactNumber
        });

        await newDriver.save();
        console.log("Driver registered:", newDriver.vehicleNumber);

        res.status(201).json({
            success: true,
            message: "Driver registered successfully",
            driver: {
                id: newDriver._id,
                vehicleNumber: newDriver.vehicleNumber,
                driverName: newDriver.driverName,
                routeId: newDriver.routeId
            }
        });

    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Server error during registration" 
        });
    }
});

// Get all drivers (for admin/testing)
router.get("/drivers", async (req, res) => {
    try {
        const drivers = await Driver.find({ isActive: true }).select('-password');
        res.json({
            success: true,
            drivers
        });
    } catch (err) {
        console.error("Error fetching drivers:", err);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});

export default router;
