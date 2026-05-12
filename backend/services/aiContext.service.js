const { getPublishedAnnouncements } = require("./announcements.service");
const { getPublishedEvents } = require("./events.service");
const {
  formatDate,
  formatTime,
  getEventProgressStatus,
  normalizeDate,
} = require("../utils/dates");

const stopWords = new Set([
  "what",
  "when",
  "where",
  "who",
  "how",
  "is",
  "are",
  "the",
  "a",
  "an",
  "of",
  "to",
  "for",
  "in",
  "on",
  "at",
  "about",
  "details",
  "detail",
  "event",
  "events",
  "announcement",
  "announcements",
  "please",
  "show",
  "give",
  "tell",
  "me",
  "it",
  "that",
  "this",
  "they",
  "them",
  "there",
  "previous",
  "conversation",
  "user",
  "assistant",
]);

const aliases = {
  upcoming: ["upcoming", "future", "next", "soon", "coming"],
  previous: ["previous", "past", "done", "finished", "ended", "old"],
  today: ["today"],
  tomorrow: ["tomorrow"],
  week: ["this week"],
  where: ["where", "venue", "location", "held"],
  when: ["when", "date", "schedule"],
  time: ["time", "hour"],
  organizer: ["organizer", "host", "created"],
  detailed: ["details", "full", "complete", "information", "info"],
};

function isFollowUpQuestion(text) {
  return /\b(it|that|this|they|them|there|the event|the announcement)\b/i.test(
    text
  );
}

function getRecentConversationTopic(items = []) {
  return items
    .slice(-4)
    .map((msg) => `${msg.role}: ${msg.text}`)
    .join("\n");
}

function resolveQuestion(question, history) {
  const recentTopic = getRecentConversationTopic(history);

  if (isFollowUpQuestion(question) && recentTopic) {
    return `${question}\n\nPrevious conversation:\n${recentTopic}`;
  }

  return question;
}

function getIntent(q) {
  const hasAny = (list) => list.some((term) => q.includes(term));

  return {
    upcoming: hasAny(aliases.upcoming),
    previous: hasAny(aliases.previous),
    today: hasAny(aliases.today),
    tomorrow: hasAny(aliases.tomorrow),
    thisWeek: q.includes("this week"),
    where: hasAny(aliases.where),
    when: hasAny(aliases.when),
    time: hasAny(aliases.time),
    organizer: hasAny(aliases.organizer),
    detailed: hasAny(aliases.detailed),
  };
}

function searchableText(item) {
  return `
      ${item.title || ""}
      ${item.eventTitle || ""}
      ${item.description || ""}
      ${item.caption || ""}
      ${item.content || ""}
      ${item.category || ""}
      ${item.location || ""}
      ${item.organizer || ""}
      ${item.createdBy || ""}
      ${item.updatedBy || ""}
      ${(item.aliases || []).join(" ")}
    `.toLowerCase();
}

