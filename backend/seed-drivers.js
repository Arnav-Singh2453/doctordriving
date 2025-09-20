import mongoose from "mongoose";
import Driver from "./models/driver.js";

// MongoDB Atlas connection
const uri = "mongodb+srv://bora:arnav@cluster0.viblu0y.mongodb.net/sih-tracking?retryWrites=true&w=majority&appName=Cluster0";

const demoDrivers = [
    {
        vehicleNumber: "DL01AB1234",
        password: "1234",
        driverName: "Rajesh Kumar",
        routeId: "ROUTE001",
        contactNumber: "+91-9876543210"
    },
    {
        vehicleNumber: "DL02CD5678",
        password: "5678",
        driverName: "Amit Singh",
        routeId: "ROUTE002",
        contactNumber: "+91-9876543211"
    },
    {
        vehicleNumber: "MH01EF9012",
        password: "9012",
        driverName: "Priya Sharma",
        routeId: "ROUTE003",
        contactNumber: "+91-9876543212"
    },
    {
        vehicleNumber: "KA03GH3456",
        password: "3456",
        driverName: "Suresh Reddy",
        routeId: "ROUTE004",
        contactNumber: "+91-9876543213"
    },
    {
        vehicleNumber: "TN04IJ7890",
        password: "7890",
        driverName: "Lakshmi Devi",
        routeId: "ROUTE005",
        contactNumber: "+91-9876543214"
    }
];

async function seedDrivers() {
    try {
        console.log("🔄 Connecting to MongoDB...");
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB");

        // Clear existing drivers (optional)
        console.log("🗑️ Clearing existing drivers...");
        await Driver.deleteMany({});

        // Insert demo drivers
        console.log("📝 Inserting demo drivers...");
        const insertedDrivers = await Driver.insertMany(demoDrivers);
        
        console.log("✅ Demo drivers created successfully:");
        insertedDrivers.forEach(driver => {
            console.log(`   - ${driver.vehicleNumber} (${driver.driverName}) - Password: ${driver.password}`);
        });

        console.log("\n🎯 You can now login with any of these credentials:");
        demoDrivers.forEach(driver => {
            console.log(`   Vehicle: ${driver.vehicleNumber} | Password: ${driver.password}`);
        });

    } catch (error) {
        console.error("❌ Error seeding drivers:", error);
    } finally {
        await mongoose.connection.close();
        console.log("🔐 Database connection closed");
    }
}

seedDrivers();
