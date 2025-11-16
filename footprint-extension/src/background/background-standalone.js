// Digital Footprint Tracker - Background Script (Standalone)
// All utilities inlined to avoid ES6 import issues

// === CATEGORIES UTILITIES ===
const CATEGORIES = {
    PRODUCTIVITY: "productivity",
    ENTERTAINMENT: "entertainment",
    SOCIAL: "social",
    NEWS: "news",
    SHOPPING: "shopping",
    EDUCATION: "education",
    HEALTH: "health",
    FINANCE: "finance",
    WORK: "work",
    OTHER: "other",
};

const CATEGORY_COLORS = {
    [CATEGORIES.PRODUCTIVITY]: "#4CAF50",
    [CATEGORIES.ENTERTAINMENT]: "#FF9800",
    [CATEGORIES.SOCIAL]: "#E91E63",
    [CATEGORIES.NEWS]: "#2196F3",
    [CATEGORIES.SHOPPING]: "#9C27B0",
    [CATEGORIES.EDUCATION]: "#00BCD4",
    [CATEGORIES.HEALTH]: "#4CAF50",
    [CATEGORIES.FINANCE]: "#FFC107",
    [CATEGORIES.WORK]: "#607D8B",
    [CATEGORIES.OTHER]: "#9E9E9E",
};

const DEFAULT_CATEGORY_PATTERNS = {
    [CATEGORIES.PRODUCTIVITY]: [
        "github.com",
        "gitlab.com",
        "stackoverflow.com",
        "docs.google.com",
        "notion.so",
        "trello.com",
        "asana.com",
        "slack.com",
        "discord.com",
        "zoom.us",
        "teams.microsoft.com",
        "atlassian.net",
        "jira.",
        "confluence.",
        "drive.google.com",
        "dropbox.com",
        "onedrive.",
        "figma.com",
        "canva.com",
    ],
    [CATEGORIES.ENTERTAINMENT]: [
        "youtube.com",
        "netflix.com",
        "hulu.com",
        "disney.",
        "prime.video",
        "spotify.com",
        "soundcloud.com",
        "twitch.tv",
        "gaming.",
        "steam.",
        "epic.games",
        "xbox.com",
        "playstation.com",
        "ign.com",
        "gamespot.com",
        "imdb.com",
        "rottentomatoes.com",
        "metacritic.com",
    ],
    [CATEGORIES.SOCIAL]: [
        "facebook.com",
        "instagram.com",
        "twitter.com",
        "x.com",
        "linkedin.com",
        "snapchat.com",
        "tiktok.com",
        "reddit.com",
        "pinterest.com",
        "tumblr.com",
        "whatsapp.com",
        "telegram.org",
        "signal.org",
        "mastodon.",
    ],
    [CATEGORIES.NEWS]: [
        "cnn.com",
        "bbc.com",
        "reuters.com",
        "ap.org",
        "nytimes.com",
        "wsj.com",
        "guardian.co.uk",
        "washingtonpost.com",
        "foxnews.com",
        "npr.org",
        "bloomberg.com",
        "techcrunch.com",
        "wired.com",
        "arstechnica.com",
        "theverge.com",
        "engadget.com",
        "gizmodo.com",
    ],
    [CATEGORIES.SHOPPING]: [
        "amazon.com",
        "ebay.com",
        "walmart.com",
        "target.com",
        "bestbuy.com",
        "shopify.com",
        "etsy.com",
        "alibaba.com",
        "aliexpress.com",
        "wish.com",
        "nike.com",
        "adidas.com",
        "zara.com",
        "h&m.com",
    ],
    [CATEGORIES.EDUCATION]: [
        "coursera.org",
        "udemy.com",
        "khan.academy",
        "edx.org",
        "pluralsight.com",
        "lynda.com",
        "skillshare.com",
        "masterclass.com",
        "mit.edu",
        "stanford.edu",
        "harvard.edu",
        "wikipedia.org",
        "scholar.google.com",
        "researchgate.net",
    ],
    [CATEGORIES.HEALTH]: [
        "webmd.com",
        "mayoclinic.org",
        "healthline.com",
        "nih.gov",
        "cdc.gov",
        "who.int",
        "myfitnesspal.com",
        "fitbit.com",
        "strava.com",
        "headspace.com",
        "calm.com",
    ],
    [CATEGORIES.FINANCE]: [
        "mint.com",
        "chase.com",
        "bankofamerica.com",
        "wellsfargo.com",
        "paypal.com",
        "venmo.com",
        "robinhood.com",
        "fidelity.com",
        "schwab.com",
        "vanguard.com",
        "coinbase.com",
        "binance.com",
        "bloomberg.com",
    ],
    [CATEGORIES.WORK]: [
        "office.com",
        "gmail.com",
        "outlook.com",
        "calendar.google.com",
        "salesforce.com",
        "hubspot.com",
        "mailchimp.com",
        "zapier.com",
    ],
};

