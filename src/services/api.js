const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const token = localStorage.getItem("authToken");
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export function getEventGallery(eventId) {
  return request(`/api/event-gallery/${eventId}`);
}

export function getGalleryReviewItems() {
  return request("/api/event-gallery/admin/review");
}

export function reviewGalleryItem(itemId, action, reason = "") {
  return request(`/api/event-gallery/admin/review/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ action, reason }),
  });
}

export function moderateGalleryPreview(image) {
  return request("/api/event-gallery/moderate-preview", {
    method: "POST",
    body: JSON.stringify({ image }),
  });
}

export function getRecentEventGallery(limit = 6) {
  return request(`/api/event-gallery?limit=${encodeURIComponent(limit)}`);
}

export function createEventGalleryItem(eventId, galleryData) {
  return request(`/api/event-gallery/${eventId}`, {
    method: "POST",
    body: JSON.stringify(galleryData),
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

export function updateAnnouncementFeatured(announcementId, isAdminFeatured) {
  return request(`/api/announcements/${announcementId}`, {
    method: "PATCH",
    body: JSON.stringify({ isAdminFeatured }),
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

export function createAccount(accountData) {
  return request("/api/accounts", {
    method: "POST",
    body: JSON.stringify(accountData),
  });
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

export function getBookmarks() {
  return request("/api/bookmarks");
}

export function getNotifications() {
  return request("/api/notifications");
}

export function markAllNotificationsRead() {
  return request("/api/notifications/read-all", {
    method: "PATCH",
  });
}

export function markNotificationRead(notificationId) {
  return request(`/api/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

export function clearNotifications() {
  return request("/api/notifications/clear", {
    method: "POST",
  });
}

export function updateNotificationPreferences(notificationsEnabled) {
  return request("/api/auth/preferences", {
    method: "PATCH",
    body: JSON.stringify({ notificationsEnabled }),
  });
}

export function addBookmark(eventId) {
  return request(`/api/bookmarks/${eventId}`, {
    method: "POST",
  });
}

export function removeBookmark(eventId) {
  return request(`/api/bookmarks/${eventId}`, {
    method: "DELETE",
  });
}

export function registerUser(registrationData) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(registrationData),
  });
}

export function resendVerification(email) {
  return request("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function loginUser(credentials) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function forgotPassword(email) {
  return request("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token, password) {
  return request(`/api/auth/reset-password/${encodeURIComponent(token)}`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function verifyEmail(token) {
  return request(`/api/auth/verify-email/${encodeURIComponent(token)}`);
}

export function askTiggy(question, history = [], signal) {
  return request("/api/ai/ask", {
    method: "POST",
    body: JSON.stringify({ question, history }),
    signal,
  });
}
