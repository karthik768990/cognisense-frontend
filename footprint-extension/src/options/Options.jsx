// import React, { useEffect, useState } from 'react'

// export default function Options() {
//   const [contentScanning, setContentScanning] = useState(false)
//   const [excludeText, setExcludeText] = useState('')
//   const [status, setStatus] = useState('')

//   useEffect(() => {
//     chrome.storage.local.get({ settings: { contentScanning: false, excludeList: [] } }, (res) => {
//       const s = res.settings || {}
//       setContentScanning(!!s.contentScanning)
//       setExcludeText((s.excludeList || []).join('\n'))
//     })
//   }, [])

//   function save() {
//     const s = {
//       contentScanning,
//       excludeList: excludeText.split('\n').map(x => x.trim()).filter(Boolean)
//     }
//     chrome.storage.local.set({ settings: s }, () => {
//       setStatus('Settings saved')
//       setTimeout(() => setStatus(''), 2000)
//     })
//   }

//   function scanOpenPages() {
//     if (!contentScanning) { setStatus('Enable content scanning first.'); return }
//     chrome.tabs.query({}, (tabs) => {
//       let scanned = 0, pending = tabs.length
//       if (!pending) { setStatus('No tabs found'); return }
//       tabs.forEach(t => {
//         if (!t.id || !t.url) { pending--; if (!pending) finalize(); return }
//         if (t.url.startsWith('chrome://') || t.url.startsWith('chrome-extension://')) { pending--; if (!pending) finalize(); return }
//         const excludeList = excludeText.split('\n').map(x => x.trim()).filter(Boolean)
//         const excluded = excludeList.some(p => t.url.includes(p))
//         if (excluded) { pending--; if (!pending) finalize(); return }
//         chrome.tabs.sendMessage(t.id, { type: 'requestPageText' }, (resp) => {
//           if (!chrome.runtime.lastError && resp && resp.text) {
//             chrome.runtime.sendMessage({ type: 'dumpText', text: resp.text }, () => {})
//             scanned++
//           }
//           pending--; if (!pending) finalize()
//         })
//       })
//       function finalize() { setStatus(`Scanned ${scanned} pages.`); setTimeout(()=>setStatus(''),2500) }
//     })
//   }

//   return (
//     <div style={{ padding: 16, fontFamily: 'Inter, system-ui, -apple-system' }}>
//       <h1>Settings</h1>
//       <label style={{ display:'block', margin:'8px 0' }}>
//         <input type="checkbox" checked={contentScanning} onChange={(e) => setContentScanning(e.target.checked)} />
//         <span style={{ marginLeft:8 }}> Enable content scanning (text snippets)</span>
//       </label>
//       <div style={{ marginTop:12 }}>
//         <label>Exclude sites (one per line)</label>
//         <textarea value={excludeText} onChange={(e)=>setExcludeText(e.target.value)} rows={6} style={{ width:'100%', marginTop:6 }} />
//       </div>
//       <div style={{ marginTop:12 }}>
//         <button onClick={save} style={{ marginRight:8 }}>Save</button>
//         <button onClick={scanOpenPages}>Scan open pages now</button>
//       </div>
//       <div style={{ marginTop:12 }}>{status}</div>
//     </div>
//   )
// }
