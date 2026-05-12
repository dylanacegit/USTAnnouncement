const { getPublishedAnnouncements } = require("./announcements.service");
const { getPublishedEvents } = require("./events.service");
const {
  formatDate,
  formatTime,
  getEventProgressStatus,
  normalizeDate,
} = require("../utils/dates");

const MAX_LIST_ITEMS = 5;

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
  "any",
  "all",
  "list",
  "latest",
]);

const aliases = {
  upcoming: ["upcoming", "future", "next", "soon", "coming", "scheduled"],
  previous: ["previous", "past", "done", "finished", "ended", "old"],
  today: ["today"],
  tomorrow: ["tomorrow"],
  thisWeek: ["this week", "week"],
  latest: ["latest", "recent", "new", "newest"],
  where: ["where", "venue", "location", "held"],
  when: ["when", "date", "schedule"],
  time: ["time", "hour"],
  organizer: ["organizer", "host"],
  detailed: ["details", "full", "complete", "information", "info", "about"],
  announcements: ["announcement", "announcements", "updates", "posts"],
};

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text, list) {
  return list.some((term) => text.includes(term));
}

function isFollowUpQuestion(text) {
  return /\b(it|that|this|there|the event|the announcement)\b/i.test(text);
}

function getIntent(question) {
  const q = normalizeText(question);

  return {
    upcoming: hasAny(q, aliases.upcoming),
    previous: hasAny(q, aliases.previous),
    today: hasAny(q, aliases.today),
    tomorrow: hasAny(q, aliases.tomorrow),
    thisWeek: q.includes("this week") || /\bweek\b/.test(q),
    latest: hasAny(q, aliases.latest),
    where: hasAny(q, aliases.where),
    when: hasAny(q, aliases.when),
    time: hasAny(q, aliases.time),
    organizer: hasAny(q, aliases.organizer),
    detailed: hasAny(q, aliases.detailed),
    announcements: hasAny(q, aliases.announcements),
  };
}

function getImportantWords(question) {
  const words = normalizeText(question)
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  const expanded = new Set(words);

  words.forEach((word) => {
    if (word.startsWith("s") && word.length > 4) {
      expanded.add(word.slice(1));
    }
  });

  return Array.from(expanded);
}

function isUsefulMatchWord(word) {
  return !/^\d+$/.test(word) && word.length > 2;
}

function searchableText(item) {
  return normalizeText(`
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
  `);
}

function scoreMatch(item, words) {
  const usefulWords = words.filter(isUsefulMatchWord);

  if (usefulWords.length === 0) return 0;

  const title = normalizeText(item.title || item.eventTitle);
  const text = searchableText(item);

  return usefulWords.reduce((score, word) => {
    if (title.includes(word)) return score + 4;
    if (text.includes(word)) return score + 1;
    return score;
  }, 0);
}

function sortByStartDate(a, b) {
  return new Date(a.startDate || a.date) - new Date(b.startDate || b.date);
}

function sortByRecent(a, b) {
  return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
}

function dateRangeText(event) {
  return event.endDate && event.endDate !== event.startDate
    ? `${formatDate(event.startDate)} to ${formatDate(event.endDate)}`
    : formatDate(event.startDate);
}

function formatEventBullet(event) {
  return `- **${event.title}**: ${dateRangeText(event)} at ${
    event.location || "No location provided"
  }`;
}

function formatAnnouncementBullet(announcement) {
  return `- **${announcement.title}**: ${
    announcement.content || announcement.caption || "No content provided."
  }`;
}

function formatEventList(events, emptyText) {
  if (events.length === 0) return emptyText;
  return events.map(formatEventBullet).join("\n");
}

function formatAnnouncementList(announcements, emptyText) {
  if (announcements.length === 0) return emptyText;
  return announcements.map(formatAnnouncementBullet).join("\n");
}

