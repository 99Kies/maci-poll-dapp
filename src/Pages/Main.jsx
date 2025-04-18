import React, { useEffect } from "react";
import MaciPoll from "../Components/MaciPoll";

export default function Main() {
  return (
    <div className="fit-container fx-centered">
      <div style={{ width: "min(100%, 600px)" }}>
        <MaciPoll />
      </div>
    </div>
  );
}
