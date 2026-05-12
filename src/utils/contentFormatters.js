export function getItemImage(item) {
  return (
    item?.image ||
    item?.imageUrl ||
    item?.bannerImage ||
    item?.coverImage ||
    "/images/ust-main-building.png"
  );
}

export function formatDisplayDate(date, fallback = "Date TBA") {
  if (!date) return fallback;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.valueOf())) return String(date);

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateRange(item) {
  const start = item.startDate || item.date || item.createdAt;
  const end = item.endDate;

  if (!end || end === start) {
    return formatDisplayDate(start);
  }

  return `${formatDisplayDate(start)} - ${formatDisplayDate(end)}`;
}

export function formatTimeRange(item) {
  if (item.startTime && item.endTime) return `${item.startTime} - ${item.endTime}`;
  return item.startTime || item.time || "Time TBA";
}

export function getAnnouncementBody(announcement) {
  return announcement.content || announcement.caption || "No content provided.";
}

export function getPublishedItems(items) {
  return items.filter((item) => item.status?.toLowerCase() !== "archived");
}

export function isUpcomingItem(item) {
  const start = new Date(item.startDate || item.date || item.createdAt);
  const end = new Date(item.endDate || item.startDate || item.date || item.createdAt);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return !Number.isNaN(start.valueOf()) && !Number.isNaN(end.valueOf()) && end >= today;
}

export function matchesSearch(item, query, fields = []) {
  const keyword = query.trim().toLowerCase();

  if (!keyword) return true;

  return fields.some((field) => {
    const value = field
      .split(".")
      .reduce((current, key) => current?.[key], item);

    return String(value || "").toLowerCase().includes(keyword);
  });
}
