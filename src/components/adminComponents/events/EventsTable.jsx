import { useState } from "react";
import AdminTable from "../AdminTable";
import Badge from "../Badge";

export default function EventsTable({
  events,
  activeTab,
  setActiveTab,
  loading,
  currentPage,
  setCurrentPage,
  totalEvents,
  totalPages,
  pageSize,
  onToggleArchive,
  onViewEvent,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const headers = isEditing
    ? [
        "Event",
        "Schedule",
        "Venue",
        "Category",
        "Created By",
        "Created At",
        "Actions",
      ]
    : ["Event", "Schedule", "Venue", "Category", "Created By", "Created At"];

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-PH", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getDate = (event) => event.startDate || event.date;
  const getVenue = (event) => event.location || event.venue || "N/A";
  const getId = (event) => event._id || event.id;
  const getCreatedBy = (event) => event.createdBy || event.organizer || "System";
  const getCreatedAt = (event) => event.createdAt || event.updatedAt;
  const getScheduleLength = (event) => {
    const start = new Date(event.startDate || event.date);
    const end = new Date(event.endDate || event.startDate || event.date);

    if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
      return "N/A";
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const days = Math.max(
      1,
      Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
    );

    return `${days} ${days === 1 ? "day" : "days"}`;
  };
  const startItem = totalEvents === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalEvents);

  const handleToggleArchive = async (event) => {
    try {
      setUpdatingId(getId(event));
      await onToggleArchive(event);
    } finally {
      setUpdatingId(null);
    }
  };

  const PaginationControls = () => (
    <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-xs font-medium text-gray-500 sm:text-left">
        Showing {startItem}-{endItem} of {totalEvents}
      </p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex">
        <button
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={currentPage <= 1}
          className="h-8 rounded-md border border-gray-300 px-3 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <span className="px-2 text-center text-xs font-bold text-gray-500">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((page) => Math.min(totalPages, page + 1))
          }
          disabled={currentPage >= totalPages}
          className="h-8 rounded-md border border-gray-300 px-3 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4 lg:p-5">
      <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-full rounded-lg bg-gray-100 p-1 text-xs font-black uppercase tracking-[0.14em] sm:w-auto">
          {["published", "archived"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-md px-4 py-2 transition-colors sm:flex-none ${
                activeTab === tab
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab === "published" ? "Published" : "Archived"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button className="h-8 rounded-md border border-gray-700 px-3 text-xs font-bold transition-colors hover:bg-black hover:text-white sm:h-9 sm:px-4">
            Create
          </button>
          <button
            onClick={() => setIsEditing((current) => !current)}
            className={`h-8 rounded-md border px-3 text-xs font-bold transition-colors sm:h-9 sm:px-4 ${
              isEditing
                ? "border-gray-900 bg-black text-white hover:bg-gray-800"
                : "border-gray-700 text-black hover:bg-black hover:text-white"
            }`}
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      <div className="grid gap-2 md:hidden">
        {loading ? (
          <EmptyState text="Loading events..." />
        ) : events.length === 0 ? (
          <EmptyState text="No events found." />
        ) : (
          events.map((event) => (
            <article
              key={getId(event)}
              className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold leading-tight text-gray-950">
                    {event.title}
                  </h3>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {getVenue(event)}
                  </p>
                </div>
                <Badge type={event.category}>{event.category || "N/A"}</Badge>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <Info label="Schedule" value={getScheduleLength(event)} />
                <Info label="Date" value={formatDate(getDate(event))} />
                <Info label="Created By" value={getCreatedBy(event)} />
                <Info label="Created At" value={formatDate(getCreatedAt(event))} />
              </dl>
              {isEditing && (
                <div className="mt-3">
                  {activeTab === "archived" ? (
                    <button
                      onClick={() => handleToggleArchive(event)}
                      disabled={updatingId === getId(event)}
                      className="h-8 w-full rounded-md border border-green-500 px-3 text-xs font-bold text-green-700 transition-colors hover:bg-green-50 disabled:opacity-60"
                    >
                      {updatingId === getId(event) ? "Updating..." : "Unarchive"}
                    </button>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => onViewEvent(event)}
                        className="h-8 rounded-md border border-blue-500 px-2 text-xs font-bold text-blue-600 hover:bg-blue-50"
                      >
                        View
                      </button>
                      <button className="h-8 rounded-md border border-yellow-500 px-2 text-xs font-bold text-yellow-700 hover:bg-yellow-50">
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleArchive(event)}
                        disabled={updatingId === getId(event)}
                        className="h-8 rounded-md border border-red-500 px-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        {updatingId === getId(event) ? "..." : "Archive"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-gray-100 md:block">
        <div className="min-w-[1040px]">
          <AdminTable headers={headers}>
            {loading ? (
              <TableState colSpan={headers.length} text="Loading events..." />
            ) : events.length === 0 ? (
              <TableState colSpan={headers.length} text="No events found." />
            ) : (
              events.map((event) => (
                <tr key={getId(event)} className="hover:bg-yellow-50/50">
                  <td className="px-6 py-5 text-sm font-bold text-gray-950">
                    {event.title}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600">
                    {getScheduleLength(event)}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600">
                    {getVenue(event)}
                  </td>
                  <td className="px-6 py-5">
                    <Badge type={event.category}>{event.category || "N/A"}</Badge>
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600">
                    {getCreatedBy(event)}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600">
                    {formatDate(getCreatedAt(event))}
                  </td>
                  {isEditing && (
                    <td className="px-6 py-5">
                      {activeTab === "archived" ? (
                        <button
                          onClick={() => handleToggleArchive(event)}
                          disabled={updatingId === getId(event)}
                          className="h-8 rounded-md border border-green-500 px-3 text-xs font-bold text-green-700 hover:bg-green-50 disabled:opacity-60"
                        >
                          {updatingId === getId(event)
                            ? "Updating..."
                            : "Unarchive"}
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onViewEvent(event)}
                            className="h-8 rounded-md border border-blue-500 px-3 text-xs font-bold text-blue-600 hover:bg-blue-50"
                          >
                            View
                          </button>
                          <button className="h-8 rounded-md border border-yellow-500 px-3 text-xs font-bold text-yellow-700 hover:bg-yellow-50">
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleArchive(event)}
                            disabled={updatingId === getId(event)}
                            className="h-8 rounded-md border border-red-500 px-3 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
                          >
                            {updatingId === getId(event)
                              ? "Updating..."
                              : "Archive"}
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </AdminTable>
        </div>
      </div>

      {!loading && <PaginationControls />}
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <dt className="font-black uppercase tracking-[0.14em] text-gray-400">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-gray-700">{value}</dd>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-4 text-center text-xs text-gray-500">
      {text}
    </div>
  );
}

function TableState({ colSpan, text }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center text-sm text-gray-500">
        {text}
      </td>
    </tr>
  );
}
