import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [events, setEvents] = useState([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // Simulate fetching stored events from localStorage
    const stored = JSON.parse(localStorage.getItem("events") || "[]");
    setEvents(stored);
  }, []);

  const handlePauseToggle = () => {
    setPaused(!paused);
  };

  return (
    <div className="dashboard">
      <h1>🧭 Digital Footprint Tracker</h1>
      <p>Status: <strong>{paused ? "⏸️ Paused" : "▶️ Active"}</strong></p>
      <button onClick={handlePauseToggle}>
        {paused ? "Resume Tracking" : "Pause Tracking"}
      </button>

      <h2>Recent Activity</h2>
      {events.length === 0 ? (
        <p>No events recorded yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Title</th>
              <th>Type</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e, idx) => (
              <tr key={idx}>
                <td>{e.url}</td>
                <td>{e.title}</td>
                <td>{e.type}</td>
                <td>{new Date(e.ts).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
