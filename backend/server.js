import express from "express";
import mongoose from "mongoose";
import driverRoutes from "./routes/driver.js";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Atlas connection
const uri = "mongodb+srv://bora:arnav@cluster0.viblu0y.mongodb.net/sih-tracking?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(uri, {

})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// Root route for testing
app.get("/", (req, res) => {
    res.json({ message: "🚀 Server is running!", status: "OK" });
});

// Use driver routes
app.use("/api/driver", driverRoutes);

const PORT = 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
