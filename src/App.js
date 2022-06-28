import Base from "./Layout/Base/Base";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SteakStake from "./Pages/Farms";
import Policy from "./Pages/Farms/policy";
import Disclamer from "./Pages/Farms/disclamer";
import Swap from "./Pages/Farms/swap";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Base>
          <Routes>
            <Route path="/" element={<SteakStake />} />
            <Route path="/policy" element={<Policy />} />
            <Route path="/Disclamer" element={<Disclamer/>} />
            <Route path="/swap" element={<Swap/>} />
          </Routes>
        </Base>
      </div>
    </BrowserRouter>
  );
}

export default App;
