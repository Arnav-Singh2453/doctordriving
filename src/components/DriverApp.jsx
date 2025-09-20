import React, { useEffect, useState, useRef } from "react";

function DriverApp({ driverData, onLogout }) {
    const [location, setLocation] = useState({ lat: null, lng: null });
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [updateCount, setUpdateCount] = useState(0);
    const [rideStarted, setRideStarted] = useState(false);
    
    const intervalRef = useRef(null);
    const watchIdRef = useRef(null);

    // Function to send location to backend
    const sendLocation = async (lat, lng) => {
        try {
            console.log("🔄 Sending location to backend:", { lat, lng });
            const res = await fetch("http://localhost:3001/api/driver/update-location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vehicleNumber: driverData.vehicleNumber,
                    busId: driverData.vehicleNumber,
                    latitude: lat,
                    longitude: lng,
                    routeId: driverData.routeId,
                    driverName: driverData.driverName
                })
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
            }
            
            const data = await res.json();
            console.log("✅ Location updated:", data);
            setLastUpdate(new Date().toLocaleTimeString());
            setUpdateCount(prev => prev + 1);
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error("❌ Error sending location:", err);
            setError(`Failed to update location: ${err.message}`);
        }
    };

    // Function to get current location
    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation not supported by this browser"));
                return;
            }

            console.log("🔄 Getting current location...");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    console.log("✅ GPS position obtained:", { latitude, longitude, accuracy });
                    resolve({ latitude, longitude });
                },
                (error) => {
                    let errorMessage = "Unknown GPS error";
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "Location access denied. Please allow location permissions in your browser.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Location information unavailable. Please check your GPS settings.";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "Location request timed out. Please try again.";
                            break;
                        default:
                            errorMessage = `GPS error: ${error.message}`;
                    }
                    console.error("❌ GPS Error:", errorMessage);
                    reject(new Error(errorMessage));
                },
                { 
                    enableHighAccuracy: true, 
                    maximumAge: 1000, // Accept cached location up to 1 second old
                    timeout: 500 
                }
            );
        });
    };

    // Start tracking with 0.5 second intervals
    const startTracking = async () => {
        try {
            console.log("🚀 Starting GPS tracking...");
            setError(null);
            setIsTracking(true);
            
            // Get initial location
            console.log("📍 Getting initial location...");
            const initialLocation = await getCurrentLocation();
            setLocation({ lat: initialLocation.latitude, lng: initialLocation.longitude });
            console.log("📍 Initial location obtained, sending to backend...");
            await sendLocation(initialLocation.latitude, initialLocation.longitude);

            // Set up interval to update every 0.5 seconds
            console.log("⏰ Setting up 0.5s interval for location updates...");
            intervalRef.current = setInterval(async () => {
                try {
                    const currentLocation = await getCurrentLocation();
                    setLocation({ lat: currentLocation.latitude, lng: currentLocation.longitude });
                    await sendLocation(currentLocation.latitude, currentLocation.longitude);
                } catch (err) {
                    console.error("Error getting location in interval:", err);
                    setError(`Location error: ${err.message}`);
                }
            }, 500); // 0.5 seconds = 500ms

            console.log("✅ GPS tracking started successfully!");

        } catch (err) {
            console.error("❌ Error starting tracking:", err);
            setError(`Failed to start tracking: ${err.message}`);
            setIsTracking(false);
        }
    };

    // Stop tracking
    const stopTracking = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsTracking(false);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopTracking();
        };
    }, []);

    // Handle logout
    const handleLogout = async () => {
        if (isTracking) {
            stopTracking();
            // Stop tracking on server
            try {
                await fetch("http://localhost:3001/api/driver/stop-tracking", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ vehicleNumber: driverData.vehicleNumber })
                });
            } catch (err) {
                console.error("Error stopping tracking on server:", err);
            }
        }
        localStorage.removeItem("driverData");
        onLogout();
    };

    // Start ride function
    const startRide = () => {
        setRideStarted(true);
        startTracking();
    };

    // End ride function
    const endRide = async () => {
        setRideStarted(false);
        stopTracking();
        // Stop tracking on server
        try {
            await fetch("http://localhost:3001/api/driver/stop-tracking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vehicleNumber: driverData.vehicleNumber })
            });
        } catch (err) {
            console.error("Error stopping tracking on server:", err);
        }
    };

    return (
        <div style={{ 
            minHeight: "100vh", 
            backgroundColor: "#f8f9fa", 
            fontFamily: "Arial, sans-serif" 
        }}>
            {/* Header */}
            <div style={{
                backgroundColor: "#2c3e50",
                color: "white",
                padding: "20px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ margin: "0 0 5px 0" }}>🚍 Driver Dashboard</h1>
                        <p style={{ margin: "0", opacity: "0.8" }}>
                            Hello, <strong>{driverData.driverName}</strong>!
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: "10px 15px",
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer"
                        }}
                    >
                        🚪 Logout
                    </button>
                </div>
            </div>

            <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
                {/* Vehicle Info Card */}
                <div style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    marginBottom: "20px"
                }}>
                    <h3 style={{ margin: "0 0 15px 0", color: "black" }}>🚗 Vehicle Information</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                        <div>
                            <p style={{ margin: "5px 0", color: "black" }}><strong>Vehicle Number:</strong> {driverData.vehicleNumber}</p>
                            <p style={{ margin: "5px 0", color: "black" }}><strong>Driver Name:</strong> {driverData.driverName}</p>
                        </div>
                        <div>
                            <p style={{ margin: "5px 0", color: "black" }}><strong>Route ID:</strong> {driverData.routeId}</p>
                            <p style={{ margin: "5px 0", color: "black" }}><strong>Contact:</strong> {driverData.contactNumber}</p>
                        </div>
                    </div>
                </div>
                
                {/* Ride Control Card */}
                <div style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    marginBottom: "20px"
                }}>
                    <h3 style={{ margin: "0 0 15px 0", color: "black" }}>🎯 Ride Control</h3>
                    
                    {!rideStarted ? (
                        <div style={{ textAlign: "center" }}>
                            <p style={{ marginBottom: "15px", color: "black" }}>
                                Ready to start your ride? Click below to begin GPS tracking.
                            </p>
                            <button
                                onClick={startRide}
                                style={{
                                    padding: "15px 30px",
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                                }}
                            >
                                🚀 Start Ride
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div style={{ 
                                textAlign: "center", 
                                marginBottom: "20px",
                                padding: "10px",
                                backgroundColor: "#d4edda",
                                borderRadius: "5px",
                                border: "1px solid #c3e6cb"
                            }}>
                                <p style={{ margin: "0", color: "#155724", fontWeight: "bold" }}>
                                    🟢 Ride in Progress - GPS Tracking Active
                                </p>
                            </div>
                            
                            <button
                                onClick={endRide}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    backgroundColor: "#dc3545",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    fontSize: "16px",
                                    cursor: "pointer"
                                }}
                            >
                                🛑 End Ride
                            </button>
                        </div>
                    )}
                </div>

                {/* Status Card */}
                <div style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    marginBottom: "20px"
                }}>
                    <h3 style={{ margin: "0 0 15px 0", color: "black" }}>📊 Status Information</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                        <div>
                            <p style={{ margin: "5px 0", color: "black" }}>
                                <strong>Ride Status:</strong> 
                                <span style={{ 
                                    color: rideStarted ? "#28a745" : "#6c757d",
                                    marginLeft: "5px"
                                }}>
                                    {rideStarted ? "🟢 Active" : "🔴 Stopped"}
                                </span>
                            </p>
                            <p style={{ margin: "5px 0", color: "black" }}>
                                <strong>GPS Status:</strong> 
                                <span style={{ 
                                    color: isTracking ? "#28a745" : "#6c757d",
                                    marginLeft: "5px"
                                }}>
                                    {isTracking ? "🟢 Tracking" : "🔴 Inactive"}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p style={{ margin: "5px 0", color: "black" }}><strong>Updates Sent:</strong> {updateCount}</p>
                            <p style={{ margin: "5px 0", color: "black" }}><strong>Last Update:</strong> {lastUpdate || "Never"}</p>
                        </div>
                    </div>
                </div>

                {/* Location Card */}
                {rideStarted && (
                    <div style={{
                        backgroundColor: "white",
                        padding: "20px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        marginBottom: "20px"
                    }}>
                        <h3 style={{ margin: "0 0 15px 0", color: "black" }}>📍 Current Location</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                            <div>
                                <p style={{ margin: "5px 0", color: "black" }}>
                                    <strong>Latitude:</strong> {location.lat ? location.lat.toFixed(6) : "Getting location..."}
                                </p>
                            </div>
                            <div>
                                <p style={{ margin: "5px 0", color: "black" }}>
                                    <strong>Longitude:</strong> {location.lng ? location.lng.toFixed(6) : "Getting location..."}
                                </p>
                            </div>
                        </div>
                        <div style={{ 
                            marginTop: "10px", 
                            padding: "10px", 
                            backgroundColor: "#e9ecef", 
                            borderRadius: "5px",
                            fontSize: "14px",
                            color: "black"
                        }}>
                            📡 Location updates every 0.5 seconds while ride is active
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div style={{
                        backgroundColor: "#f8d7da",
                        color: "#721c24",
                        padding: "15px",
                        borderRadius: "10px",
                        marginBottom: "20px",
                        border: "1px solid #f5c6cb"
                    }}>
                        <h4 style={{ margin: "0 0 10px 0" }}>⚠️ Error</h4>
                        <p style={{ margin: "0" }}>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DriverApp;