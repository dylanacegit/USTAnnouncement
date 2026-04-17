import { useRef, useState } from "react";

function AiChat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const controllerRef = useRef(null);
  const cacheRef = useRef(new Map());

  async function handleAsk() {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    // frontend cache
    if (cacheRef.current.has(trimmed.toLowerCase())) {
      const cachedAnswer = cacheRef.current.get(trimmed.toLowerCase());

      setMessages((prev) => [
        ...prev,
        { role: "user", text: trimmed },
        { role: "assistant", text: cachedAnswer, cached: true },
      ]);

      setQuestion("");
      return;
    }

    // cancel previous request if still running
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: trimmed }),
        signal: controller.signal,
      });

      const data = await response.json();
      const finalAnswer =
        data.answer || data.message || "No matching information was found.";

      cacheRef.current.set(trimmed.toLowerCase(), finalAnswer);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: finalAnswer, cached: false },
      ]);
    } catch (error) {
      if (error.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Failed to contact AI service.",
            cached: false,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }

  return (
    <div className="ai-box">
      <h2>Ask AI</h2>

      <div className="chat-history">
        {messages.length === 0 ? (
          <p className="chat-placeholder">
            Ask about dates, venues, schedules, and announcements.
          </p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-bubble ${msg.role === "user" ? "user" : "assistant"}`}
            >
              <strong>{msg.role === "user" ? "You" : "AI"}</strong>
              <p>{msg.text}</p>
              {msg.cached && <span className="cached-tag">cached</span>}
            </div>
          ))
        )}
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about events, dates, announcements..."
      />

      <button onClick={handleAsk} disabled={loading}>
        {loading ? "Searching and thinking..." : "Ask"}
      </button>
    </div>
  );
}

export default AiChat;