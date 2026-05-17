import { useEffect, useMemo, useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import {
  clearNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/api";

function formatTime(date) {
  if (!date) return "Just now";

  return new Date(date).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const unreadLabel = useMemo(() => {
    if (unreadCount > 9) return "9+";
    return unreadCount;
  }, [unreadCount]);

  async function loadNotifications() {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function handleOpen() {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);

    if (nextOpen) {
      await loadNotifications();
    }
  }

  async function handleRead(notification) {
    if (notification.readAt) return;

    try {
      await markNotificationRead(notification._id);
      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? { ...item, readAt: new Date().toISOString() }
            : item
        )
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (error) {
      console.error("Failed to mark notification read:", error);
    }
  }

  async function handleReadAll() {
    try {
      const data = await markAllNotificationsRead();
      setNotifications(data.notifications || []);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications read:", error);
    }
  }

  async function handleClear() {
    try {
      await clearNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="relative grid h-9 w-9 place-items-center text-white transition-colors hover:text-[#f6c744]"
        aria-label="Notifications"
      >
        <IoMdNotificationsOutline size={22} />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[#f6c744] px-1 text-[9px] font-black text-black">
            {unreadLabel}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[80] cursor-default"
            aria-label="Close notifications"
            onClick={() => setIsOpen(false)}
          />
          <section className="fixed left-3 right-3 top-16 z-[90] max-h-[calc(100vh-5rem)] overflow-hidden border border-neutral-200 bg-white font-inter text-neutral-950 shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+0.7rem)] sm:w-80">
            <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c49600]">
                  Notifications
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Gallery moderation updates
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleReadAll}
                    className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black"
                  >
                    Read all
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={notifications.length === 0}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 disabled:cursor-not-allowed disabled:text-neutral-300"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-[22rem] overflow-y-auto sm:max-h-[23rem]">
              {loading ? (
                <div className="px-4 py-5 text-sm text-neutral-500">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-5 text-sm text-neutral-500">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification._id}
                    type="button"
                    onClick={() => handleRead(notification)}
                    className={`block w-full border-b border-neutral-100 px-4 py-3 text-left transition-colors hover:bg-[#fffdf5] ${
                      notification.readAt ? "bg-white" : "bg-yellow-50/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-neutral-900">
                        {notification.title}
                      </p>
                      {!notification.readAt && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#f6c744]" />
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-neutral-600">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                      {formatTime(notification.createdAt)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