function categorizeUrl(url, userCategories = {}) {
    try {
        const domain = new URL(url).hostname.toLowerCase();

        // Check user-defined categories first
        for (const [category, patterns] of Object.entries(userCategories)) {
            if (
                patterns.some((pattern) =>
                    domain.includes(pattern.toLowerCase())
                )
            ) {
                return category;
            }
        }

        // Check default patterns
        for (const [category, patterns] of Object.entries(
            DEFAULT_CATEGORY_PATTERNS
        )) {
            if (
                patterns.some((pattern) =>
                    domain.includes(pattern.toLowerCase())
                )
            ) {
                return category;
            }
        }

        return CATEGORIES.OTHER;
    } catch {
        return CATEGORIES.OTHER;
    }
}

function getCategoryDisplayName(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

function getCategoryIcon(category) {
    const icons = {
        [CATEGORIES.PRODUCTIVITY]: "💼",
        [CATEGORIES.ENTERTAINMENT]: "🎬",
        [CATEGORIES.SOCIAL]: "👥",
        [CATEGORIES.NEWS]: "📰",
        [CATEGORIES.SHOPPING]: "🛒",
        [CATEGORIES.EDUCATION]: "📚",
        [CATEGORIES.HEALTH]: "🏥",
        [CATEGORIES.FINANCE]: "💰",
        [CATEGORIES.WORK]: "💻",
        [CATEGORIES.OTHER]: "🌐",
    };
    return icons[category] || "🌐";
}

// === CONTENT ANALYSIS UTILITIES ===
const SENTIMENT = {
    POSITIVE: "positive",
    NEGATIVE: "negative",
    NEUTRAL: "neutral",
};

const CONTENT_QUALITY = {
    BIASED: "biased",
    NEUTRAL: "neutral",
    INFORMATIVE: "informative",
    HARMFUL: "harmful",
};

function analyzeSentiment(text) {
    if (!text || typeof text !== "string") return SENTIMENT.NEUTRAL;

    const lowercaseText = text.toLowerCase();

    const positiveWords = [
        "amazing",
        "awesome",
        "brilliant",
        "excellent",
        "fantastic",
        "great",
        "happy",
        "love",
        "perfect",
        "wonderful",
        "good",
        "best",
        "beautiful",
        "inspiring",
        "incredible",
        "outstanding",
        "remarkable",
        "success",
        "achievement",
        "celebration",
        "joy",
        "excited",
        "thrilled",
        "grateful",
    ];

    const negativeWords = [
        "terrible",
        "awful",
        "horrible",
        "bad",
        "hate",
        "worst",
        "disgusting",
        "angry",
        "frustrated",
        "disappointed",
        "sad",
        "depressed",
        "crisis",
        "disaster",
        "failure",
        "problem",
        "issue",
        "concern",
        "worry",
        "fear",
        "anxiety",
        "stress",
        "conflict",
        "violence",
        "death",
        "destruction",
    ];

    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach((word) => {
        const matches = lowercaseText.match(new RegExp(`\\b${word}\\b`, "g"));
        if (matches) positiveCount += matches.length;
    });

    negativeWords.forEach((word) => {
        const matches = lowercaseText.match(new RegExp(`\\b${word}\\b`, "g"));
        if (matches) negativeCount += matches.length;
    });

    if (positiveCount > negativeCount) return SENTIMENT.POSITIVE;
    if (negativeCount > positiveCount) return SENTIMENT.NEGATIVE;
    return SENTIMENT.NEUTRAL;
}

function analyzeContentQuality(text) {
    if (!text || typeof text !== "string") return CONTENT_QUALITY.NEUTRAL;

    const lowercaseText = text.toLowerCase();

    const biasedIndicators = [
        "always",
        "never",
        "all",
        "none",
        "everyone",
        "nobody",
        "obviously",
        "clearly",
        "undoubtedly",
        "definitely",
        "absolutely",
        "completely",
        "totally",
        "utterly",
        "entirely",
        "without question",
        "no doubt",
    ];

    const harmfulIndicators = [
        "violence",
        "violent",
        "kill",
        "murder",
        "suicide",
        "self-harm",
        "hate",
        "harassment",
        "bullying",
        "discrimination",
        "racism",
        "sexism",
        "extremist",
        "terrorist",
        "weapon",
        "bomb",
        "drug",
    ];

    let biasScore = 0;
    let harmScore = 0;

    biasedIndicators.forEach((indicator) => {
        const matches = lowercaseText.match(
            new RegExp(`\\b${indicator}\\b`, "g")
        );
        if (matches) biasScore += matches.length;
    });

    harmfulIndicators.forEach((indicator) => {
        const matches = lowercaseText.match(
            new RegExp(`\\b${indicator}\\b`, "g")
        );
        if (matches) harmScore += matches.length;
    });

    // Normalize scores based on text length
    const wordCount = text.split(/\s+/).length;
    const normalizedBias = (biasScore / wordCount) * 100;
    const normalizedHarm = (harmScore / wordCount) * 100;

    if (normalizedHarm > 0.5) return CONTENT_QUALITY.HARMFUL;
    if (normalizedBias > 2) return CONTENT_QUALITY.BIASED;

    // Check for informative indicators
    const informativeIndicators = [
        "according to",
        "research shows",
        "study finds",
        "data indicates",
        "statistics",
        "evidence",
        "peer-reviewed",
        "scientific",
        "academic",
    ];

    const hasInformativeContent = informativeIndicators.some((indicator) =>
        lowercaseText.includes(indicator)
    );

    return hasInformativeContent
        ? CONTENT_QUALITY.INFORMATIVE
        : CONTENT_QUALITY.NEUTRAL;
}

function extractTopics(text, maxTopics = 5) {
    if (!text || typeof text !== "string") return [];

    const topicKeywords = {
        Technology: [
            "tech",
            "software",
            "hardware",
            "computer",
            "programming",
            "coding",
            "ai",
            "machine learning",
            "blockchain",
            "cryptocurrency",
        ],
        Politics: [
            "politics",
            "government",
            "election",
            "democracy",
            "policy",
            "legislation",
            "congress",
            "senate",
            "president",
            "vote",
        ],
        Sports: [
            "sports",
            "football",
            "basketball",
            "soccer",
            "baseball",
            "tennis",
            "olympics",
            "championship",
            "team",
            "game",
        ],
        Health: [
            "health",
            "medical",
            "medicine",
            "doctor",
            "hospital",
            "treatment",
            "therapy",
            "fitness",
            "nutrition",
            "wellness",
        ],
        Entertainment: [
            "movie",
            "film",
            "music",
            "concert",
            "celebrity",
            "actor",
            "singer",
            "album",
            "show",
            "entertainment",
        ],
        Business: [
            "business",
            "company",
            "market",
            "stock",
            "economy",
            "finance",
            "investment",
            "startup",
            "entrepreneur",
            "corporate",
        ],
        Science: [
            "science",
            "research",
            "study",
            "experiment",
            "discovery",
            "theory",
            "biology",
            "chemistry",
            "physics",
            "astronomy",
        ],
        Travel: [
            "travel",
            "vacation",
            "trip",
            "tourism",
            "destination",
            "flight",
            "hotel",
            "adventure",
            "culture",
            "explore",
        ],
    };

    const lowercaseText = text.toLowerCase();
    const topicScores = {};

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        let score = 0;
        keywords.forEach((keyword) => {
            const matches = lowercaseText.match(
                new RegExp(`\\b${keyword}\\b`, "g")
            );
            if (matches) score += matches.length;
        });
        if (score > 0) topicScores[topic] = score;
    });

    return Object.entries(topicScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, maxTopics)
        .map(([topic]) => topic);
}

