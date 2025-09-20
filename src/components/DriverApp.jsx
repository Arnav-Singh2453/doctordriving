import React, { useEffect, useState } from "react";

function DriverApp() {
    const [busId] = useState("BUS123"); // hardcoded for demo
    const [routeId] = useState("ROUTE5"); // assign route
    const [location, setLocation] = useState({ lat: null, lng: null });

    // Function to send location to backend
    const sendLocation = async (lat, lng) => {
        try {
            const res = await fetch("http://localhost:5000/api/driver/update-location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    busId,
                    latitude: lat,
                    longitude: lng,
                    routeId
                })
            });
            const data = await res.json();
            console.log("✅ Location updated:", data);
        } catch (err) {
            console.error("❌ Error sending location:", err);
        }
    };

    // Watch GPS continuously
    useEffect(() => {
        if (navigator.geolocation) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setLocation({ lat: latitude, lng: longitude });
                    sendLocation(latitude, longitude);
                },
                (err) => console.error("Geolocation error:", err),
                { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
            );

            return () => navigator.geolocation.clearWatch(watchId);
        } else {
            alert("Geolocation not supported");
        }
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h2>🚍 Driver App</h2>
            <p><strong>Bus ID:</strong> {busId}</p>
            <p><strong>Route:</strong> {routeId}</p>
            <p><strong>Latitude:</strong> {location.lat}</p>
            <p><strong>Longitude:</strong> {location.lng}</p>
        </div>
    );
}

export default DriverApp;