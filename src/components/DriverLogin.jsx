import React, { useState } from "react";

function DriverLogin({ onLoginSuccess }) {
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            console.log("🔐 Attempting login for vehicle:", vehicleNumber);
            
            const response = await fetch("http://localhost:3001/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    vehicleNumber: vehicleNumber.toUpperCase(),
                    password: password,
                }),
            });

            const data = await response.json();

            if (data.success) {
                console.log("✅ Login successful:", data.driver);
                localStorage.setItem("driverData", JSON.stringify(data.driver));
                onLoginSuccess(data.driver);
            } else {
                setError(data.message || "Login failed");
            }
        } catch (err) {
            console.error("❌ Login error:", err);
            setError("Connection error. Please check if the server is running.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f8f9fa",
            fontFamily: "Arial, sans-serif"
        }}>
            <div style={{
                backgroundColor: "white",
                padding: "40px",
                borderRadius: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                width: "100%",
                maxWidth: "400px"
            }}>
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                    <h1 style={{ color: "#2c3e50", marginBottom: "10px" }}>
                        🚍 Driver Login
                    </h1>
                    <p style={{ color: "#6c757d", margin: "0" }}>
                        Enter your credentials to access the dashboard
                    </p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "bold",
                            color: "#2c3e50"
                        }}>
                            Vehicle Number
                        </label>
                        <input
                            type="text"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value)}
                            placeholder="Enter vehicle number (e.g., DL01AB1234)"
                            required
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: "2px solid #e9ecef",
                                borderRadius: "5px",
                                fontSize: "16px",
                                boxSizing: "border-box",
                                textTransform: "uppercase",
                                color: "black"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#007bff"}
                            onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                        />
                    </div>

                    <div style={{ marginBottom: "25px" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "bold",
                            color: "#2c3e50"
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            style={{
                                width: "100%",
                                padding: "12px",
                                border: "2px solid #e9ecef",
                                borderRadius: "5px",
                                fontSize: "16px",
                                boxSizing: "border-box",
                                color: "black"
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#007bff"}
                            onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                        />
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: "#f8d7da",
                            color: "#721c24",
                            padding: "12px",
                            borderRadius: "5px",
                            marginBottom: "20px",
                            border: "1px solid #f5c6cb"
                        }}>
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: "100%",
                            padding: "15px",
                            backgroundColor: isLoading ? "#6c757d" : "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            transition: "background-color 0.3s"
                        }}
                        onMouseOver={(e) => {
                            if (!isLoading) e.target.style.backgroundColor = "#0056b3";
                        }}
                        onMouseOut={(e) => {
                            if (!isLoading) e.target.style.backgroundColor = "#007bff";
                        }}
                    >
                        {isLoading ? "🔄 Logging in..." : "🚀 Login"}
                    </button>
                </form>

                <div style={{
                    marginTop: "30px",
                    padding: "15px",
                    backgroundColor: "#e9ecef",
                    borderRadius: "5px",
                    fontSize: "14px",
                    color: "#6c757d"
                }}>
                    <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
                        📝 Demo Credentials:
                    </p>
                    <p style={{ margin: "5px 0" }}>Vehicle: <strong>DL01AB1234</strong></p>
                    <p style={{ margin: "5px 0" }}>Password: <strong>1234</strong></p>
                    <p style={{ margin: "10px 0 0 0", fontSize: "12px" }}>
                        Contact admin to register your vehicle
                    </p>
                </div>
            </div>
        </div>
    );
}

export default DriverLogin;