function calculateReadabilityScore(text) {
    if (!text || typeof text !== "string") return 0;

    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const words = text.split(/\s+/).filter((w) => w.trim().length > 0);
    const syllables = words.reduce((count, word) => {
        return count + countSyllables(word);
    }, 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Simplified Flesch Reading Ease Score
    const score =
        206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
    return Math.max(0, Math.min(100, Math.round(score)));
}

function countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
}

// === MAIN BACKGROUND SCRIPT ===

// Track user activity
let currentSession = {
    startTime: Date.now(),
    endTime: null,
    totalTime: 0,
    activeTime: 0,
    sites: {},
    emotionalBalance: {
        positive: 0,
        negative: 0,
        neutral: 0,
    },
    productivityScore: 0,
    categories: {},
    insights: [],
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
    console.log("Digital Footprint Tracker installed");
    initializeStorage();
});

// Initialize storage with default settings
async function initializeStorage() {
    try {
        const settings = await chrome.storage.sync.get([
            "trackingEnabled",
            "excludedSites",
            "userCategories",
            "privacyMode",
        ]);

        if (!settings.trackingEnabled) {
            await chrome.storage.sync.set({
                trackingEnabled: true,
                excludedSites: ["chrome://", "chrome-extension://", "about:"],
                userCategories: {},
                privacyMode: false,
            });
        }

        startNewSession();
    } catch (error) {
        console.error("Error initializing storage:", error);
    }
}

