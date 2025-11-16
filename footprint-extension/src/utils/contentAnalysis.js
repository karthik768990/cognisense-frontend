// Content analysis utilities
export const SENTIMENT = {
    POSITIVE: "positive",
    NEGATIVE: "negative",
    NEUTRAL: "neutral",
};

export const CONTENT_QUALITY = {
    BIASED: "biased",
    NEUTRAL: "neutral",
    INFORMATIVE: "informative",
    HARMFUL: "harmful",
};

// Simple sentiment analysis using keyword matching
export function analyzeSentiment(text) {
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

// Detect potentially biased or harmful content
export function analyzeContentQuality(text) {
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

// Extract topics from content
export function extractTopics(text, maxTopics = 5) {
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

// Calculate readability score (simplified)
export function calculateReadabilityScore(text) {
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
