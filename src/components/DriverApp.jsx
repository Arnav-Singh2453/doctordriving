import React, { useEffect, useState, useRef } from "react";

function DriverApp() {
    const [busId] = useState("BUS123"); // hardcoded for demo
    const [routeId] = useState("ROUTE5"); // assign route
    const [location, setLocation] = useState({ lat: null, lng: null });
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [updateCount, setUpdateCount] = useState(0);
    
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
                    busId,
                    latitude: lat,
                    longitude: lng,
                    routeId
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
                    timeout: 10000 
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

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h2>🚍 Driver App</h2>
            <div style={{ marginBottom: "20px" }}>
                <p><strong>Bus ID:</strong> {busId}</p>
                <p><strong>Route:</strong> {routeId}</p>
            </div>
            
            <div style={{ marginBottom: "20px" }}>
                <button 
                    onClick={isTracking ? stopTracking : startTracking}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: isTracking ? "#dc3545" : "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "16px"
                    }}
                >
                    {isTracking ? "🛑 Stop Tracking" : "▶️ Start Tracking"}
                </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <p><strong>Status:</strong> 
                    <span style={{ 
                        color: isTracking ? "#28a745" : "#6c757d",
                        marginLeft: "10px"
                    }}>
                        {isTracking ? "🟢 Tracking Active" : "🔴 Tracking Stopped"}
                    </span>
                </p>
                <p><strong>Updates Sent:</strong> {updateCount}</p>
                <p><strong>Last Update:</strong> {lastUpdate || "Never"}</p>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <p><strong>Current Location:</strong></p>
                <p><strong>Latitude:</strong> {location.lat ? location.lat.toFixed(6) : "Not available"}</p>
                <p><strong>Longitude:</strong> {location.lng ? location.lng.toFixed(6) : "Not available"}</p>
            </div>

            {error && (
                <div style={{
                    backgroundColor: "#f8d7da",
                    color: "#721c24",
                    padding: "10px",
                    borderRadius: "5px",
                    marginTop: "10px"
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div style={{ 
                marginTop: "20px", 
                padding: "10px", 
                backgroundColor: "#f8f9fa", 
                borderRadius: "5px",
                fontSize: "14px"
            }}>
                <p><strong>Instructions:</strong></p>
                <ul>
                    <li>Click "Start Tracking" to begin GPS location updates</li>
                    <li>Location updates every 0.5 seconds automatically</li>
                    <li>Make sure to allow location permissions in your browser</li>
                    <li>Location data is sent to the backend server</li>
                </ul>
            </div>
        </div>
    );
}

export default DriverApp;