function isEventActiveOn(event, date) {
  const start = normalizeDate(event.startDate);
  const end = normalizeDate(event.endDate || event.startDate);

  return start && end && date >= start && date <= end;
}

function overlapsRange(event, startRange, endRange) {
  const start = normalizeDate(event.startDate);
  const end = normalizeDate(event.endDate || event.startDate);

  return start && end && start <= endRange && end >= startRange;
}

function getDirectEventAnswer(event, intent) {
  if (intent.where) {
    return event.location
      ? `${event.title} will be held at ${event.location}.`
      : `No location was provided for ${event.title}.`;
  }

  if (intent.when) {
    return `${event.title} is scheduled on ${dateRangeText(event)}.`;
  }

  if (intent.time) {
    return `${event.title}'s time is ${formatTime(event)}.`;
  }

  if (intent.organizer) {
    return event.organizer
      ? `${event.title} is organized by ${event.organizer}.`
      : `No organizer was provided for ${event.title}.`;
  }

  return null;
}

function getDirectAnnouncementAnswer(announcement, intent, relatedEvent) {
  const title = announcement.title || "This announcement";
  const content = announcement.content || announcement.caption || "";

  if (intent.where) {
    if (relatedEvent?.location) {
      return `${title} is linked to ${relatedEvent.title}, which will be held at ${relatedEvent.location}.`;
    }

    return `No location was provided for ${title}.`;
  }

  if (intent.when || intent.time) {
    if (relatedEvent) {
      return `${relatedEvent.title} is scheduled on ${dateRangeText(relatedEvent)}.`;
    }

    return content
      ? `${title} says: ${content}`
      : `No date or time was provided for ${title}.`;
  }

  if (intent.detailed) {
    return content ? `${title}: ${content}` : `No content was provided for ${title}.`;
  }

  return null;
}

function cleanEvent(event) {
  return {
    title: event.title,
    category: event.category,
    status: event.eventProgressStatus,
    date: dateRangeText(event),
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
    content: announcement.content || announcement.caption || "",
    createdBy: announcement.createdBy || "",
    createdAt: announcement.createdAt,
  };
}

function relatedAnnouncementsForEvent(event, announcements) {
  return announcements.filter((announcement) => {
    const eventTitle = normalizeText(event.title);
    const announcementEventTitle = normalizeText(announcement.eventTitle);

    return (
      announcementEventTitle === eventTitle ||
      searchableText(announcement).includes(eventTitle)
    );
  });
}

