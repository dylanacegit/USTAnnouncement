import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const suggestionPrompts = [
  "What are the upcoming events?",
  "Show latest announcements",
  "Are there events this week?",
  "Show sports events",
];

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);
  const [responseNotification, setResponseNotification] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const controllerRef = useRef(null);
  const cacheRef = useRef(new Map());

  const showResponseNotification = () => {
    if (!open) {
      setResponseNotification(true);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setQuestion("");
    cacheRef.current.clear();
  };

  async function handleAsk(customQuestion = null) {
    const trimmed = (customQuestion || question).trim();
    if (!trimmed || loading) return;

    const recentHistory = messages.slice(-6);
    const cacheKey = trimmed.toLowerCase();

    if (cacheRef.current.has(cacheKey)) {
      const cachedAnswer = cacheRef.current.get(cacheKey);

      setMessages((prev) => [
        ...prev,
        { role: "user", text: trimmed },
        { role: "assistant", text: cachedAnswer, cached: true },
      ]);

      setQuestion("");
      showResponseNotification();
      return;
    }

    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setQuestion("");
    setLoading(true);
    setLoadingText("Tiggy is checking events...");

    setTimeout(() => setLoadingText("Looking through announcements..."), 700);
    setTimeout(() => setLoadingText("Preparing answer..."), 1400);

    try {
      const response = await fetch("http://localhost:5000/api/ai/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmed,
          history: recentHistory,
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      let finalAnswer =
        data.answer || data.message || "No matching information was found.";

      if (finalAnswer === "No matching information was found.") {
        finalAnswer = `
No matching information was found.

You can try asking:
- What are the upcoming events?
- Are there events this week?
- Show sports events.
- Show latest announcements.
        `.trim();
      }

      cacheRef.current.set(cacheKey, finalAnswer);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: finalAnswer, cached: false },
      ]);

      showResponseNotification();
    } catch (error) {
      if (error.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Failed to contact Tiggy.",
            cached: false,
          },
        ]);
      }
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }

  return (
    <>
      {!open && hasNotification && !responseNotification && (
        <div className="fixed bottom-24 right-6 z-[98] hidden w-[420px] items-center gap-4 rounded-3xl bg-white px-6 py-4 shadow-2xl md:flex">
          <img src="/images/tiggy-half.png" alt="Tiggy" className="h-10 w-10" />

          <div>
            <p className="text-base font-medium text-black">
              For faster event searches and announcements...
            </p>

            <span className="text-sm text-neutral-500">Tiggy · Just now</span>
          </div>
        </div>
      )}

      {responseNotification && !open && (
        <div className="fixed bottom-24 right-6 z-[98] hidden w-[360px] items-center gap-4 rounded-3xl bg-white px-5 py-4 shadow-2xl md:flex">
          <img src="/images/tiggy-half.png" alt="Tiggy" className="h-10 w-10" />

          <div>
            <p className="text-base font-medium text-black">Tiggy is ready.</p>

            <span className="text-sm text-neutral-500">Tiggy · Just now</span>
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-x-3 bottom-20 z-[99] flex max-h-[calc(100svh-96px)] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:inset-x-auto sm:right-8 sm:bottom-24 sm:h-[620px] sm:w-[460px]">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 px-4 sm:h-20 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <img
                src="/images/tiggy-head.png"
                alt="Tiggy"
                className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
              />

              <div className="min-w-0">
                <h4 className="text-base font-bold text-black">Tiggy</h4>
                <p className="truncate text-xs text-neutral-500 sm:text-sm">
                  Ask me about UST events or announcements
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-xs font-semibold text-neutral-500 hover:text-black"
                >
                  Clear
                </button>
              )}

              <button
                onClick={() => setOpen(false)}
                className="text-3xl leading-none text-neutral-500 hover:text-black"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
            {messages.length === 0 ? (
              <>
                <div className="rounded-3xl border border-neutral-200 p-4 text-sm leading-7 text-neutral-700 sm:p-5">
                  <p className="font-bold text-black">👋 Hi Thomasian!</p>
                  <p className="mt-2">I can help you find:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>Upcoming events</li>
                    <li>College activities</li>
                    <li>Venue schedules</li>
                    <li>Organization announcements</li>
                  </ul>
                </div>

                <div className="grid gap-2">
                  {suggestionPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleAsk(prompt)}
                      className="rounded-full border border-[#f6c744] px-4 py-2 text-left text-xs font-semibold text-black hover:bg-[#f6c744]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[86%] rounded-3xl px-4 py-3 text-sm leading-6 sm:max-w-[80%] sm:px-5 ${
                      msg.role === "user"
                        ? "bg-[#f6c744] text-black"
                        : "bg-neutral-100 text-black"
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 leading-7">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold">{children}</strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="my-2 space-y-1">{children}</ul>
                        ),
                        li: ({ children }) => (
                          <li className="ml-5 list-disc">{children}</li>
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>

                    {msg.cached && (
                      <span className="mt-1 block text-[10px] text-neutral-500">
                        cached
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="inline-block rounded-3xl bg-neutral-100 px-5 py-3 text-sm text-neutral-600">
                {loadingText || "Tiggy is thinking..."}
              </div>
            )}

            {messages.length >= 10 && (
              <div className="rounded-2xl border border-[#f6c744] bg-[#fff8df] p-4 text-xs text-black">
                Conversation may become less accurate after many messages.
                <button
                  onClick={clearChat}
                  className="ml-2 font-bold text-[#c49600] hover:underline"
                >
                  Start New Chat
                </button>
              </div>
            )}
          </div>

          {messages.length > 0 && (
            <div className="shrink-0 border-t border-neutral-100 px-4 py-3">
              <div className="flex gap-2 overflow-x-auto">
                {suggestionPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleAsk(prompt)}
                    className="shrink-0 rounded-full border border-neutral-300 px-3 py-2 text-xs font-medium text-black hover:border-[#f6c744] hover:bg-[#f6c744]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="shrink-0 border-t border-neutral-200 p-3 sm:p-4">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about events, dates, announcements..."
              className="h-16 w-full resize-none rounded-2xl border border-neutral-300 p-3 text-sm outline-none focus:border-[#f6c744] sm:h-20 sm:p-4"
            />

            <button
              onClick={() => handleAsk()}
              disabled={loading}
              className="mt-3 h-11 w-full rounded-full bg-[#f6c744] text-sm font-bold text-black hover:bg-[#e3b832] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Searching..." : "Ask"}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setOpen((prev) => !prev);
          setHasNotification(false);
          setResponseNotification(false);
        }}
        className="fixed bottom-5 right-5 z-[100] grid h-14 w-14 place-items-center rounded-full bg-[#f6c744] text-xl text-black shadow-2xl hover:scale-105 sm:bottom-7 sm:right-7 sm:h-16 sm:w-16 sm:text-2xl"
      >
        {open ? "⌄" : 
            <img
                src="/images/tiggy-head.png"
                alt="Tiggy"
                className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
              />
        }

        {!open && (hasNotification || responseNotification) && (
          <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-xs font-bold text-white">
            1
          </span>
        )}
      </button>
    </>
  );
}