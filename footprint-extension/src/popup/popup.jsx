/* eslint-env browser */
/* global chrome */
import React, { useEffect, useState } from "react";
import "./popup.css";
import {
    formatDuration,
    calculateProductivityScore,
    getTopSites,
    calculateEmotionalBalance,
} from "../utils/analytics.js";
import {
    getCategoryDisplayName,
    getCategoryIcon,
} from "../utils/categories.js";

function secToMin(seconds) {
    return Math.round(seconds / 60);
}

const isChrome = typeof chrome !== "undefined" && !!chrome.runtime;

const Popup = () => {
    const [todayMin, setTodayMin] = useState(0);
    const [paused, setPaused] = useState(false);
    const [engScore, setEngScore] = useState(0);
    const [productivityScore, setProductivityScore] = useState(0);
    const [emotionalBalance, setEmotionalBalance] = useState({
        score: 50,
        positive: 0,
        negative: 0,
        neutral: 0,
    });
    const [topSites, setTopSites] = useState([]);
    const [currentSite, setCurrentSite] = useState({
        category: "other",
        domain: "",
    });
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            // Get paused status
            if (isChrome) {
                try {
                    chrome.runtime.sendMessage(
                        { type: "getStatus" },
                        (resp) => {
                            if (resp && typeof resp.paused === "boolean")
                                setPaused(resp.paused);
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
                                        category: "other",
                                    }); // Will be updated with actual category
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

            // Get today's comprehensive analytics
            if (isChrome) {
                try {
                    chrome.runtime.sendMessage(
                        { type: "getTodayStats" },
                        (resp) => {
                            if (resp && resp.events && resp.analyses) {
                                const { events, analyses } = resp;

                                // Calculate basic metrics
                                const startDay = new Date();
                                startDay.setHours(0, 0, 0, 0);

                                let totalSeconds = 0;
                                let totalClicks = 0,
                                    totalKeys = 0,
                                    totalScrolls = 0;
                                const sessionEvents = [];

                                events.forEach((e) => {
                                    if (
                                        e.type === "session_end" &&
                                        e.ts >= startDay.getTime()
                                    ) {
                                        totalSeconds += e.duration || 0;
                                        sessionEvents.push(e);
                                    }

                                    if (
                                        e.type === "engagement" &&
                                        e.ts >= startDay.getTime()
                                    ) {
                                        totalClicks +=
                                            (e.data && e.data.clicks) || 0;
                                        totalKeys +=
                                            (e.data && e.data.keys) || 0;
                                        totalScrolls +=
                                            (e.data && e.data.scrolls) || 0;
                                    }
                                });

                                setTodayMin(secToMin(totalSeconds));
                                setEngScore(
                                    Math.min(
                                        100,
                                        Math.round(
                                            (totalClicks +
                                                totalKeys +
                                                totalScrolls) /
                                                10
                                        )
                                    )
                                );

                                // Calculate productivity score
                                const prodScore =
                                    calculateProductivityScore(sessionEvents);
                                setProductivityScore(prodScore);

                                // Get top sites
                                const sites = getTopSites(sessionEvents, 3);
                                setTopSites(sites);

                                // Calculate emotional balance
                                const emoBalance =
                                    calculateEmotionalBalance(analyses);
                                setEmotionalBalance(emoBalance);

                                // Generate insights
                                const newInsights = generateInsights(
                                    totalSeconds,
                                    prodScore,
                                    emoBalance,
                                    sites
                                );
                                setInsights(newInsights);
                            }
                            setLoading(false);
                        }
                    );
                } catch (e) {
                    console.warn("chrome.storage not available:", e);
                    setLoading(false);
                }
            } else {
                // Dev fallback
                setTodayMin(120);
                setEngScore(75);
                setProductivityScore(60);
                setEmotionalBalance({
                    score: 65,
                    positive: 40,
                    negative: 25,
                    neutral: 35,
                });
                setTopSites([
                    {
                        domain: "github.com",
                        totalTime: 3600,
                        category: "productivity",
                    },
                    {
                        domain: "youtube.com",
                        totalTime: 2400,
                        category: "entertainment",
                    },
                ]);
                setInsights([
                    "Consider taking breaks between focused work sessions",
                ]);
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Generate personalized insights
    const generateInsights = (totalSeconds, prodScore, emoBalance, sites) => {
        const insights = [];
        const totalHours = totalSeconds / 3600;

        // Time-based insights
        if (totalHours > 6) {
            insights.push(
                "💡 You've spent significant time online today. Consider taking regular breaks."
            );
        } else if (totalHours < 2) {
            insights.push(
                "🌟 Light usage day! Good balance with offline activities."
            );
        }

        // Productivity insights
        if (prodScore > 80) {
            insights.push(
                "🚀 Excellent productivity score! Keep up the focused work."
            );
        } else if (prodScore < 40) {
            insights.push(
                "⚡ Consider time-blocking productive tasks to improve focus."
            );
        }

        // Emotional balance insights
        if (emoBalance.score < 30) {
            insights.push(
                "😊 Try balancing negative content with more uplifting material."
            );
        } else if (emoBalance.score > 70) {
            insights.push(
                "🌈 Great emotional balance in your content consumption!"
            );
        }

        // Site diversity insights
        const entertainmentTime =
            sites.find((s) => s.category === "entertainment")?.totalTime || 0;
        const socialTime =
            sites.find((s) => s.category === "social")?.totalTime || 0;

        if (entertainmentTime + socialTime > totalSeconds * 0.6) {
            insights.push(
                "🎯 High entertainment/social usage. Try incorporating more educational content."
            );
        }

        return insights.slice(0, 2); // Show max 2 insights
    };

    const togglePause = () => {
        if (!isChrome) return setPaused((p) => !p);
        const action = paused ? "resume" : "pause";
        try {
            chrome.runtime.sendMessage({ type: action }, (resp) => {
                setPaused(resp?.paused || false);
            });
        } catch (e) {
            console.warn("togglePause failed:", e);
        }
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
            console.warn("openOptions failed, falling back:", err);
            try {
                window.open(
                    chrome.runtime.getURL("options/index.html"),
                    "_blank"
                );
            } catch (_) {}
        }
    };

    const openDashboard = () => {
        if (!isChrome) {
            window.open("https://your-dashboard-website.com", "_blank");
            return;
        }
        try {
            chrome.tabs.create({ url: "https://your-dashboard-website.com" });
        } catch (e) {
            console.warn("openDashboard failed:", e);
        }
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
                <div className="logo">🦶</div>
                <h1>Digital Footprint</h1>
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

            <div className="metrics-grid">
                <div className="metric-card time">
                    <div className="metric-icon">⏱️</div>
                    <div className="metric-content">
                        <div className="metric-value">{todayMin}m</div>
                        <div className="metric-label">Today</div>
                    </div>
                </div>

                <div className="metric-card productivity">
                    <div className="metric-icon">📈</div>
                    <div className="metric-content">
                        <div className="metric-value">{productivityScore}%</div>
                        <div className="metric-label">Productive</div>
                    </div>
                </div>

                <div className="metric-card engagement">
                    <div className="metric-icon">🎯</div>
                    <div className="metric-content">
                        <div className="metric-value">{engScore}</div>
                        <div className="metric-label">Engagement</div>
                    </div>
                </div>

                <div className="metric-card emotional">
                    <div className="metric-icon">😊</div>
                    <div className="metric-content">
                        <div className="metric-value">
                            {emotionalBalance.score}
                        </div>
                        <div className="metric-label">Mood Balance</div>
                    </div>
                </div>
            </div>

            {insights.length > 0 && (
                <div className="insights-section">
                    <h3>💡 Insights</h3>
                    <div className="insights-list">
                        {insights.map((insight, idx) => (
                            <div key={idx} className="insight-item">
                                {insight}
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                <button className="primary" onClick={togglePause}>
                    {paused ? "▶️ Resume Tracking" : "⏸️ Pause Tracking"}
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
                <small>AI-powered insights • Privacy-focused tracking</small>
            </footer>
        </div>
    );
};

export default Popup;
