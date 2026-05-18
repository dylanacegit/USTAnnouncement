import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiImage,
  FiRefreshCw,
  FiTrash2,
} from "react-icons/fi";
import { getGalleryReviewItems, reviewGalleryItem } from "../../services/api";

const APPROVALS_PER_PAGE = 20;
const REFRESH_INTERVAL_MS = 10000;
const DEFAULT_HOTKEYS = {
  approve: "a",
  decline: "d",
};

function getUniqueEvents(items) {
  return Array.from(
    new Set(items.map((item) => item.eventTitle || "Untitled Event"))
  ).sort((a, b) => a.localeCompare(b));
}

function formatDate(date) {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatTime(date) {
  if (!date) return "";

  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function normalizeKey(value, fallback) {
  const nextKey = String(value || "")
    .trim()
    .charAt(0)
    .toLowerCase();

  return nextKey || fallback;
}

export default function GalleryApprovals() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [eventFilter, setEventFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [message, setMessage] = useState("");
  const [hotkeys, setHotkeys] = useState(DEFAULT_HOTKEYS);

  const loadItems = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getGalleryReviewItems();
      const reviewItems = Array.isArray(data) ? data : [];

      setItems(reviewItems);
      setSelectedId((currentSelectedId) => {
        if (reviewItems.some((item) => item._id === currentSelectedId)) {
          return currentSelectedId;
        }

        return reviewItems[0]?._id || null;
      });
      setLastUpdatedAt(new Date());
    } catch (error) {
      setMessage(error.message || "Failed to load pending photos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (reviewing) return undefined;

    const interval = window.setInterval(() => {
      loadItems({ silent: true });
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [loadItems, reviewing]);

  const eventOptions = useMemo(() => getUniqueEvents(items), [items]);
  const filteredItems = useMemo(() => {
    if (eventFilter === "all") return items;

    return items.filter(
      (item) => (item.eventTitle || "Untitled Event") === eventFilter
    );
  }, [eventFilter, items]);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / APPROVALS_PER_PAGE)
  );
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * APPROVALS_PER_PAGE;

    return filteredItems.slice(startIndex, startIndex + APPROVALS_PER_PAGE);
  }, [currentPage, filteredItems]);
  const selectedItem =
    filteredItems.find((item) => item._id === selectedId) || filteredItems[0] || null;

  useEffect(() => {
    if (!selectedItem) {
      setSelectedId(filteredItems[0]?._id || null);
    }
  }, [filteredItems, selectedItem]);

  useEffect(() => {
    setCurrentPage(1);
  }, [eventFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleReview = useCallback(async (item, action) => {
    if (!item?._id || reviewing) return;

    try {
      setReviewing(true);
      const reason = action === "decline" ? "Declined during admin review." : "";
      await reviewGalleryItem(item._id, action, reason);
      setItems((current) => current.filter((photo) => photo._id !== item._id));
      setMessage(
        action === "approve"
          ? `"${item.title}" was posted to the gallery.`
          : `"${item.title}" was declined and deleted.`
      );
    } catch (error) {
      setMessage(error.message || "Failed to review photo.");
    } finally {
      setReviewing(false);
    }
  }, [reviewing]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (!selectedItem) return;
      if (event.target instanceof HTMLInputElement) return;
      if (event.target instanceof HTMLSelectElement) return;

      const key = event.key.toLowerCase();

      if (key === hotkeys.approve) {
        event.preventDefault();
        handleReview(selectedItem, "approve");
      }

      if (key === hotkeys.decline) {
        event.preventDefault();
        handleReview(selectedItem, "decline");
      }

      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const index = filteredItems.findIndex((item) => item._id === selectedItem._id);
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const nextIndex = Math.min(
          Math.max(index + direction, 0),
          filteredItems.length - 1
        );
        setSelectedId(filteredItems[nextIndex]?._id || selectedItem._id);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredItems, handleReview, hotkeys, selectedItem]);

  return (
    <div className="mx-auto max-w-[1800px] space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-gray-950 sm:text-4xl">
            Photo Approvals
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Review gallery submissions after Google Vision AI screening. Use
            the focused review panel first, then scan the growing queue below.
          </p>
        </div>

        <div className="flex items-stretch gap-3">
          <button
            type="button"
            onClick={() => loadItems({ silent: true })}
            disabled={loading || refreshing || reviewing}
            className="grid h-12 w-12 shrink-0 place-items-center bg-transparent text-yellow-600 transition-colors hover:text-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Refresh pending photos"
            title="Refresh pending photos"
          >
            <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
          </button>

          <section className="grid min-w-0 flex-1 grid-cols-3 gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm sm:min-w-[430px]">
            <Metric label="Pending" value={items.length} />
            <Metric label="Events" value={eventOptions.length} />
            <HotkeyMetric hotkeys={hotkeys} setHotkeys={setHotkeys} />
          </section>
        </div>
      </header>

      {message && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-900">
          {message}
        </div>
      )}

      <div className="mx-auto w-full max-w-6xl">
        <ReviewSpotlight
          item={selectedItem}
          loading={loading}
          reviewing={reviewing}
          hotkeys={hotkeys}
          onReview={handleReview}
        />
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-gray-500">
              <FiFilter className="text-yellow-700" />
              Pending Queue
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Auto-refreshes every 10 seconds
              {lastUpdatedAt ? ` / Last updated ${formatTime(lastUpdatedAt)}` : ""}
            </p>
          </div>

          <select
            value={eventFilter}
            onChange={(event) => setEventFilter(event.target.value)}
            className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 outline-none transition-colors focus:border-yellow-500 lg:min-w-[320px]"
          >
            <option value="all">All events</option>
            {eventOptions.map((eventTitle) => (
              <option key={eventTitle} value={eventTitle}>
                {eventTitle}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="rounded-lg border border-gray-100 p-3">
                  <div className="aspect-video animate-pulse rounded-md bg-gray-200" />
                  <div className="mt-3 h-3 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="mt-2 h-5 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              No pending photos for this filter.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {paginatedItems.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => setSelectedId(item._id)}
                  className={`group overflow-hidden rounded-lg border bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-yellow-400 hover:shadow-md ${
                    selectedItem?._id === item._id
                      ? "border-yellow-500 ring-1 ring-yellow-400"
                      : "border-gray-100"
                  }`}
                >
                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-2 top-2 bg-black/80 px-2 py-1 text-[7px] font-black uppercase tracking-widest text-yellow-300">
                      Pending
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-[7px] font-black uppercase tracking-widest text-gray-400">
                      {item.eventTitle || "Untitled Event"}
                    </p>
                    <h3 className="mt-1.5 font-playfair text-base font-bold leading-tight text-gray-950 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-gray-600">
                      {item.description || "No caption provided."}
                    </p>
                    <p className="mt-2 text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                      {formatDate(item.createdAt)}
                    </p>
                    {item.batchTotal > 1 && (
                      <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-yellow-700">
                        Batch {item.batchIndex} of {item.batchTotal}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {!loading && filteredItems.length > APPROVALS_PER_PAGE && (
          <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 text-xs font-bold text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Page {currentPage} of {totalPages} / {filteredItems.length} photos
            </span>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-gray-700 transition-colors hover:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronLeft /> Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-gray-700 transition-colors hover:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ReviewSpotlight({ item, loading, reviewing, hotkeys, onReview }) {
  if (loading) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="aspect-video animate-pulse rounded-lg bg-gray-200 lg:max-h-[28rem]" />
          <div className="space-y-3">
            <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
            <div className="h-9 animate-pulse rounded bg-gray-200" />
            <div className="h-24 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="grid min-h-[22rem] place-items-center rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
        <div>
          <FiImage className="mx-auto text-4xl text-gray-300" />
          <h2 className="mt-3 font-playfair text-2xl font-bold text-gray-950">
            No pending photo selected
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            New submissions will appear here after the next refresh.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="bg-[#070707] p-3 sm:p-4">
          <div className="grid aspect-video max-h-[30rem] min-h-[16rem] place-items-center rounded-lg bg-black sm:min-h-[20rem] lg:min-h-[24rem]">
            <img
              src={item.image}
              alt={item.title}
              className="h-full max-h-[30rem] w-full rounded-md object-contain"
            />
          </div>
        </div>

        <aside className="flex flex-col p-4 sm:p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-yellow-700">
              Ready for manual review
            </p>
            <h2 className="mt-2 font-playfair text-2xl font-bold leading-tight text-gray-950">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {item.description || "No caption provided."}
            </p>
          </div>

          <div className="mt-4 grid gap-2 text-sm">
            <Info label="Event" value={item.eventTitle || "Untitled Event"} />
            <Info label="Submitted by" value={item.submittedByName || "UST user"} />
            <Info label="Email" value={item.submittedByEmail || "Not available"} />
            <Info label="Submitted" value={formatDate(item.createdAt)} />
            {item.batchTotal > 1 && (
              <Info
                label="Batch"
                value={`Photo ${item.batchIndex} of ${item.batchTotal}`}
              />
            )}
            <Info
              label="AI decision"
              value={item.moderation?.reason || "Passed automated moderation."}
            />
          </div>

          <div className="mt-auto grid gap-2 pt-4 sm:grid-cols-2">
            <button
              type="button"
              disabled={reviewing}
              onClick={() => onReview(item, "approve")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-black text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              <FiCheck /> Approve
              <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] uppercase">
                {hotkeys.approve}
              </span>
            </button>
            <button
              type="button"
              disabled={reviewing}
              onClick={() => onReview(item, "decline")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-black text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              <FiTrash2 /> Decline
              <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] uppercase">
                {hotkeys.decline}
              </span>
            </button>
          </div>
          <p className="mt-2 text-center text-[9px] font-bold uppercase tracking-widest text-gray-400">
            Arrow left/right moves between submissions
          </p>
        </aside>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md bg-gray-50 px-3 py-2 text-center">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-gray-950">{value}</p>
    </div>
  );
}

function HotkeyMetric({ hotkeys, setHotkeys }) {
  return (
    <div className="rounded-md bg-gray-50 px-3 py-2 text-center">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        Keys
      </p>
      <div className="mt-1 flex items-center justify-center gap-1 text-lg font-black text-gray-950">
        <HotkeyInput
          label="Approve hotkey"
          value={hotkeys.approve}
          onChange={(value) =>
            setHotkeys((current) => ({
              ...current,
              approve: normalizeKey(value, DEFAULT_HOTKEYS.approve),
            }))
          }
        />
        <span>/</span>
        <HotkeyInput
          label="Decline hotkey"
          value={hotkeys.decline}
          onChange={(value) =>
            setHotkeys((current) => ({
              ...current,
              decline: normalizeKey(value, DEFAULT_HOTKEYS.decline),
            }))
          }
        />
      </div>
    </div>
  );
}

function HotkeyInput({ label, value, onChange }) {
  return (
    <input
      aria-label={label}
      value={value.toUpperCase()}
      onChange={(event) => onChange(event.target.value)}
      onFocus={(event) => event.target.select()}
      maxLength={1}
      className="h-7 w-7 rounded border border-transparent bg-white text-center text-base font-black uppercase text-gray-950 outline-none transition-colors focus:border-yellow-500 focus:bg-yellow-50"
    />
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}
