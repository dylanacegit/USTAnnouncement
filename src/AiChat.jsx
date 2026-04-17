import { useState } from "react";

function AiChat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch("http://localhost:5000/api/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      setAnswer(data.answer || data.message || "No matching information was found.");
    } catch (error) {
      setAnswer("Failed to contact AI service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-box">
      <h2>Ask AI</h2>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask about events, dates, announcements..."
      />

      <button onClick={handleAsk} disabled={loading}>
        {loading ? "Searching and thinking..." : "Ask"}
      </button>

      {answer && (
        <div className="ai-answer">
          <strong>Answer</strong>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

export default AiChat;