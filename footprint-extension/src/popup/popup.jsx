/* eslint-env browser */
/* global chrome */
import React, { useEffect, useState } from "react";
import "./popup.css";

function msToMin(ms) {
  return Math.round(ms / 60000);
}

const isChrome = typeof chrome !== "undefined" && !!chrome.runtime;

export default function Popup() {
  const [todayMin, setTodayMin] = useState(0);
  const [paused, setPaused] = useState(false);
  const [engScore, setEngScore] = useState(0);
  const [currentSite, setCurrentSite] = useState('');

  useEffect(() => {
    if (isChrome) {
      try {
        chrome.runtime.sendMessage({ type: "getStatus" }, (resp) => {
          if (resp && typeof resp.paused === "boolean") setPaused(resp.paused);
        });
      } catch (e) { /* ignore */ }
    }

    if (isChrome) {
      try {
        chrome.storage.local.get({ events: [] }, (res) => {
          const events = res.events || [];
          const startDay = new Date(); startDay.setHours(0,0,0,0);
          let totalMs = 0, clicks = 0, keys = 0, scrolls = 0;
          events.forEach((e) => {
            if (e.type === "session_end" && e.ts >= startDay.getTime()) totalMs += e.duration || 0;
            if (e.type === "engagement" && e.ts >= startDay.getTime()) {
              clicks += e.data?.clicks || 0;
              keys += e.data?.keys || 0;
              scrolls += e.data?.scrolls || 0;
            }
          });
          setTodayMin(msToMin(totalMs));
          setEngScore(Math.min(100, Math.round((clicks + keys + scrolls)/10)));
        });

        // also fetch active tab info for display
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0]) setCurrentSite(new URL(tabs[0].url || '').hostname || '');
        });
      } catch (e) { /* ignore */ }
    }
  }, []);

  const togglePause = () => {
    if (!isChrome) return setPaused(p => !p);
    const action = paused ? "resume" : "pause";
    try {
      chrome.runtime.sendMessage({ type: action }, (resp) => { setPaused(resp?.paused || false); });
    } catch (e) { /* ignore */ }
  };

  const openOptions = () => {
    if (!isChrome) return window.open('options/index.html', '_blank');
    try {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage(() => {
          if (chrome.runtime.lastError) window.open(chrome.runtime.getURL('options/index.html'));
        });
      } else {
        window.open(chrome.runtime.getURL('options/index.html'));
      }
    } catch (e) { try { window.open(chrome.runtime.getURL('options/index.html')); } catch(_){} }
  };

  const openDashboard = () => {
    const url = 'https://example.com/your-dashboard';
    if (!isChrome) return window.open(url, '_blank');
    chrome.tabs.create({ url });
  };

  return (
    <div className="popup">
      <header className="pf-header">
        <div className="logo">🦶</div>
        <div>
          <h1>Digital Footprint</h1>
          <div className="subtitle">{currentSite || '—'}</div>
        </div>
      </header>

      <div className="cards">
        <div className="card">
          <div className="title">Today</div>
          <div className="value">{todayMin} min</div>
        </div>
        <div className="card">
          <div className="title">Engagement</div>
          <div className="value">{engScore} / 100</div>
        </div>
      </div>

      <div className="controls">
        <button className="primary" onClick={togglePause}>{paused ? 'Resume Tracking' : 'Pause Tracking'}</button>
        <div className="secondary-row">
          <button className="link" onClick={openOptions}>Options</button>
          <button className="link" onClick={openDashboard}>Dashboard</button>
        </div>
      </div>

      <footer className="pf-footer">
        <small>Data stored locally. Text scanning off by default.</small>
      </footer>
    </div>
  );
}
