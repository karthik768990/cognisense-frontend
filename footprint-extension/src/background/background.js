/* global chrome */
console.log('Digital Footprint background starting...');

let activeTabId = null;
let activeStart = null;
let paused = false;

let bufferedEvents = [];
const FLUSH_INTERVAL_MS = 25000;
const TWO_WEEKS_MS = 1000 * 60 * 60 * 24 * 14;
const MAX_EVENTS = 50000;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['events','settings'], (res) => {
    if (!res.events) chrome.storage.local.set({ events: [] });
    if (!res.settings) chrome.storage.local.set({ settings: { contentScanning: false, excludeList: [] } });
  });
  try {
    chrome.alarms.create('flushEvents', { periodInMinutes: 1 });
  } catch (e) { /* ignore */ }
});

function persistEvent(event) {
  if (!event.ts) event.ts = Date.now();
  bufferedEvents.push(event);
  if (bufferedEvents.length >= 200) flushBufferedEvents();
}

function flushBufferedEvents(callback) {
  if (!bufferedEvents.length) { if (callback) callback(); return; }
  const toAppend = bufferedEvents.slice();
  bufferedEvents = [];
  chrome.storage.local.get({ events: [] }, (res) => {
    try {
      const existing = (res.events || []).filter(e => (e.ts || 0) >= (Date.now() - TWO_WEEKS_MS));
      const merged = existing.concat(toAppend);
      const final = merged.length > MAX_EVENTS ? merged.slice(merged.length - MAX_EVENTS) : merged;
      chrome.storage.local.set({ events: final }, () => {
        if (chrome.runtime.lastError) {
          bufferedEvents = toAppend.concat(bufferedEvents);
        }
        if (typeof callback === 'function') callback();
      });
    } catch (err) {
      bufferedEvents = toAppend.concat(bufferedEvents);
      if (typeof callback === 'function') callback(err);
    }
  });
}

setInterval(() => { try { flushBufferedEvents(); } catch (e) {} }, FLUSH_INTERVAL_MS);

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm && alarm.name === 'flushEvents') flushBufferedEvents();
});

function stopActiveTimer() {
  if (!activeTabId || !activeStart) return;
  const durationMs = Date.now() - activeStart;
  chrome.tabs.get(activeTabId, (tab) => {
    if (chrome.runtime.lastError || !tab) { activeTabId = null; activeStart = null; return; }
    const ev = { type: 'session_end', url: tab.url, title: tab.title || '', duration: durationMs, ts: Date.now() };
    persistEvent(ev);
    activeTabId = null; activeStart = null;
  });
}

function handleSwitch(tab) {
  stopActiveTimer();
  if (!tab || !tab.url) return;
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;
  chrome.storage.local.get({ settings: { excludeList: [] } }, (res) => {
    const excludeList = (res.settings && res.settings.excludeList) ? res.settings.excludeList : [];
    const excluded = excludeList.some(p => p && tab.url.includes(p));
    if (excluded) { activeTabId = null; activeStart = null; return; }
    activeTabId = tab.id; activeStart = Date.now();
    persistEvent({ type: 'session_start', url: tab.url, title: tab.title||'', ts: Date.now() });
  });
}

chrome.tabs.onActivated.addListener(async (info) => {
  if (paused) return;
  try { const tab = await chrome.tabs.get(info.tabId); handleSwitch(tab); } catch (e) { stopActiveTimer(); }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (paused) return;
  if (windowId === chrome.windows.WINDOW_ID_NONE) stopActiveTimer();
  else chrome.tabs.query({ active: true, windowId }, (tabs) => { if (tabs[0]) handleSwitch(tabs[0]) });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (paused) return;
  if (tabId === activeTabId && changeInfo.status === 'complete') handleSwitch(tab);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResp) => {
  if (!msg || !msg.type) return;

  if (msg.type === 'pause') { paused = true; stopActiveTimer(); sendResp({ paused }); return true; }
  if (msg.type === 'resume') { paused = false; chrome.tabs.query({ active:true, currentWindow:true }, (tabs)=>{ if (tabs[0]) handleSwitch(tabs[0]) }); sendResp({ paused }); return true; }
  if (msg.type === 'getStatus') { sendResp({ paused }); return true; }

  if (msg.type === 'engagement') {
    const fromTab = sender.tab || {};
    const ev = { type: 'engagement', url: fromTab.url || msg.url || '', title: fromTab.title || '', data: msg.data || {}, ts: Date.now() };
    persistEvent(ev); sendResp({ ok:true }); return true;
  }

  if (msg.type === 'dumpText') {
    const fromTab = sender.tab || {};
    const ev = { type: 'page_text', url: fromTab.url || '', textSnippet: (msg.text || '').slice(0,1000), ts: Date.now() };
    persistEvent(ev); sendResp({ ok:true }); return true;
  }

  if (msg.type === 'sendToServer') {
    // Example placeholder: POST to backend with retry - kept optional and throttled.
    const payload = msg.payload;
    // keep minimal; backend URL should be set in options or environment
    const backend = msg.backendUrl || 'https://example.com/api/ingest'; 
    fetch(backend, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => sendResp({ ok: true })).catch(err => { sendResp({ ok: false, err: String(err) }) });
    return true;
  }
});

// flush when activated
self.addEventListener('activate', () => { flushBufferedEvents(); });
self.addEventListener('beforeunload', () => { try { flushBufferedEvents(); } catch (e) {} });
