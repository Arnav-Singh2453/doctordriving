import mongoose from "mongoose";

const driverSchema = new mongoose.Schema({
    vehicleNumber: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        uppercase: true
    },
    password: { 
        type: String, 
        required: true,
        minlength: 4
    },
    driverName: { 
        type: String, 
        required: true,
        trim: true
    },
    routeId: { 
        type: String, 
        required: true 
    },
    contactNumber: { 
        type: String, 
        required: true 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    lastLogin: { 
        type: Date, 
        default: null 
    }
});

export default mongoose.model("Driver", driverSchema);
