import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./options.css";

function OptionsApp() {
  const [settings, setSettings] = useState({ contentScanning: false, excludeList: [], categories: {} });

  useEffect(() => {
    try {
      chrome.storage.local.get({ settings: { contentScanning: false, excludeList: [], categories: {} } }, (res) => {
        setSettings(res.settings);
      });
    } catch (e) {
      // dev fallback
    }
  }, []);

  function save() {
    try {
      chrome.storage.local.set({ settings });
    } catch (e) { /* ignore */ }
  }

  function toggleContentScan() {
    setSettings(s => ({ ...s, contentScanning: !s.contentScanning }));
  }

  return (
    <div style={{ padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1>Options</h1>
      <label style={{ display:'block', margin:'8px 0' }}>
        <input type="checkbox" checked={settings.contentScanning} onChange={toggleContentScan} /> Enable content scanning (opt-in)
      </label>
      <p>Exclude list (comma-separated host substrings):</p>
      <textarea
        value={(settings.excludeList || []).join(',')}
        onChange={(e)=> setSettings(s => ({ ...s, excludeList: String(e.target.value).split(',').map(x=>x.trim()).filter(Boolean) })) }
        rows={3}
        style={{ width: '100%' }}
      />
      <div style={{ marginTop: 12 }}>
        <button onClick={save} style={{ padding: '8px 12px', borderRadius: 8 }}>Save</button>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<OptionsApp />);
