import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

function Client() {
    const [buses, setBuses] = useState([]);

    useEffect(() => {
        const fetchBuses = async () => {
            const res = await fetch("http://localhost:5000/api/driver/route/ROUTE5");
            const data = await res.json();
            setBuses(data);
        };

        fetchBuses();
        const interval = setInterval(fetchBuses, 5000); // update every 5s
        return () => clearInterval(interval);
    }, []);

    return (
        <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: "100vh", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {buses.map(bus => (
                <Marker key={bus.busId} position={[bus.latitude, bus.longitude]}>
                    <Popup>Bus {bus.busId} on Route {bus.routeId}</Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}

export default Client;