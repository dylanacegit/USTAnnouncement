import { useEffect, useMemo, useState } from "react";
import {
  FiCheckSquare,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiImage,
  FiSearch,
  FiSquare,
  FiTrash2,
} from "react-icons/fi";
import {
  deleteApprovedGalleryItems,
  getApprovedGalleryItems,
  getEvents,
} from "../../services/api";

const PHOTOS_PER_PAGE = 20;

function formatDate(date) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalize(value) {
  return String(value || "").toLowerCase();
}

function normalizeLabel(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export default function EventGallery() {
  const [photos, setPhotos] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadGallery() {
      try {
        setLoading(true);
        const [galleryData, eventsData] = await Promise.all([
          getApprovedGalleryItems(),
          getEvents(),
        ]);

        setPhotos(Array.isArray(galleryData) ? galleryData : []);
        setEvents(Array.isArray(eventsData) ? eventsData : eventsData.events || []);
      } catch (error) {
        setMessage(error.message || "Failed to load approved gallery photos.");
      } finally {
        setLoading(false);
      }
    }

    loadGallery();
  }, []);

  const eventMeta = useMemo(() => {
    const meta = new Map();

    events.forEach((event) => {
      const title = normalizeLabel(event.title) || "Untitled Event";
      const category = normalizeLabel(event.category) || "Uncategorized";
      const value = { title, category };

      [event._id, event.id, event.eventId, title, title.toLowerCase()]
        .filter(Boolean)
        .forEach((key) => {
        meta.set(String(key), value);
      });
    });

    return meta;
  }, [events]);

  const enrichedPhotos = useMemo(() => {
    return photos.map((photo) => {
      const photoEventTitle = normalizeLabel(photo.eventTitle);
      const meta =
        eventMeta.get(String(photo.eventId)) ||
        eventMeta.get(String(photo.eventId || "").trim()) ||
        eventMeta.get(photoEventTitle) ||
        eventMeta.get(photoEventTitle.toLowerCase());

      return {
        ...photo,
        eventTitle: photoEventTitle || meta?.title || "Untitled Event",
        eventCategory: meta?.category || "Uncategorized",
      };
    });
  }, [eventMeta, photos]);

  const eventOptions = useMemo(() => {
    return Array.from(new Set(enrichedPhotos.map((photo) => photo.eventTitle)))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [enrichedPhotos]);

  const filteredPhotos = useMemo(() => {
    const query = normalize(searchTerm);

    return enrichedPhotos
      .filter((photo) => {
        const matchesSearch =
          !query ||
          [
            photo.title,
            photo.description,
            photo.eventTitle,
            photo.eventCategory,
            photo.submittedByName,
            photo.submittedByEmail,
          ]
            .some((value) => normalize(value).includes(query));
        const matchesEvent =
          eventFilter === "all" || photo.eventTitle === eventFilter;

        return matchesSearch && matchesEvent;
      })
      .sort((a, b) => {
        if (sortBy === "az") return (a.title || "").localeCompare(b.title || "");
        if (sortBy === "za") return (b.title || "").localeCompare(a.title || "");
        if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
        return new Date(b.reviewedAt || b.createdAt) - new Date(a.reviewedAt || a.createdAt);
      });
  }, [enrichedPhotos, eventFilter, searchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredPhotos.length / PHOTOS_PER_PAGE));
  const paginatedPhotos = useMemo(() => {
    const startIndex = (currentPage - 1) * PHOTOS_PER_PAGE;

    return filteredPhotos.slice(startIndex, startIndex + PHOTOS_PER_PAGE);
  }, [currentPage, filteredPhotos]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, eventFilter, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) => filteredPhotos.some((photo) => photo._id === id))
    );
  }, [filteredPhotos]);

  const visibleIds = paginatedPhotos.map((photo) => photo._id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const togglePhoto = (photoId) => {
    setSelectedIds((current) =>
      current.includes(photoId)
        ? current.filter((id) => id !== photoId)
        : [...current, photoId]
    );
  };

  const toggleVisible = () => {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const handleDelete = async (ids) => {
    if (ids.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${ids.length} approved gallery photo${ids.length === 1 ? "" : "s"}?`
    );

    if (!confirmed) return;

    try {
      await deleteApprovedGalleryItems(ids);
      setPhotos((current) => current.filter((photo) => !ids.includes(photo._id)));
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
      setMessage(`${ids.length} gallery photo${ids.length === 1 ? "" : "s"} deleted.`);
    } catch (error) {
      setMessage(error.message || "Failed to delete gallery photos.");
    }
  };

  return (
    <div className="mx-auto max-w-[1800px] space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-gray-950 sm:text-4xl">
            Event Gallery
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Manage approved event gallery photos that are visible to users.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          {editing && (
            <>
              <button
                type="button"
                onClick={toggleVisible}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-xs font-black text-gray-800 transition-colors hover:bg-gray-50"
              >
                {allVisibleSelected ? <FiCheckSquare /> : <FiSquare />}
                Select Page
              </button>
              <button
                type="button"
                onClick={() => handleDelete(selectedIds)}
                disabled={selectedIds.length === 0}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-xs font-black text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiTrash2 /> Delete {selectedIds.length || ""}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              setEditing((current) => !current);
              setSelectedIds([]);
            }}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-xs font-black transition-colors ${
              editing
                ? "border-black bg-black text-white hover:bg-gray-900"
                : "border-gray-900 text-gray-950 hover:bg-black hover:text-white"
            }`}
          >
            <FiEdit2 /> {editing ? "Cancel" : "Edit"}
          </button>
        </div>
      </header>

      {message && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-semibold text-yellow-900">
          {message}
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(260px,1fr)_240px_180px] lg:items-end">
          <label className="relative block">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              maxLength={80}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search photos or events"
              className="h-14 w-full rounded-xl border border-transparent bg-gray-50 pl-11 pr-4 text-sm font-medium text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-yellow-500 focus:bg-white"
            />
          </label>

          <FilterSelect
            label="Event"
            value={eventFilter}
            onChange={setEventFilter}
            options={eventOptions}
            allLabel="All events"
          />
          <FilterSelect
            label="Sort"
            value={sortBy}
            onChange={setSortBy}
            includeAll={false}
            options={[
              ["newest", "Newest"],
              ["oldest", "Oldest"],
              ["az", "A-Z"],
              ["za", "Z-A"],
            ]}
          />
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
              Approved Photos
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-700">
              {filteredPhotos.length} visible photo{filteredPhotos.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="rounded-lg border border-gray-100 p-2">
                <div className="aspect-[4/3] animate-pulse rounded-md bg-gray-200" />
                <div className="mt-3 h-4 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : paginatedPhotos.length === 0 ? (
          <div className="grid min-h-80 place-items-center rounded-lg border border-dashed border-gray-200 text-center">
            <div>
              <FiImage className="mx-auto text-4xl text-gray-300" />
              <p className="mt-3 font-playfair text-2xl font-bold text-gray-950">
                No approved photos found
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Try changing the search or filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5">
            {paginatedPhotos.map((photo) => {
              const selected = selectedIds.includes(photo._id);

              return (
                <article
                  key={photo._id}
                  className={`group overflow-hidden rounded-lg border bg-white shadow-sm transition-all ${
                    selected
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-gray-100 hover:border-yellow-400 hover:shadow-md"
                  }`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={photo.image}
                      alt={photo.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-2 top-2 bg-black/80 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-yellow-300">
                      Approved
                    </span>
                    {editing && (
                      <button
                        type="button"
                        onClick={() => togglePhoto(photo._id)}
                        className={`absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full border text-base shadow-sm transition-colors ${
                          selected
                            ? "border-red-500 bg-red-600 text-white"
                            : "border-white/70 bg-black/60 text-white hover:bg-black"
                        }`}
                        aria-label={selected ? "Unselect photo" : "Select photo"}
                      >
                        {selected ? <FiCheckSquare /> : <FiSquare />}
                      </button>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="truncate text-[8px] font-black uppercase tracking-widest text-gray-400">
                      {photo.eventCategory}
                    </p>
                    <h3 className="mt-1 font-playfair text-lg font-bold leading-tight text-gray-950 line-clamp-2">
                      {photo.title || "Untitled Photo"}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">
                      {photo.description || "No caption provided."}
                    </p>
                    <p className="mt-2 truncate text-xs font-semibold text-gray-500">
                      {photo.eventTitle}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <span>{formatDate(photo.reviewedAt || photo.createdAt)}</span>
                      {editing && (
                        <button
                          type="button"
                          onClick={() => handleDelete([photo._id])}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && filteredPhotos.length > PHOTOS_PER_PAGE && (
          <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 text-xs font-bold text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Page {currentPage} of {totalPages} / {filteredPhotos.length} photos
            </span>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <PageButton
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                <FiChevronLeft /> Previous
              </PageButton>
              <PageButton
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              >
                Next <FiChevronRight />
              </PageButton>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
  includeAll = true,
}) {
  const normalizedOptions = options.map((option) =>
    Array.isArray(option) ? option : [option, option]
  );

  return (
    <label className="relative block rounded-xl bg-gray-50 px-4 py-2.5">
      <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-7 w-full appearance-none bg-transparent pr-8 text-sm font-semibold text-gray-900 outline-none"
      >
        {includeAll && <option value="all">{allLabel}</option>}
        {normalizedOptions.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
      <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 text-gray-400" />
    </label>
  );
}

function PageButton({ disabled, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-gray-700 transition-colors hover:border-yellow-500 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
