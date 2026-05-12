const express = require("express");
const askOpenRouter = require("../services/openrouter.service");
const { buildTiggyContext } = require("../services/tiggyContext.service");

const router = express.Router();
const questionCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

router.post("/ask", async (req, res) => {
  try {
    const { question, history = [] } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        answer: "Please enter a question.",
      });
    }

    const aiContext = await buildTiggyContext(question, history);

    if (aiContext.empty) {
      return res.json({
        answer: "No matching information was found.",
      });
    }

    if (aiContext.directAnswer) {
      return res.json({
        answer: aiContext.directAnswer,
      });
    }

    const cached = questionCache.get(aiContext.cacheKey);

    if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
      return res.json({ answer: cached.answer });
    }

    const answer = await askOpenRouter(
      aiContext.resolvedQuestion,
      aiContext.contextText,
      history
    );

    questionCache.set(aiContext.cacheKey, {
      answer,
      createdAt: Date.now(),
    });

    res.json({ answer });
  } catch (error) {
    console.error("AI ask error:", error);

    if (error.message?.includes("OPENROUTER_API_KEY")) {
      return res.status(500).json({
        answer: "AI service is not configured properly.",
      });
    }

    if (error.message?.includes("timed out")) {
      return res.status(504).json({
        answer: "The AI took too long to respond. Please try again.",
      });
    }

    res.status(500).json({
      answer: "Something went wrong while getting the AI response.",
    });
  }
});

module.exports = router;