function getImportantWords(q) {
  return q
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

function getDirectEventAnswer(event, intent) {
  if (intent.where) {
    return event.location
      ? `The event will be held at ${event.location}.`
      : "No location was provided for this event.";
  }

  if (intent.when) {
    const dateText =
      event.endDate && event.endDate !== event.startDate
        ? `${formatDate(event.startDate)} to ${formatDate(event.endDate)}`
        : formatDate(event.startDate);

    return `The event is scheduled on ${dateText}.`;
  }

  if (intent.time) {
    return `The event time is ${formatTime(event)}.`;
  }

  if (intent.organizer) {
    return event.organizer
      ? `The event is organized by ${event.organizer}.`
      : "No organizer was provided for this event.";
  }

  return null;
}

function cleanEvent(event) {
  return {
    title: event.title,
    category: event.category,
    status: event.eventProgressStatus,
    date:
      event.endDate && event.endDate !== event.startDate
        ? `${formatDate(event.startDate)} to ${formatDate(event.endDate)}`
        : formatDate(event.startDate),
    time: formatTime(event),
    location: event.location || "No location provided",
    organizer: event.organizer || "No organizer provided",
    description: event.description || "",
    schedule: event.schedule || [],
  };
}

function cleanAnnouncement(announcement) {
  return {
    title: announcement.title,
    type: announcement.type,
    eventTitle: announcement.eventTitle,
    category: announcement.category,
    caption: announcement.caption || "",
    content: announcement.content || "",
    createdBy: announcement.createdBy || "",
    createdAt: announcement.createdAt,
  };
}

async function buildAiContext(question, history = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const resolvedQuestion = resolveQuestion(question, history);
  const q = resolvedQuestion.toLowerCase().trim();
  const intent = getIntent(q);
  const importantWords = getImportantWords(q);

  const [rawEvents, announcements] = await Promise.all([
    getPublishedEvents(),
    getPublishedAnnouncements(),
  ]);

  const events = rawEvents.map((event) => ({
    ...event,
    eventProgressStatus: getEventProgressStatus(event, today),
  }));

  const matchesQuestion = (item) => {
    if (importantWords.length === 0) return false;

    const text = searchableText(item);
    return importantWords.some((word) => text.includes(word));
  };

  const relatedAnnouncementsForEvent = (event) => {
    return announcements.filter((announcement) => {
      const eventTitle = event.title?.toLowerCase();
      const announcementEventTitle = announcement.eventTitle?.toLowerCase();

      return (
        announcementEventTitle === eventTitle ||
        searchableText(announcement).includes(eventTitle)
      );
    });
  };

  let selectedEvents = [];
  let selectedAnnouncements = [];

  if (intent.upcoming) {
    selectedEvents = events
      .filter((event) => event.eventProgressStatus === "upcoming")
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 5);
  } else if (intent.previous) {
    selectedEvents = events
      .filter((event) => event.eventProgressStatus === "done")
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      .slice(0, 5);
  } else if (intent.today) {
    selectedEvents = events.filter((event) => {
      const start = normalizeDate(event.startDate);
      const end = normalizeDate(event.endDate || event.startDate);
      return start && end && today >= start && today <= end;
    });
  } else if (intent.tomorrow) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    selectedEvents = events.filter((event) => {
      const start = normalizeDate(event.startDate);
      const end = normalizeDate(event.endDate || event.startDate);
      return start && end && tomorrow >= start && tomorrow <= end;
    });
  } else if (intent.thisWeek) {
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    selectedEvents = events.filter((event) => {
      const start = normalizeDate(event.startDate);
      return start && start >= today && start <= endOfWeek;
    });
  } else {
    selectedEvents = events.filter(matchesQuestion).slice(0, 5);
    selectedAnnouncements = announcements.filter(matchesQuestion).slice(0, 5);
  }

  selectedEvents.forEach((event) => {
    selectedAnnouncements.push(...relatedAnnouncementsForEvent(event));
  });

  selectedAnnouncements = selectedAnnouncements.slice(0, 5);

  if (selectedEvents.length === 0 && selectedAnnouncements.length === 0) {
    return {
      empty: true,
      resolvedQuestion,
    };
  }

  if (selectedEvents.length === 1) {
    const directAnswer = getDirectEventAnswer(selectedEvents[0], intent);

    if (directAnswer) {
      return {
        directAnswer,
        resolvedQuestion,
      };
    }
  }

  const cleanEvents = selectedEvents.map(cleanEvent);
  const cleanAnnouncements = selectedAnnouncements.map(cleanAnnouncement);
  const contextText = JSON.stringify(
    {
      today: today.toDateString(),
      events: cleanEvents,
      announcements: cleanAnnouncements,
    },
    null,
    2
  );
  const cacheKey = `${q}-${JSON.stringify(cleanEvents)}-${JSON.stringify(
    cleanAnnouncements
  )}`;

  return {
    cacheKey,
    contextText,
    resolvedQuestion,
  };
}

module.exports = {
  buildAiContext,
};