// Start a new tracking session
function startNewSession() {
    currentSession = {
        startTime: Date.now(),
        endTime: null,
        totalTime: 0,
        activeTime: 0,
        sites: {},
        emotionalBalance: {
            positive: 0,
            negative: 0,
            neutral: 0,
        },
        productivityScore: 0,
        categories: {},
        insights: [],
    };
}

// Track tab navigation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        await trackPageVisit(tab.url, tab.title);
    } catch (error) {
        console.error("Error tracking tab activation:", error);
    }
});

// Track tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        try {
            await trackPageVisit(tab.url, tab.title);
            await requestContentAnalysis(tabId);
        } catch (error) {
            console.error("Error tracking tab update:", error);
        }
    }
});

// Request content analysis from content script
async function requestContentAnalysis(tabId) {
    try {
        // Check if tab is valid and can be scripted
        const tab = await chrome.tabs.get(tabId);
        if (
            !tab.url ||
            tab.url.startsWith("chrome://") ||
            tab.url.startsWith("chrome-extension://")
        ) {
            return;
        }

        // Inject content script and request analysis
        await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                // Send page content for analysis
                const content = document.body.innerText || "";
                const title = document.title || "";

                chrome.runtime.sendMessage({
                    type: "CONTENT_ANALYSIS",
                    data: {
                        content: content.substring(0, 5000), // Limit content size
                        title,
                        url: window.location.href,
                    },
                });
            },
        });
    } catch (error) {
        console.error("Error requesting content analysis:", error);
    }
}

// Track page visits
async function trackPageVisit(url, title = "") {
    if (!url) return;

    try {
        const settings = await chrome.storage.sync.get([
            "trackingEnabled",
            "excludedSites",
        ]);

        if (!settings.trackingEnabled) return;

        // Check if site is excluded
        const isExcluded = settings.excludedSites?.some((excluded) =>
            url.includes(excluded)
        );
        if (isExcluded) return;

        const domain = new URL(url).hostname;
        const timestamp = Date.now();

        // Update session data
        if (!currentSession.sites[domain]) {
            currentSession.sites[domain] = {
                url,
                title,
                visits: 0,
                timeSpent: 0,
                lastVisit: timestamp,
                category: categorizeUrl(url),
            };
        }

        currentSession.sites[domain].visits += 1;
        currentSession.sites[domain].lastVisit = timestamp;

        // Update category tracking
        const category = currentSession.sites[domain].category;
        currentSession.categories[category] =
            (currentSession.categories[category] || 0) + 1;

        // Store in persistent storage
        await updateStoredData();
    } catch (error) {
        console.error("Error tracking page visit:", error);
    }
}

// Handle messages from content script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    try {
        switch (message.type) {
            case "CONTENT_ANALYSIS":
                await processContentAnalysis(message.data, sender.tab);
                break;

            case "USER_INTERACTION":
                await trackUserInteraction(message.data, sender.tab);
                break;

            case "GET_SESSION_DATA":
                sendResponse(await getSessionData());
                break;

            case "GET_ANALYTICS":
                sendResponse(await getAnalytics(message.timeframe));
                break;

            case "UPDATE_SETTINGS":
                await updateSettings(message.settings);
                break;

            case "EXPORT_DATA":
                sendResponse(await exportData());
                break;

            default:
                console.warn("Unknown message type:", message.type);
        }
    } catch (error) {
        console.error("Error handling message:", error);
    }

    return true; // Keep channel open for async response
});

