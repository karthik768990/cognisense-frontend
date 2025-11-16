/* eslint-env browser */
/* global chrome */
import React, { useEffect, useState } from "react";
import "./popup-simple.css";
import { formatDuration } from "../utils/analytics.js";
import {
    getCategoryDisplayName,
    getCategoryIcon,
} from "../utils/categories.js";

function secToMin(seconds) {
    return Math.round(seconds / 60);
}

const isChrome = typeof chrome !== "undefined" && !!chrome.runtime;

const Popup = () => {
    const [totalTimeSeconds, setTotalTimeSeconds] = useState(0);
    const [paused, setPaused] = useState(false);
    const [topSites, setTopSites] = useState([]);
    const [currentSite, setCurrentSite] = useState({
        category: "other",
        domain: "",
    });
    const [loading, setLoading] = useState(true);
    const [displayTime, setDisplayTime] = useState(0); // For real-time display
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    // Real-time timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            if (!paused && !loading) {
                setDisplayTime((prev) => {
                    const now = Date.now();
                    const elapsed = Math.floor((now - lastUpdate) / 1000);
                    const newTime = totalTimeSeconds + elapsed;
                    console.log(
                        `⏱️ [POPUP] Timer update: ${totalTimeSeconds}s + ${elapsed}s = ${newTime}s`
                    );
                    return newTime;
                });
            } else {
                setDisplayTime(totalTimeSeconds);
                console.log(
                    `⏸️ [POPUP] Timer paused/loading: showing ${totalTimeSeconds}s`
                );
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [paused, totalTimeSeconds, lastUpdate, loading]);

    // Periodic stats refresh
    useEffect(() => {
        const refreshStats = () => {
            if (isChrome) {
                console.log("🔄 [POPUP] Refreshing stats...");
                chrome.runtime.sendMessage(
                    { type: "getTodayStats" },
                    (resp) => {
                        if (chrome.runtime.lastError) {
                            console.warn(
                                "🚨 [POPUP] Error refreshing stats:",
                                chrome.runtime.lastError.message
                            );
                            return;
                        }
                        if (resp && !resp.error) {
                            console.log("✅ [POPUP] Stats refreshed:", resp);
                            setTotalTimeSeconds(resp.totalTime || 0);
                            setTopSites(resp.topSites || []);
                            setPaused(resp.isPaused || false);
                            setLastUpdate(Date.now());
                        }
                    }
                );
            }
        };

        const interval = setInterval(refreshStats, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            console.log("🚀 [POPUP] Starting data load...");
            setLoading(true);

            // Get paused status
            if (isChrome) {
                try {
                    console.log("📡 [POPUP] Requesting status...");
                    chrome.runtime.sendMessage(
                        { type: "getStatus" },
                        (resp) => {
                            if (chrome.runtime.lastError) {
                                console.warn(
                                    "🚨 [POPUP] Error getting status:",
                                    chrome.runtime.lastError.message ||
                                        chrome.runtime.lastError
                                );
                                return;
                            }
                            console.log("✅ [POPUP] Status response:", resp);
                            if (resp) {
                                if (resp.error) {
                                    console.warn(
                                        "⚠️ [POPUP] getStatus returned error:",
                                        resp.error
                                    );
                                } else if (typeof resp.paused === "boolean") {
                                    console.log(
                                        `🔄 [POPUP] Pause state: ${
                                            resp.paused ? "PAUSED" : "ACTIVE"
                                        }`
                                    );
                                    setPaused(resp.paused);
                                } else {
                                    console.warn(
                                        "⚠️ [POPUP] getStatus response missing paused field:",
                                        resp
                                    );
                                }
                            } else {
                                console.warn(
                                    "⚠️ [POPUP] getStatus returned null/undefined response"
                                );
                            }
                        }
                    );
                } catch (e) {
                    console.warn("chrome.runtime not available:", e);
                }
            }

            // Get current active tab info
            if (isChrome) {
                try {
                    chrome.tabs.query(
                        { active: true, currentWindow: true },
                        (tabs) => {
                            if (tabs[0] && tabs[0].url) {
                                try {
                                    const domain = new URL(tabs[0].url)
                                        .hostname;
                                    setCurrentSite({
                                        domain,
                                        category: "other", // Will be updated with actual category
                                    });
                                } catch {
                                    setCurrentSite({
                                        domain: "Unknown",
                                        category: "other",
                                    });
                                }
                            }
                        }
                    );
                } catch (e) {
                    console.warn("Failed to get current tab:", e);
                }
            }

            // Get today's stats with timeout
            if (isChrome) {
                try {
                    // Add a timeout to prevent hanging
                    const timeoutPromise = new Promise((_, reject) => {
                        setTimeout(
                            () => reject(new Error("Stats request timeout")),
                            5000
                        );
                    });

                    const messagePromise = new Promise((resolve) => {
                        chrome.runtime.sendMessage(
                            { type: "getTodayStats" },
                            (resp) => {
                                if (chrome.runtime.lastError) {
                                    console.warn(
                                        "Error getting stats:",
                                        chrome.runtime.lastError.message ||
                                            chrome.runtime.lastError
                                    );
                                    resolve(null);
                                    return;
                                }
                                resolve(resp);
                            }
                        );
                    });

                    const resp = await Promise.race([
                        messagePromise,
                        timeoutPromise,
                    ]);

                    if (resp) {
                        if (resp.error) {
                            console.warn(
                                "Stats request returned error:",
                                resp.error
                            );
                        } else if (typeof resp === "object") {
                            setTotalTimeSeconds(
                                typeof resp.totalTime === "number"
                                    ? resp.totalTime
                                    : 0
                            );
                            setTopSites(
                                Array.isArray(resp.topSites)
                                    ? resp.topSites
                                    : []
                            );
                            setPaused(
                                typeof resp.isPaused === "boolean"
                                    ? resp.isPaused
                                    : false
                            );
                        }
                    } else {
                        console.warn(
                            "Stats request returned null/undefined response"
                        );
                    }
                    setLoading(false);
                } catch (e) {
                    const errorMessage =
                        e.message ||
                        (typeof e === "object" ? JSON.stringify(e) : String(e));
                    console.warn("Error getting stats:", errorMessage);
                    setLoading(false);
                }
            } else {
                // Non-Chrome environment - show message
                console.log("📱 [POPUP] Non-Chrome environment detected");
                setTotalTimeSeconds(0);
                setTopSites([]);
                setLoading(false);
            }
        };

        loadData();

        // Debug logging
        console.log("🔧 [POPUP] Initial state:", {
            totalTimeSeconds,
            paused,
            topSites: topSites.length,
            loading,
        });
    }, []);

    // Handle pause/resume functionality
    const handlePauseResume = () => {
        if (!isChrome) {
            console.log("⚠️ [POPUP] Chrome runtime not available");
            return;
        }

        const action = paused ? "resumeTracking" : "pauseTracking";
        const newState = !paused;

        console.log(
            `🎯 [POPUP] ${action} clicked - changing from ${
                paused ? "PAUSED" : "ACTIVE"
            } to ${newState ? "PAUSED" : "ACTIVE"}`
        );

        // Optimistically update UI for better responsiveness
        setPaused(newState);
        setLastUpdate(Date.now());

        chrome.runtime.sendMessage({ type: action }, (response) => {
            if (chrome.runtime.lastError) {
                console.error(
                    `🚨 [POPUP] Error ${action}:`,
                    chrome.runtime.lastError.message || chrome.runtime.lastError
                );
                // Revert optimistic update on error
                setPaused(!newState);
                return;
            }

            console.log(`✅ [POPUP] ${action} response:`, response);

            if (response) {
                if (response.error) {
                    console.error(
                        `🚨 [POPUP] ${action} returned error:`,
                        response.error
                    );
                    setPaused(!newState); // Revert on error
                } else if (response.success) {
                    console.log(
                        `✅ [POPUP] ${action} successful - state now: ${
                            response.paused ? "PAUSED" : "ACTIVE"
                        }`
                    );
                    setPaused(response.paused);
                    setLastUpdate(Date.now());
                } else {
                    console.warn(
                        `⚠️ [POPUP] ${action} response missing success flag:`,
                        response
                    );
                }
            } else {
                console.warn(
                    `⚠️ [POPUP] ${action} returned null/undefined response`
                );
                setPaused(!newState); // Revert on null response
            }
        });
    };
    const openOptions = () => {
        if (!isChrome) {
            window.open("options/index.html", "_blank");
            return;
        }

        try {
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage(() => {
                    if (chrome.runtime.lastError) {
                        window.open(
                            chrome.runtime.getURL("options/index.html"),
                            "_blank"
                        );
                    }
                });
            } else {
                window.open(
                    chrome.runtime.getURL("options/index.html"),
                    "_blank"
                );
            }
        } catch (err) {
            console.warn("Failed to open options:", err);
        }
    };

    const openDashboard = () => {
        // For now, just open the options page as dashboard
        openOptions();
    };

    if (loading) {
        return (
            <div className="popup">
                <header className="pf-header">
                    <div className="logo">🦶</div>
                    <h1>Digital Footprint</h1>
                </header>
                <div className="loading">
                    <div>Loading your insights...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="popup">
            <header className="pf-header">
                <div className="logo">⏱️</div>
                <h1>Time Tracker</h1>
                <div className="status-indicator">
                    {paused ? "⏸️ Paused" : "🟢 Active"}
                </div>
            </header>

            <div className="current-site">
                <div className="site-info">
                    <span className="site-icon">
                        {getCategoryIcon(currentSite.category)}
                    </span>
                    <div>
                        <div className="site-domain">{currentSite.domain}</div>
                        <div className="site-category">
                            {getCategoryDisplayName(currentSite.category)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="time-display">
                <div className="main-time">
                    <div className="time-value">
                        {formatDuration(displayTime)}
                        {!paused && !loading && (
                            <span className="live-indicator">●</span>
                        )}
                    </div>
                    <div className="time-label">
                        Today's Total {paused ? "(Paused)" : "(Live)"}
                    </div>
                </div>
            </div>

            {topSites.length > 0 && (
                <div className="top-sites-section">
                    <h3>🏆 Top Sites Today</h3>
                    <div className="sites-list">
                        {topSites.map((site, idx) => (
                            <div key={idx} className="site-item">
                                <span className="site-icon">
                                    {getCategoryIcon(site.category)}
                                </span>
                                <div className="site-details">
                                    <div className="site-name">
                                        {site.domain}
                                    </div>
                                    <div className="site-time">
                                        {formatDuration(site.totalTime)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="controls">
                <button
                    className="primary"
                    onClick={handlePauseResume}
                    disabled={loading}
                >
                    {loading
                        ? "⏳ Loading..."
                        : paused
                        ? "▶️ Resume Tracking"
                        : "⏸️ Pause Tracking"}
                </button>

                <div className="secondary-row">
                    <button className="link" onClick={openOptions}>
                        ⚙️ Settings
                    </button>
                    <button className="link" onClick={openDashboard}>
                        📊 Dashboard
                    </button>
                </div>
            </div>

            <footer className="pf-footer">
                <small>Simple time tracking • Privacy-focused</small>
            </footer>
        </div>
    );
};

export default Popup;
