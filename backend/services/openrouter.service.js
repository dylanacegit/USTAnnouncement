const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function askOpenRouter(question, contextText, history = []) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing.");
  }

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("OpenRouter request timed out")), 15000)
  );

  const conversationHistory = history
    .slice(-4)
    .map((msg) => `${msg.role}: ${msg.text}`)
    .join("\n");

  const requestPromise = client.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || "openrouter/owl-alpha",
    messages: [
      {
        role: "system",
        content: `
You are Tiggy, a UST events and announcements assistant.

Your job:
- Answer ONLY from the provided context.
- Never invent event details.
- Never mention "database", "context", "JSON", or "provided data".
- Treat follow-up words like it, that, this, and there as referring to the most recent matching event or announcement in the conversation.
- If no matching information exists, reply exactly:
No matching information was found.

Answer style:
- For simple questions like where, when, who, what time: answer in 1 short sentence.
- For list questions like upcoming events: show multiple matching events, not just one.
- For detailed questions: use clean bullets with labels.
- Keep the answer student-friendly and direct.
- Do not add unnecessary intro phrases.

Status meanings:
- upcoming = event has not happened yet
- ongoing = event is currently happening
- done = event already ended
        `.trim(),
      },
      {
        role: "user",
        content: `
RECENT CONVERSATION:
${conversationHistory || "None"}

QUESTION:
${question}

MATCHED INFORMATION:
${contextText}
        `.trim(),
      },
    ],
    temperature: 0.1,
  });

  const response = await Promise.race([requestPromise, timeoutPromise]);

  return (
    response.choices?.[0]?.message?.content?.trim() ||
    "No matching information was found."
  );
}

module.exports = askOpenRouter;
