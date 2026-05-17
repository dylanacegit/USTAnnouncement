import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useLocation } from "react-router-dom";
import { askTiggy } from "../services/api";

const suggestionPrompts = [
  "What are the upcoming events?",
  "Show latest announcements",
  "Are there events this week?",
  "Show sports events",
];

export default function AIChatWidget() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  const chatEndRef = useRef(null);
  const controllerRef = useRef(null);
  const cacheRef = useRef(new Map());

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("ask") === "tiggy") {
      setOpen(true);
    }
  }, [location.search]);

  useEffect(() => {
    if (open) {
      setUnreadCount(0);
      setShowWelcomeBubble(false);
      setHasOpenedOnce(true);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, open]);

  useEffect(() => {
    if (!loading) return;

    const timers = [
      setTimeout(() => setLoadingText("Tiggy is checking events..."), 0),
      setTimeout(() => setLoadingText("Looking through announcements..."), 700),
      setTimeout(() => setLoadingText("Preparing answer..."), 1400),
    ];

    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const clearChat = () => {
    setMessages([]);
    setQuestion("");
    setUnreadCount(0);
    cacheRef.current.clear();
  };

  const toggleChat = () => {
    setOpen((prev) => !prev);
  };

  const addAssistantMessage = (text, cached = false) => {
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text,
        cached,
        time: new Date(),
      },
    ]);

    if (!open) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  async function handleAsk(customQuestion = null) {
    const trimmed = (customQuestion || question).trim();
    if (!trimmed || loading) return;

    const recentHistory = messages.slice(-6);
    const cacheKey = trimmed.toLowerCase();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: trimmed,
        time: new Date(),
      },
    ]);

    setQuestion("");

    if (cacheRef.current.has(cacheKey)) {
      addAssistantMessage(cacheRef.current.get(cacheKey), true);
      return;
    }

    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);

    try {
      const data = await askTiggy(trimmed, recentHistory, controller.signal);
      let finalAnswer =
        data.answer || data.message || "No matching information was found.";

      if (finalAnswer === "No matching information was found.") {
        finalAnswer = `
No matching information was found.

Try asking:
- What are the upcoming events?
- Are there events this week?
- Show sports events
- Show latest announcements
        `.trim();
      }

      cacheRef.current.set(cacheKey, finalAnswer);
      addAssistantMessage(finalAnswer, false);
    } catch (error) {
      if (error.name !== "AbortError") {
        addAssistantMessage(
          "Sorry, Tiggy could not connect right now. Please try again.",
          false
        );
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
      {!open && showWelcomeBubble && !hasOpenedOnce && (
        <button
          onClick={toggleChat}
          className="fixed bottom-24 right-5 z-[98] hidden w-[360px] items-center gap-4 rounded-3xl bg-white px-5 py-4 text-left shadow-2xl transition hover:-translate-y-1 md:flex"
        >
          <img
            src="/images/tiggy-half.png"
            alt="Tiggy"
            className="h-11 w-11 shrink-0"
          />

          <div>
            <p className="text-sm font-semibold text-black">
              Need help finding events?
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Ask Tiggy about schedules, venues, and announcements.
            </p>
          </div>
        </button>
      )}

      {!open && unreadCount > 0 && (
        <button
          onClick={toggleChat}
          className="fixed bottom-24 right-5 z-[98] hidden w-[320px] items-center gap-4 rounded-3xl bg-white px-5 py-4 text-left shadow-2xl transition hover:-translate-y-1 md:flex"
        >
          <img
            src="/images/tiggy-head.png"
            alt="Tiggy"
            className="h-10 w-10 shrink-0"
          />

          <div>
            <p className="text-sm font-semibold text-black">
              Tiggy replied to your question.
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Open chat to view the answer.
            </p>
          </div>
        </button>
      )}

      {open && (
        <section className="fixed inset-x-3 bottom-20 z-[99] flex h-[min(680px,calc(100svh-96px))] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:inset-x-auto sm:right-7 sm:bottom-24 sm:w-[360px] md:w-[380px]">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-[#f6c744] px-4 sm:h-20 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#f6c744] sm:h-11 sm:w-11">
                <img
                  src="/images/tiggy-head.png"
                  alt="Tiggy"
                  className="h-full w-full translate-y-[1px] scale-110 object-cover object-center"
                />
              </div>

              <div className="min-w-0">
                <h4 className="text-base font-bold text-black">Tiggy</h4>
                <p className="truncate text-xs text-black/70 sm:text-sm">
                  UST events and announcements assistant
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="text-xs font-semibold text-black/60 hover:text-black"
                >
                  Clear
                </button>
              )}

              <button
                onClick={toggleChat}
                className="grid h-9 w-9 place-items-center rounded-full text-2xl leading-none text-black/60 hover:bg-black/10 hover:text-black"
                aria-label="Close chat"
              >
                x
              </button>
            </div>
          </header>

          <main className="flex-1 space-y-4 overflow-y-auto bg-neutral-50 p-4 sm:p-5">
            <div className="my-2 text-center">
              <span className="rounded-full bg-neutral-200/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Today
              </span>
            </div>

            {messages.length === 0 ? (
              <>
                <div className="rounded-3xl bg-[#f6c744] p-4 text-sm leading-7 text-black shadow-sm sm:p-5">
                  <p className="font-bold">Hi, Thomasian!</p>
                  <p className="mt-2">
                    I'm <strong className="font-bold">Tiggy</strong>, your Golden Gatherings assistant. Ask me about events, venues, announcements, organizers, and schedules.
                  </p>
                </div>

                <div className="pt-2">
                  <p className="mb-3 pl-1 text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                    Quick Questions
                  </p>
                  <div className="grid gap-2">
                    {suggestionPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleAsk(prompt)}
                        className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left text-sm font-medium text-neutral-800 shadow-sm transition hover:border-[#f6c744] hover:bg-[#f6c744]/5"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
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
                    className={`max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[82%] sm:px-5 ${
                      msg.role === "user"
                        ? "bg-[#f6c744] text-black"
                        : "bg-white text-black"
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold">{children}</strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="my-2 space-y-1 pl-4">{children}</ul>
                        ),
                        li: ({ children }) => (
                          <li className="list-disc">{children}</li>
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>

                    {msg.cached && (
                      <span className="mt-2 block text-[10px] text-neutral-500">
                        cached answer
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-3xl bg-white px-5 py-3 text-sm text-neutral-600 shadow-sm">
                  {loadingText || "Tiggy is thinking..."}
                </div>
              </div>
            )}

            {messages.length >= 10 && (
              <div className="rounded-2xl border border-[#f6c744] bg-[#fff8df] p-4 text-xs text-black">
                This chat is getting long. For better accuracy, you can start a
                new chat.
                <button
                  onClick={clearChat}
                  className="ml-2 font-bold text-[#b88600] hover:underline"
                >
                  Start New Chat
                </button>
              </div>
            )}

            <div ref={chatEndRef} />
          </main>

          {messages.length > 0 && (
            <div className="shrink-0 border-t border-neutral-100 bg-white px-4 py-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {suggestionPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleAsk(prompt)}
                    disabled={loading}
                    className="shrink-0 rounded-full border border-neutral-300 px-3 py-2 text-xs font-medium text-black transition hover:border-[#f6c744] hover:bg-[#f6c744] disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* REVISED COMPACT COMPONENT FOOTER STYLE */}
          <footer className="shrink-0 border-t border-neutral-200 bg-white p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about events, dates, venues..."
                className="h-12 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition focus:border-neutral-300 focus:bg-white"
              />

              <button
                onClick={() => handleAsk()}
                disabled={loading || !question.trim()}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#f6c744] text-black transition hover:bg-[#e3b832] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send message"
              >
                {loading ? (
                  <svg className="h-5 w-5 animate-spin text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="translate-x-[1px]"
                  >
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                )}
              </button>
            </div>
          </footer>
        </section>
      )}

      {/* COMPACT FLOATING TOGGLE BUTTON CONFIG */}
      <button
        onClick={toggleChat}
        className="fixed bottom-5 right-5 z-[100] grid h-14 w-14 place-items-center rounded-full bg-[#f6c744] text-black shadow-2xl transition hover:scale-105 sm:bottom-7 sm:right-7 sm:h-16 sm:w-16"
        aria-label="Open Tiggy chat"
      >
        {open ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#f6c744] sm:h-11 sm:w-11">
            <img
              src="/images/tiggy-head.png"
              alt="Tiggy"
              className="h-full w-full translate-y-[1px] scale-110 object-cover object-center"
            />
          </div>
        )}

        {!open && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}

        {!open && showWelcomeBubble && unreadCount === 0 && !hasOpenedOnce && (
          <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-[#f6c744] bg-red-600" />
        )}
      </button>
    </>
  );
}