// Process content analysis
async function processContentAnalysis(data, tab) {
    if (!data.content || !tab?.url) return;

    try {
        const domain = new URL(tab.url).hostname;

        // Analyze content
        const sentiment = analyzeSentiment(data.content);
        const quality = analyzeContentQuality(data.content);
        const topics = extractTopics(data.content);
        const readability = calculateReadabilityScore(data.content);

        // Update emotional balance
        currentSession.emotionalBalance[sentiment] += 1;

        // Update site data with analysis
        if (currentSession.sites[domain]) {
            currentSession.sites[domain].contentAnalysis = {
                sentiment,
                quality,
                topics,
                readability,
                analyzedAt: Date.now(),
            };
        }

        // Calculate productivity score
        await calculateProductivityScore();

        // Generate insights
        await generateInsights();

        // Update stored data
        await updateStoredData();
    } catch (error) {
        console.error("Error processing content analysis:", error);
    }
}

// Track user interactions
async function trackUserInteraction(data, tab) {
    if (!tab?.url) return;

    try {
        const domain = new URL(tab.url).hostname;
        const timestamp = Date.now();

        if (currentSession.sites[domain]) {
            if (!currentSession.sites[domain].interactions) {
                currentSession.sites[domain].interactions = [];
            }

            currentSession.sites[domain].interactions.push({
                type: data.type,
                timestamp,
                details: data.details,
            });

            // Update active time (rough estimate)
            currentSession.activeTime += 1000; // 1 second per interaction
        }

        await updateStoredData();
    } catch (error) {
        console.error("Error tracking user interaction:", error);
    }
}

// Calculate productivity score
async function calculateProductivityScore() {
    const productiveCategories = [
        CATEGORIES.PRODUCTIVITY,
        CATEGORIES.EDUCATION,
        CATEGORIES.WORK,
    ];
    const distractingCategories = [CATEGORIES.ENTERTAINMENT, CATEGORIES.SOCIAL];

    let productiveTime = 0;
    let distractingTime = 0;
    let totalTime = 0;

    Object.values(currentSession.sites).forEach((site) => {
        const timeSpent = site.timeSpent || 0;
        totalTime += timeSpent;

        if (productiveCategories.includes(site.category)) {
            productiveTime += timeSpent;
        } else if (distractingCategories.includes(site.category)) {
            distractingTime += timeSpent;
        }
    });

    if (totalTime === 0) {
        currentSession.productivityScore = 50; // Neutral score
    } else {
        // Score from 0-100 based on productive vs distracting time
        const productiveRatio = productiveTime / totalTime;
        const distractingRatio = distractingTime / totalTime;
        currentSession.productivityScore = Math.round(
            productiveRatio * 100 - distractingRatio * 30
        );
    }

    // Ensure score is between 0-100
    currentSession.productivityScore = Math.max(
        0,
        Math.min(100, currentSession.productivityScore)
    );
}

// Generate personalized insights
async function generateInsights() {
    const insights = [];

    // Emotional balance insights
    const { positive, negative, neutral } = currentSession.emotionalBalance;
    const total = positive + negative + neutral;

    if (total > 0) {
        const negativeRatio = negative / total;
        if (negativeRatio > 0.6) {
            insights.push({
                type: "emotional_warning",
                title: "High Negative Content Exposure",
                description:
                    "You've encountered a lot of negative content today. Consider taking breaks or visiting more positive content.",
                priority: "high",
            });
        } else if (positive / total > 0.6) {
            insights.push({
                type: "emotional_positive",
                title: "Positive Content Day",
                description:
                    "Great job! You've been consuming mostly positive content today.",
                priority: "low",
            });
        }
    }

    // Productivity insights
    if (currentSession.productivityScore < 30) {
        insights.push({
            type: "productivity_warning",
            title: "Low Productivity Score",
            description:
                "Your focus seems scattered today. Try using website blockers or taking focused work sessions.",
            priority: "medium",
        });
    } else if (currentSession.productivityScore > 80) {
        insights.push({
            type: "productivity_praise",
            title: "Highly Productive Session",
            description:
                "Excellent! You've maintained great focus on productive activities.",
            priority: "low",
        });
    }

    // Category diversity insights
    const categoryCount = Object.keys(currentSession.categories).length;
    if (categoryCount > 6) {
        insights.push({
            type: "diversity_high",
            title: "Diverse Content Consumption",
            description:
                "You've explored many different types of content today. This shows good curiosity!",
            priority: "low",
        });
    }

    currentSession.insights = insights;
}

// Get current session data
async function getSessionData() {
    return {
        session: currentSession,
        timestamp: Date.now(),
    };
}

