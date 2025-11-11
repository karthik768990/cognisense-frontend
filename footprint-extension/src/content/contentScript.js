// src/content/contentScript.js
(function () {
  'use strict';
  let engagement = { clicks: 0, keys: 0, scrolls: 0 };
  function isSensitiveInput(el) {
    if (!el) return false;
    const tag = (el.tagName || '').toLowerCase();
    const type = (el.type || '').toLowerCase();
    const ac = (el.autocomplete || '').toLowerCase();
    if (tag === 'input' && ['password', 'email', 'tel', 'number'].includes(type)) return true;
    if (ac && ac.includes('cc-')) return true;
    return false;
  }

  function safeSendMessage(msg, cb) {
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
        if (typeof cb === 'function') cb({ ok: false, reason: 'no-chrome' });
        return;
      }
      chrome.runtime.sendMessage(msg, function (resp) {
        if (chrome.runtime.lastError) {
          if (typeof cb === 'function') cb({ ok: false, reason: chrome.runtime.lastError.message });
        } else {
          if (typeof cb === 'function') cb(resp);
        }
      });
    } catch (err) {
      if (typeof cb === 'function') cb({ ok: false, reason: err && err.message });
    }
  }

  document.addEventListener('click', (ev) => { try { if (!isSensitiveInput(ev.target)) engagement.clicks++; } catch (e) {} }, { passive: true });
  document.addEventListener('keydown', (ev) => { try { const a = document.activeElement; if (!isSensitiveInput(a) && ev.key && ev.key.length === 1) engagement.keys++; } catch (e) {} }, { passive: true });
  let lastScroll = 0;
  window.addEventListener('scroll', () => { try { const now = Date.now(); if (now - lastScroll > 300) { engagement.scrolls++; lastScroll = now; } } catch (e) {} }, { passive: true });

  const FLUSH_MS = 10000;
  setInterval(() => {
    try {
      if (!engagement.clicks && !engagement.keys && !engagement.scrolls) return;
      const payload = { type: 'engagement', data: engagement };
      safeSendMessage(payload, (resp) => {
        // reset counts regardless to avoid runaway; could queue instead
        engagement = { clicks: 0, keys: 0, scrolls: 0 };
      });
    } catch (e) { /* ignore */ }
  }, FLUSH_MS);

  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(function (msg, sender, sendResp) {
        try {
          if (msg && msg.type === 'requestPageText') {
            let text = '';
            try { text = document.body && document.body.innerText ? String(document.body.innerText).slice(0, 50000) : ''; } catch (e) { text = ''; }
            try { sendResp({ text }); } catch (e) { /* ignore */ }
            return true;
          }
        } catch (e) {}
      });
    }
  } catch (e) {}
})();
