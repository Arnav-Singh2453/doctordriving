
import { Routes, Route } from "react-router-dom";
import './App.css'
import DriverMain from "./components/DriverMain.jsx";

function App() {
  return (
    <>
        <Routes>
            <Route path="/" element={<DriverMain/>} />
        </Routes>
    </>
  )
}

export default App
