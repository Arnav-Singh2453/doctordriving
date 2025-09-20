import express from "express";
import mongoose from "mongoose";

const app = express();

const uri = "mongodb+srv://bora:arnav@cluster0.viblu0y.mongodb.net/sih-tracking?retryWrites=true&w=majority&appName=Cluster0";

// Connect MongoDB
mongoose.connect(uri)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.error("❌ MongoDB Error:", err.message);

    });

// Middleware
app.use(express.json());

// Example route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});