const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function askOpenRouter(question, contextText) {
  const response = await client.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || "openrouter/free",
    messages: [
      {
        role: "system",
        content: `
You are a university events assistant.

Rules:
- Answer ONLY using the provided database context.
- Do NOT invent details.
- If there is no matching information, reply exactly:
  "No matching information was found."
- If only partial information is available, clearly say what is known and what is missing.
- Keep answers concise and helpful.
        `.trim(),
      },
      {
        role: "user",
        content: `DATABASE CONTEXT:\n${contextText}\n\nQUESTION:\n${question}`,
      },
    ],
    temperature: 0.2,
  });

  return response.choices[0]?.message?.content || "No matching information was found.";
}

module.exports = askOpenRouter;