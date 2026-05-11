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
    throw new Error(data?.message || data?.answer || "Request failed.");
  }

  return data;
}

export function getEvents() {
  return request("/api/events");
}

export function updateEventStatus(eventId, status) {
  return request(`/api/events/${eventId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function getAnnouncements() {
  return request("/api/announcements");
}

export function updateAnnouncementStatus(announcementId, status) {
  return request(`/api/announcements/${announcementId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
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
