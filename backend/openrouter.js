const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function askOpenRouter(question, contextText, history = []) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("OpenRouter request timed out")), 15000)
  );

  const conversationHistory = history
    .slice(-6)
    .map((msg) => `${msg.role}: ${msg.text}`)
    .join("\n");

  const requestPromise = client.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || "openrouter/free",
    messages: [
      {
        role: "system",
        content: `
You are Tiggy, a friendly UST events and announcements assistant.

Rules:
- Answer ONLY using the provided database context.
- Use recent conversation history to understand follow-up questions.
- Do NOT invent details.
- If there is no matching information, reply exactly:
  "No matching information was found."
- Keep answers concise, clear, and student-friendly.
- Use short paragraphs or bullet points.
- Use Markdown formatting.
- Highlight dates, times, locations, organizers, and categories using bold labels.
- Understand categories such as sports, academic, community, health, engineering, seminar, technology, scholarship, safety, leadership, and concert.
- Understand fuzzy terms and abbreviations such as "eng week" for Engineering Week, "hackaton" for hackathon, "bball" for basketball, and "fire drill" for fire drill.
- When answering if an event is done, upcoming, or ongoing, use eventProgressStatus if provided.
- Do not mention "database context" in the final answer.
- Use eventProgressStatus when answering if an event is done, upcoming, or ongoing.
- If eventProgressStatus is "done", clearly say the event has already ended.
- If eventProgressStatus is "upcoming", say it has not happened yet.
- If eventProgressStatus is "ongoing", say it is currently happening.
        `.trim(),
      },
      {
        role: "user",
        content: `
DATABASE CONTEXT:
${contextText}

RECENT CONVERSATION:
${conversationHistory || "No previous conversation."}

CURRENT QUESTION:
${question}
        `.trim(),
      },
    ],
    temperature: 0.2,
  });

  const response = await Promise.race([requestPromise, timeoutPromise]);

  return (
    response.choices?.[0]?.message?.content ||
    "No matching information was found."
  );
}

module.exports = askOpenRouter;