// Get analytics for specified timeframe
async function getAnalytics(timeframe = "7d") {
    try {
        const storedSessions = (await chrome.storage.local.get([
            "sessions",
        ])) || { sessions: [] };
        const sessions = storedSessions.sessions || [];

        // Calculate timeframe boundaries
        const now = Date.now();
        let startTime;

        switch (timeframe) {
            case "1d":
                startTime = now - 24 * 60 * 60 * 1000;
                break;
            case "7d":
                startTime = now - 7 * 24 * 60 * 60 * 1000;
                break;
            case "30d":
                startTime = now - 30 * 24 * 60 * 60 * 1000;
                break;
            default:
                startTime = now - 7 * 24 * 60 * 60 * 1000;
        }

        const relevantSessions = sessions.filter(
            (session) => session.startTime >= startTime
        );

        // Add current session if active
        if (currentSession.startTime >= startTime) {
            relevantSessions.push(currentSession);
        }

        // Aggregate analytics
        const analytics = {
            totalTime: 0,
            activeTime: 0,
            sitesVisited: new Set(),
            categories: {},
            emotionalBalance: { positive: 0, negative: 0, neutral: 0 },
            avgProductivityScore: 0,
            insights: [],
            trends: [],
        };

        relevantSessions.forEach((session) => {
            analytics.totalTime += session.totalTime || 0;
            analytics.activeTime += session.activeTime || 0;

            Object.keys(session.sites || {}).forEach((site) => {
                analytics.sitesVisited.add(site);
            });

            Object.entries(session.categories || {}).forEach(
                ([category, count]) => {
                    analytics.categories[category] =
                        (analytics.categories[category] || 0) + count;
                }
            );

            analytics.emotionalBalance.positive +=
                session.emotionalBalance?.positive || 0;
            analytics.emotionalBalance.negative +=
                session.emotionalBalance?.negative || 0;
            analytics.emotionalBalance.neutral +=
                session.emotionalBalance?.neutral || 0;

            analytics.insights.push(...(session.insights || []));
        });

        // Calculate average productivity score
        if (relevantSessions.length > 0) {
            const totalProductivity = relevantSessions.reduce(
                (sum, session) => sum + (session.productivityScore || 0),
                0
            );
            analytics.avgProductivityScore =
                totalProductivity / relevantSessions.length;
        }

        analytics.sitesVisited = analytics.sitesVisited.size;

        return analytics;
    } catch (error) {
        console.error("Error getting analytics:", error);
        return null;
    }
}

// Update stored data
async function updateStoredData() {
    try {
        // Update current session end time
        currentSession.endTime = Date.now();
        currentSession.totalTime =
            currentSession.endTime - currentSession.startTime;

        // Store session data
        await chrome.storage.local.set({
            currentSession: currentSession,
            lastUpdated: Date.now(),
        });

        // Also store in sessions history (limit to last 100 sessions)
        const storedSessions = await chrome.storage.local.get(["sessions"]);
        let sessions = storedSessions.sessions || [];

        // Remove current session if it exists in history
        sessions = sessions.filter(
            (s) => s.startTime !== currentSession.startTime
        );

        // Add current session
        sessions.push({ ...currentSession });

        // Keep only last 100 sessions
        if (sessions.length > 100) {
            sessions = sessions.slice(-100);
        }

        await chrome.storage.local.set({ sessions });
    } catch (error) {
        console.error("Error updating stored data:", error);
    }
}

// Update settings
async function updateSettings(newSettings) {
    try {
        await chrome.storage.sync.set(newSettings);
    } catch (error) {
        console.error("Error updating settings:", error);
    }
}

// Export data
async function exportData() {
    try {
        const [syncData, localData] = await Promise.all([
            chrome.storage.sync.get(null),
            chrome.storage.local.get(null),
        ]);

        return {
            settings: syncData,
            sessions: localData.sessions || [],
            currentSession: localData.currentSession,
            exportedAt: Date.now(),
            version: "1.0.0",
        };
    } catch (error) {
        console.error("Error exporting data:", error);
        return null;
    }
}

// Periodic cleanup and session management
setInterval(async () => {
    try {
        // Clean up old sessions (older than 90 days)
        const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
        const storedSessions = await chrome.storage.local.get(["sessions"]);
        let sessions = storedSessions.sessions || [];

        const cleanedSessions = sessions.filter(
            (session) => session.startTime > cutoff
        );

        if (cleanedSessions.length !== sessions.length) {
            await chrome.storage.local.set({ sessions: cleanedSessions });
            console.log("Cleaned up old sessions");
        }

        // Update current session
        await updateStoredData();
    } catch (error) {
        console.error("Error in periodic cleanup:", error);
    }
}, 60000); // Run every minute

console.log("Digital Footprint Tracker background script loaded");
