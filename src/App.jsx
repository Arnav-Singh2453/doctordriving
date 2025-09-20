
import { Routes, Route } from "react-router-dom";
import './App.css'
import DriverApp from "./components/DriverApp.jsx";
import {Link} from 'react-router-dom'


function App() {


  return (
    <>
        <Routes>
            <Route path="/" element={<DriverApp/>} />

        </Routes>    </>
  )
}

export default App
