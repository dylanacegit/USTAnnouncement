const vision = require("@google-cloud/vision");

const BLOCK_LEVELS = new Set(["LIKELY", "VERY_LIKELY"]);
const PROFANITY_TERMS = [
  "asshole",
  "bastard",
  "bitch",
  "bullshit",
  "cunt",
  "damn",
  "dick",
  "fuck",
  "motherfucker",
  "piss",
  "shit",
  "slut",
  "whore",
];

let client;

function getVisionClient() {
  if (!client) {
    client = new vision.ImageAnnotatorClient();
  }

  return client;
}

function getBase64Content(dataUrl) {
  const [, content] = String(dataUrl || "").split(",");

  if (!content) {
    throw new Error("A valid base64 image data URL is required.");
  }

  return content;
}

function normalizeText(text = "") {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function findProfanity(text = "") {
  const normalized = ` ${normalizeText(text)} `;

  return PROFANITY_TERMS.filter((term) => normalized.includes(` ${term} `));
}

function getFlaggedSafeSearch(safeSearch = {}) {
  return Object.entries(safeSearch)
    .filter(([category, likelihood]) => {
      return category !== "adultConfidence" && BLOCK_LEVELS.has(likelihood);
    })
    .map(([category, likelihood]) => ({ category, likelihood }));
}

function buildReason(flaggedSafeSearch, profaneWords) {
  const reasons = [];

  if (flaggedSafeSearch.length > 0) {
    reasons.push(
      flaggedSafeSearch
        .map((item) => `${item.category}: ${item.likelihood}`)
        .join(", ")
    );
  }

  if (profaneWords.length > 0) {
    reasons.push(`visible profanity: ${profaneWords.join(", ")}`);
  }

  if (reasons.length === 0) {
    return "Image passed Google Vision SafeSearch and text moderation.";
  }

  return `Image was rejected for ${reasons.join("; ")}.`;
}

function toDemoScores(safeSearch = {}) {
  return {
    adult: safeSearch.adult || "UNKNOWN",
    spoof: safeSearch.spoof || "UNKNOWN",
    medical: safeSearch.medical || "UNKNOWN",
    violence: safeSearch.violence || "UNKNOWN",
    racy: safeSearch.racy || "UNKNOWN",
  };
}

async function moderateGalleryImage(image) {
  const imageContent = getBase64Content(image);
  const client = getVisionClient();
  const [result] = await client.annotateImage({
    image: { content: imageContent },
    features: [
      { type: "SAFE_SEARCH_DETECTION" },
      { type: "TEXT_DETECTION" },
    ],
  });
  const safeSearch = result.safeSearchAnnotation || {};
  const detectedText = result.fullTextAnnotation?.text || "";
  const flaggedSafeSearch = getFlaggedSafeSearch(safeSearch);
  const profaneWords = findProfanity(detectedText);
  const approved = flaggedSafeSearch.length === 0 && profaneWords.length === 0;

  return {
    approved,
    status: approved ? "approved" : "rejected",
    visibility: approved ? "pending admin review" : "discarded",
    reason: buildReason(flaggedSafeSearch, profaneWords),
    provider: "google-cloud-vision",
    model: "safeSearchDetection + textDetection",
    safeSearch: toDemoScores(safeSearch),
    flaggedSafeSearch,
    detectedText,
    profaneWords,
    checkedAt: new Date(),
  };
}

module.exports = {
  moderateGalleryImage,
};
