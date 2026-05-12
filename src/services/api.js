const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error("The selected image is too large. Please choose a smaller image.");
    }

    throw new Error(data?.message || data?.answer || "Request failed.");
  }

  return data;
}

export function getEvents() {
  return request("/api/events");
}

export function createEvent(eventData) {
  return request("/api/events", {
    method: "POST",
    body: JSON.stringify(eventData),
  });
}

export function updateEvent(eventId, eventData) {
  return request(`/api/events/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(eventData),
  });
}

export function updateEventStatus(eventId, status) {
  return request(`/api/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function updateEventFeatured(eventId, isFeatured) {
  return request(`/api/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify({ isFeatured }),
  });
}

export function deleteEvent(eventId) {
  return request(`/api/events/${eventId}`, {
    method: "DELETE",
  });
}

export function getAnnouncements() {
  return request("/api/announcements");
}

export function createAnnouncement(announcementData) {
  return request("/api/announcements", {
    method: "POST",
    body: JSON.stringify(announcementData),
  });
}

export function updateAnnouncement(announcementId, announcementData) {
  return request(`/api/announcements/${announcementId}`, {
    method: "PUT",
    body: JSON.stringify(announcementData),
  });
}

export function updateAnnouncementStatus(announcementId, status) {
  return request(`/api/announcements/${announcementId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteAnnouncement(announcementId) {
  return request(`/api/announcements/${announcementId}`, {
    method: "DELETE",
  });
}

export function getEventAnnouncements(eventTitle) {
  return request(`/api/announcements/event/${encodeURIComponent(eventTitle)}`);
}

export function getAccounts() {
  return request("/api/accounts");
}

export function updateAccountStatus(accountId, status) {
  return request(`/api/accounts/${accountId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function updateAccountDepartment(accountId, department) {
  return request(`/api/accounts/${accountId}`, {
    method: "PATCH",
    body: JSON.stringify({ department }),
  });
}

export function updateAccountProfile(accountId, profile) {
  return request(`/api/accounts/${accountId}`, {
    method: "PATCH",
    body: JSON.stringify(profile),
  });
}

export function deleteAccount(accountId) {
  return request(`/api/accounts/${accountId}`, {
    method: "DELETE",
  });
}

export function askTiggy(question, history = [], signal) {
  return request("/api/ai/ask", {
    method: "POST",
    body: JSON.stringify({ question, history }),
    signal,
  });
}
