import React, { useEffect, useState, useRef, useMemo } from "react";

// Map and route analytics functionality
const useMapAndAnalytics = (currentLocation, driverData, locationHistory) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const driverMarkerRef = useRef(null);
    const [mapReady, setMapReady] = useState(false);
    const [routeAnalytics, setRouteAnalytics] = useState({
        speed: 0,
        distanceTraveled: 0,
        nextStop: null,
        estimatedTime: 0
    });

    // Tumkur to Bangalore route coordinates (real route via NH4/NH44)
    const tumkurBangaloreRoute = useMemo(() => [
        [13.3422, 77.1000], // Tumkur
        [13.3400, 77.1200], // Tumkur outskirts
        [13.3350, 77.1500], // Sira Road
        [13.3300, 77.1800], // Madhugiri Road
        [13.3250, 77.2100], // Dobaspet
        [13.0900, 77.5500], // Nelamangala
        [13.0800, 77.5800], // Jalahalli
        [13.0700, 77.6000], // Peenya
        [13.0600, 77.6200], // Yeshwantpur
        [12.9716, 77.5946]  // Bangalore (Majestic)
    ], []);

    // Bus stops along the route
    const busStops = useMemo(() => [
        { name: "Tumkur Bus Stand", coords: [13.3422, 77.1000], id: "tumkur" },
        { name: "Sira Road Junction", coords: [13.3350, 77.1500], id: "sira" },
        { name: "Madhugiri Road", coords: [13.3300, 77.1800], id: "madhugiri" },
        { name: "Dobaspet", coords: [13.3250, 77.2100], id: "dobaspet" },
        { name: "Nelamangala", coords: [13.0900, 77.5500], id: "nelamangala" },
        { name: "Jalahalli Cross", coords: [13.0800, 77.5800], id: "jalahalli" },
        { name: "Peenya Industrial Area", coords: [13.0700, 77.6000], id: "peenya" },
        { name: "Yeshwantpur", coords: [13.0600, 77.6200], id: "yeshwantpur" },
        { name: "Bangalore Majestic", coords: [12.9716, 77.5946], id: "majestic" }
    ], []);

    // Load external scripts and initialize map
    useEffect(() => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        const initializeMap = () => {
            attempts++;
            
            if (typeof window.L !== 'undefined' && typeof window.turf !== 'undefined') {
                console.log('✅ Leaflet and Turf.js loaded successfully');
                setMapReady(true);
                return;
            }
            
            if (attempts < maxAttempts) {
                // Check again after a short delay
                setTimeout(initializeMap, 100);
            } else {
                console.error('❌ Failed to load Leaflet or Turf.js after 5 seconds');
            }
        };
        
        initializeMap();
    }, []);

    // Initialize map when ready
    useEffect(() => {
        if (!mapReady || !mapRef.current || mapInstanceRef.current) return;

        console.log('🗺️ Initializing map...');
        console.log('Map container:', mapRef.current);
        console.log('Leaflet available:', typeof window.L !== 'undefined');
        
        try {
            // Initialize Leaflet map
            const map = window.L.map(mapRef.current).setView([13.2, 77.3], 9);

        // Add OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add route polyline
        const routeLine = window.L.polyline(tumkurBangaloreRoute, {
            color: '#007bff',
            weight: 5,
            opacity: 0.8
        }).addTo(map);

        // Add bus stops
        busStops.forEach(stop => {
            const stopIcon = window.L.divIcon({
                html: `<div style="
                    background-color: #dc3545;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>`,
                className: 'bus-stop-marker',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });

            window.L.marker(stop.coords, { icon: stopIcon })
                .addTo(map)
                .bindPopup(`<strong>🚏 ${stop.name}</strong><br/>Bus Stop`);
        });

            // Fit map to route bounds
            map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });

            // Store references
            mapInstanceRef.current = map;

            console.log('✅ Map initialized successfully');
            
            // Force a resize after a short delay to ensure proper rendering
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
            
        } catch (error) {
            console.error('❌ Error initializing map:', error);
        }
    }, [mapReady, tumkurBangaloreRoute, busStops]);

    // Update driver location on map
    useEffect(() => {
        if (!mapInstanceRef.current || !currentLocation.lat || !currentLocation.lng) return;

        const map = mapInstanceRef.current;
        const { lat, lng } = currentLocation;

        // Remove existing driver marker
        if (driverMarkerRef.current) {
            map.removeLayer(driverMarkerRef.current);
        }

        // Create custom driver icon
        const driverIcon = window.L.divIcon({
            html: `<div style="
                background: linear-gradient(45deg, #28a745, #20c997);
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 3px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                animation: pulse 2s infinite;
            ">🚍</div>
            <style>
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
            </style>`,
            className: 'driver-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        // Add new driver marker
        const driverMarker = window.L.marker([lat, lng], { icon: driverIcon })
            .addTo(map)
            .bindPopup(`
                <div style="text-align: center; min-width: 200px;">
                    <h4 style="margin: 0 0 10px 0; color: #28a745;">🚍 ${driverData.driverName}</h4>
                    <p style="margin: 5px 0;"><strong>Vehicle:</strong> ${driverData.vehicleNumber}</p>
                    <p style="margin: 5px 0;"><strong>Route:</strong> ${driverData.routeId}</p>
                    <p style="margin: 5px 0; font-size: 12px; color: #666;">
                        📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}
                    </p>
                </div>
            `);

        driverMarkerRef.current = driverMarker;

        // Add location to history
        const locationPoint = {
            lat,
            lng,
            timestamp: Date.now()
        };
        
        // Keep only last 10 locations for performance
        if (locationHistory.length >= 10) {
            locationHistory.shift();
        }
        locationHistory.push(locationPoint);

    }, [currentLocation, driverData, locationHistory]);

    // Calculate route analytics using Turf.js
    useEffect(() => {
        if (!window.turf || !currentLocation.lat || locationHistory.length < 2) return;

        try {
            const currentPoint = window.turf.point([currentLocation.lng, currentLocation.lat]);
            const routeLineString = window.turf.lineString(tumkurBangaloreRoute.map(coord => [coord[1], coord[0]]));
            
            // Find nearest point on route
            const nearestPoint = window.turf.nearestPointOnLine(routeLineString, currentPoint);
            
            // Calculate distance traveled (from start of route to current position)
            const routeStart = window.turf.point([tumkurBangaloreRoute[0][1], tumkurBangaloreRoute[0][0]]);
            const distanceTraveled = window.turf.distance(routeStart, nearestPoint, { units: 'kilometers' });
            
            // Calculate speed if we have recent location history
            let speed = 0;
            if (locationHistory.length >= 2) {
                const lastLocation = locationHistory[locationHistory.length - 2];
                const currentTime = Date.now();
                const lastTime = lastLocation.timestamp || (currentTime - 500);
                
                const timeDiff = (currentTime - lastTime) / 1000 / 3600; // hours
                const lastPoint = window.turf.point([lastLocation.lng, lastLocation.lat]);
                const distance = window.turf.distance(lastPoint, currentPoint, { units: 'kilometers' });
                
                if (timeDiff > 0 && distance > 0) {
                    speed = distance / timeDiff; // km/h
                }
            }
            
            // Find next bus stop
            let nextStop = null;
            let minDistance = Infinity;
            
            busStops.forEach(stop => {
                const stopPoint = window.turf.point([stop.coords[1], stop.coords[0]]);
                const distance = window.turf.distance(currentPoint, stopPoint, { units: 'kilometers' });
                
                if (distance < minDistance && distance > 0.05) { // Only consider stops > 50m away
                    minDistance = distance;
                    nextStop = {
                        ...stop,
                        distance: distance
                    };
                }
            });
            
            // Calculate ETA to next stop
            let estimatedTime = 0;
            if (nextStop && speed > 1) { // Only calculate if moving at reasonable speed
                estimatedTime = (nextStop.distance / speed) * 60; // minutes
            }
            
            setRouteAnalytics({
                speed: Math.max(0, Math.round(speed)),
                distanceTraveled: distanceTraveled.toFixed(1),
                nextStop,
                estimatedTime: Math.round(estimatedTime)
            });
            
        } catch (error) {
            console.error('Error calculating route analytics:', error);
        }
    }, [currentLocation, locationHistory, tumkurBangaloreRoute, busStops]);

    return {
        mapRef,
        mapInstanceRef,
        driverMarkerRef,
        mapReady,
        setMapReady,
        routeAnalytics,
        setRouteAnalytics,
        tumkurBangaloreRoute,
        busStops
    };
};

function DriverApp({ driverData, onLogout }) {
    const [location, setLocation] = useState({ lat: null, lng: null });
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [updateCount, setUpdateCount] = useState(0);
    const [rideStarted, setRideStarted] = useState(false);
    const [locationHistory, setLocationHistory] = useState([]);
    
    const intervalRef = useRef(null);
    const watchIdRef = useRef(null);
    
    // Initialize map functionality
    const mapData = useMapAndAnalytics(location, driverData, locationHistory);

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
            const newLocation = { lat: initialLocation.latitude, lng: initialLocation.longitude };
            setLocation(newLocation);
            
            // Add to location history
            setLocationHistory(prev => [...prev, {
                ...newLocation,
                timestamp: Date.now()
            }]);
            
            console.log("📍 Initial location obtained, sending to backend...");
            await sendLocation(initialLocation.latitude, initialLocation.longitude);

            // Set up interval to update every 0.5 seconds
            console.log("⏰ Setting up 0.5s interval for location updates...");
            intervalRef.current = setInterval(async () => {
                try {
                    const currentLocationData = await getCurrentLocation();
                    const newLocation = { lat: currentLocationData.latitude, lng: currentLocationData.longitude };
                    setLocation(newLocation);
                    
                    // Add to location history
                    setLocationHistory(prev => {
                        const updated = [...prev, {
                            ...newLocation,
                            timestamp: Date.now()
                        }];
                        // Keep only last 10 locations for performance
                        return updated.length > 10 ? updated.slice(-10) : updated;
                    });
                    
                    await sendLocation(currentLocationData.latitude, currentLocationData.longitude);
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

                {/* Map Card */}
                {rideStarted && (
                    <div style={{
                        backgroundColor: "white",
                        padding: "20px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        marginBottom: "20px"
                    }}>
                        <h3 style={{ margin: "0 0 15px 0", color: "black" }}>🗺️ Live Route Map</h3>
                        
                        {/* Map Container */}
                        <div style={{ position: 'relative', height: '400px', width: '100%', marginBottom: '15px' }}>
                            {/* Add Leaflet CSS fix */}
                            <style>{`
                                .leaflet-container {
                                    height: 400px !important;
                                    width: 100% !important;
                                }
                                .leaflet-tile {
                                    max-width: none !important;
                                }
                                .leaflet-tile-container {
                                    margin: 0 !important;
                                }
                            `}</style>
                            <div 
                                ref={mapData.mapRef} 
                                style={{ 
                                    height: '400px', 
                                    width: '100%', 
                                    borderRadius: '8px',
                                    border: '2px solid #e9ecef',
                                    backgroundColor: '#f8f9fa',
                                    position: 'relative',
                                    zIndex: 1
                                }}
                            />
                            
                            {/* Analytics Overlay */}
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                padding: '15px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                minWidth: '200px',
                                fontSize: '14px',
                                color: 'black'
                            }}>
                                <h4 style={{ margin: '0 0 10px 0', color: 'black', fontSize: '16px' }}>📊 Route Analytics</h4>
                                
                                <div style={{ marginBottom: '8px' }}>
                                    <strong>Speed:</strong> {mapData.routeAnalytics.speed} km/h
                                </div>
                                
                                <div style={{ marginBottom: '8px' }}>
                                    <strong>Distance:</strong> {mapData.routeAnalytics.distanceTraveled} km
                                </div>
                                
                                {mapData.routeAnalytics.nextStop && (
                                    <>
                                        <div style={{ marginBottom: '8px' }}>
                                            <strong>Next Stop:</strong><br/>
                                            <span style={{ fontSize: '12px' }}>{mapData.routeAnalytics.nextStop.name}</span>
                                        </div>
                                        
                                        <div style={{ marginBottom: '8px' }}>
                                            <strong>Distance to Stop:</strong><br/>
                                            {mapData.routeAnalytics.nextStop.distance.toFixed(1)} km
                                        </div>
                                        
                                        {mapData.routeAnalytics.estimatedTime > 0 && (
                                            <div>
                                                <strong>ETA:</strong> {mapData.routeAnalytics.estimatedTime} min
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            
                                {/* Loading indicator */}
                                {!mapData.mapReady && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        color: 'black',
                                        zIndex: 1000,
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                    }}>
                                        <div style={{ marginBottom: '10px', fontSize: '16px' }}>🗺️ Loading Map...</div>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                                            Initializing OpenStreetMap & Route Analytics
                                        </div>
                                        <div style={{ 
                                            width: '30px', 
                                            height: '3px', 
                                            backgroundColor: '#007bff', 
                                            borderRadius: '2px',
                                            margin: '0 auto',
                                            animation: 'pulse 1.5s infinite'
                                        }}></div>
                                    </div>
                                )}
                        </div>
                        
                        {/* Location Details */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginTop: "15px" }}>
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
                            marginTop: "15px", 
                            padding: "10px", 
                            backgroundColor: "#e7f3ff", 
                            borderRadius: "5px",
                            fontSize: "14px",
                            color: "black",
                            border: "1px solid #b3d9ff"
                        }}>
                            📡 <strong>Live Tracking:</strong> Tumkur to Bangalore route • Updates every 0.5 seconds • Real-time speed & ETA calculations
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