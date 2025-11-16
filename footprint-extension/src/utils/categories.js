// Website categorization utilities
export const CATEGORIES = {
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

export const CATEGORY_COLORS = {
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

// Default category mappings based on domain patterns
export const DEFAULT_CATEGORY_PATTERNS = {
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

// Categorize a URL based on domain patterns and user settings
export function categorizeUrl(url, userCategories = {}) {
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

// Get category display name
export function getCategoryDisplayName(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

// Get category icon
export function getCategoryIcon(category) {
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