function findBestMatchFromHistory(history, items, key) {
  const recentText = history
    .slice(-8)
    .map((msg) => msg.text)
    .join(" ");
  const words = getImportantWords(recentText);

  return items
    .map((item) => ({
      [key]: item,
      score: scoreMatch(item, words),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)[0];
}

function findEventByTitle(title, events) {
  const normalizedTitle = normalizeText(title);

  if (!normalizedTitle) return null;

  return events.find((event) => normalizeText(event.title) === normalizedTitle);
}

function selectMatchingItems(items, words) {
  return items
    .map((item) => ({ item, score: scoreMatch(item, words) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
    .slice(0, MAX_LIST_ITEMS);
}

async function buildTiggyContext(question, history = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const intent = getIntent(question);
  const importantWords = getImportantWords(question);

  const [rawEvents, announcements] = await Promise.all([
    getPublishedEvents(),
    getPublishedAnnouncements(),
  ]);

  const events = rawEvents.map((event) => ({
    ...event,
    eventProgressStatus: getEventProgressStatus(event, today),
  }));

  let selectedEvents = [];
  let selectedAnnouncements = [];

  if (isFollowUpQuestion(question)) {
    const referencedEvent = findBestMatchFromHistory(history, events, "event");
    const referencedAnnouncement = findBestMatchFromHistory(
      history,
      announcements,
      "announcement"
    );

    if (referencedEvent || referencedAnnouncement) {
      if ((referencedAnnouncement?.score || 0) > (referencedEvent?.score || 0)) {
        selectedAnnouncements = [referencedAnnouncement.announcement];
      } else {
        selectedEvents = [referencedEvent.event];
      }
    }
  }

  if (selectedEvents.length === 0) {
    if (intent.today) {
      selectedEvents = events.filter((event) => isEventActiveOn(event, today));
    } else if (intent.tomorrow) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      selectedEvents = events.filter((event) => isEventActiveOn(event, tomorrow));
    } else if (intent.thisWeek) {
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      selectedEvents = events
        .filter((event) => overlapsRange(event, today, endOfWeek))
        .sort(sortByStartDate)
        .slice(0, MAX_LIST_ITEMS);
    } else if (intent.upcoming) {
      selectedEvents = events
        .filter((event) => event.eventProgressStatus === "upcoming")
        .sort(sortByStartDate)
        .slice(0, MAX_LIST_ITEMS);
    } else if (intent.previous) {
      selectedEvents = events
        .filter((event) => event.eventProgressStatus === "done")
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
        .slice(0, MAX_LIST_ITEMS);
    } else {
      selectedEvents = selectMatchingItems(events, importantWords);
    }
  }

  if (intent.announcements && (intent.latest || importantWords.length === 0)) {
    selectedAnnouncements = announcements.sort(sortByRecent).slice(0, MAX_LIST_ITEMS);
  } else if (selectedAnnouncements.length === 0) {
    selectedAnnouncements = selectMatchingItems(announcements, importantWords);
  }

  selectedEvents.forEach((event) => {
    selectedAnnouncements.push(...relatedAnnouncementsForEvent(event, announcements));
  });

  selectedAnnouncements = Array.from(
    new Map(
      selectedAnnouncements
        .slice(0, MAX_LIST_ITEMS)
        .map((announcement) => [String(announcement._id), announcement])
    ).values()
  );

  if (selectedEvents.length === 1) {
    const directAnswer = getDirectEventAnswer(selectedEvents[0], intent);

    if (directAnswer) {
      return {
        directAnswer,
        resolvedQuestion: question,
      };
    }
  }

  if (selectedAnnouncements.length === 1) {
    const relatedEvent = findEventByTitle(selectedAnnouncements[0].eventTitle, events);
    const directAnswer = getDirectAnnouncementAnswer(
      selectedAnnouncements[0],
      intent,
      relatedEvent
    );

    if (directAnswer) {
      return {
        directAnswer,
        resolvedQuestion: question,
      };
    }
  }

  if (intent.today) {
    return {
      directAnswer: formatEventList(
        selectedEvents,
        "No published events are scheduled for today."
      ),
      resolvedQuestion: question,
    };
  }

  if (intent.tomorrow) {
    return {
      directAnswer: formatEventList(
        selectedEvents,
        "No published events are scheduled for tomorrow."
      ),
      resolvedQuestion: question,
    };
  }

  if (intent.thisWeek) {
    return {
      directAnswer: formatEventList(
        selectedEvents,
        "No published events are scheduled this week."
      ),
      resolvedQuestion: question,
    };
  }

  if (intent.upcoming) {
    return {
      directAnswer: formatEventList(
        selectedEvents,
        "No upcoming published events were found."
      ),
      resolvedQuestion: question,
    };
  }

  if (intent.announcements && intent.latest) {
    return {
      directAnswer: formatAnnouncementList(
        selectedAnnouncements,
        "No published announcements were found."
      ),
      resolvedQuestion: question,
    };
  }

  if (selectedEvents.length === 0 && selectedAnnouncements.length === 0) {
    return {
      empty: true,
      resolvedQuestion: question,
    };
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
  const cacheKey = `${normalizeText(question)}-${JSON.stringify(
    cleanEvents
  )}-${JSON.stringify(cleanAnnouncements)}`;

  return {
    cacheKey,
    contextText,
    resolvedQuestion: question,
  };
}

module.exports = {
  buildTiggyContext,
};
