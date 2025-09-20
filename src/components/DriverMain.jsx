import React, { useState, useEffect } from "react";
import DriverLogin from "./DriverLogin";
import DriverApp from "./DriverApp";

function DriverMain() {
    const [driverData, setDriverData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is already logged in
    useEffect(() => {
        const savedDriverData = localStorage.getItem("driverData");
        if (savedDriverData) {
            try {
                const parsedData = JSON.parse(savedDriverData);
                setDriverData(parsedData);
            } catch (err) {
                console.error("Error parsing saved driver data:", err);
                localStorage.removeItem("driverData");
            }
        }
        setIsLoading(false);
    }, []);

    const handleLoginSuccess = (data) => {
        setDriverData(data);
    };

    const handleLogout = () => {
        setDriverData(null);
    };

    if (isLoading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8f9fa",
                fontFamily: "Arial, sans-serif"
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{
                        width: "50px",
                        height: "50px",
                        border: "5px solid #e9ecef",
                        borderTop: "5px solid #007bff",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        margin: "0 auto 20px"
                    }}></div>
                    <p style={{ color: "#6c757d" }}>Loading...</p>
                </div>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <>
            {driverData ? (
                <DriverApp 
                    driverData={driverData} 
                    onLogout={handleLogout} 
                />
            ) : (
                <DriverLogin onLoginSuccess={handleLoginSuccess} />
            )}
        </>
    );
}

export default DriverMain;
