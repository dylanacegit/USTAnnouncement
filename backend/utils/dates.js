function normalizeDate(date) {
  if (!date) return null;

  const normalized = new Date(date);
  if (isNaN(normalized)) return null;

  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function formatDate(date) {
  if (!date) return "No date provided";

  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(event) {
  if (event.startTime && event.endTime) {
    return `${event.startTime} - ${event.endTime}`;
  }

  return event.startTime || "No time provided";
}

function getEventProgressStatus(event, today) {
  const start = normalizeDate(event.startDate);
  const end = normalizeDate(event.endDate || event.startDate);

  if (!start || !end) return "unknown";

  end.setHours(23, 59, 59, 999);

  if (today > end) return "done";
  if (today >= start && today <= end) return "ongoing";
  return "upcoming";
}

module.exports = {
  formatDate,
  formatTime,
  getEventProgressStatus,
  normalizeDate,
};
