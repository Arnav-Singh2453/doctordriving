import express from "express";
import mongoose from "mongoose";
import driverRoutes from "./routes/driver.js";

const app = express();
app.use(express.json());

// MongoDB Atlas connection
const uri = "mongodb+srv://bora:arnav@cluster0.viblu0y.mongodb.net/sih-tracking?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri, {

})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// Use driver routes
app.use("/api/driver", driverRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
