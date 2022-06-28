import React from "react";
import TotalHarvest from "./TotalHarvest";
import LockToken from "./LockToken";
import LpTokens from "./LpTokens";
import "./index.css";

function SteakStake() {
  return (
    <div id="SteakStake">
      <TotalHarvest/>
      <LockToken/>
      <LpTokens/>
    </div>
  );
}

export default SteakStake;
