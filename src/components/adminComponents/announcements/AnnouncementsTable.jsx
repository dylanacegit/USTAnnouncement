import { useState } from "react";
import { FiArchive, FiEdit2, FiRotateCcw, FiStar, FiTrash2 } from "react-icons/fi";
import AdminTable from "../AdminTable";
import Badge from "../Badge";
import PersonCell from "../PersonCell";

export default function AnnouncementsTable({
  announcements,
  activeTab,
  setActiveTab,
  loading,
  currentPage,
  setCurrentPage,
  totalAnnouncements,
  totalPages,
  pageSize,
  onToggleArchive,
  onToggleFeatured,
  onDeleteAnnouncement,
  onViewAnnouncement,
  onEditAnnouncement,
  onCreateAnnouncement,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const headers = isEditing
    ? [
        "Title",
        "Type",
        "Event",
        "Category",
        "Created By",
        "Created At",
        "Updated By",
        "Updated At",
        "Actions",
      ]
    : [
        "Title",
        "Type",
        "Event",
        "Category",
        "Created By",
        "Created At",
        "Updated By",
        "Updated At",
      ];

  const getId = (announcement) => announcement._id || announcement.id;
  const hasMeaningfulUpdate = (announcement) => {
    if (!announcement.updatedBy) return false;

    const createdAt = new Date(announcement.createdAt).valueOf();
    const updatedAt = new Date(announcement.updatedAt).valueOf();

    return Number.isNaN(createdAt) || Number.isNaN(updatedAt) || updatedAt !== createdAt;
  };
  const getUpdatedBy = (announcement) =>
    hasMeaningfulUpdate(announcement) ? announcement.updatedBy : "";
  const getUpdatedAt = (announcement) =>
    hasMeaningfulUpdate(announcement) ? announcement.updatedAt : null;
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-PH", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };
  const startItem =
    totalAnnouncements === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalAnnouncements);

  const handleToggleArchive = async (announcement) => {
    try {
      setUpdatingId(getId(announcement));
      await onToggleArchive(announcement);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteAnnouncement = async (announcement) => {
    const confirmed = window.confirm(
      `Permanently delete "${announcement.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(getId(announcement));
      await onDeleteAnnouncement(announcement);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleFeatured = async (announcement) => {
    try {
      setUpdatingId(getId(announcement));
      await onToggleFeatured(announcement);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRowKeyDown = (keyboardEvent, announcement) => {
    if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
      keyboardEvent.preventDefault();
      onViewAnnouncement(announcement);
    }
  };

  const stopActionClick = (clickEvent) => {
    clickEvent.stopPropagation();
  };

  const PaginationControls = () => (
    <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-xs font-medium text-gray-500 sm:text-left">
        Showing {startItem}-{endItem} of {totalAnnouncements}
      </p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex">
        <button
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={currentPage <= 1}
          className="h-8 rounded-md border border-gray-300 px-3 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
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
          className="h-8 rounded-md border border-gray-300 px-3 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
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
          <button
            onClick={onCreateAnnouncement}
            className="h-8 rounded-md border border-gray-700 px-3 text-xs font-bold hover:bg-black hover:text-white sm:h-9 sm:px-4"
          >
            Create
          </button>
          <button
            onClick={() => setIsEditing((current) => !current)}
            className={`h-8 rounded-md border px-3 text-xs font-bold sm:h-9 sm:px-4 ${
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
          <EmptyState text="Loading announcements..." />
        ) : announcements.length === 0 ? (
          <EmptyState text="No announcements found." />
        ) : (
          announcements.map((announcement) => (
            <article
              key={getId(announcement)}
              role="button"
              tabIndex={0}
              onClick={() => onViewAnnouncement(announcement)}
              onKeyDown={(keyboardEvent) =>
                handleRowKeyDown(keyboardEvent, announcement)
              }
              className="cursor-pointer rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition-colors hover:border-yellow-300 hover:bg-yellow-50/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold leading-tight text-gray-950">
                    {announcement.title}
                  </h3>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {announcement.eventTitle || "General announcement"}
                  </p>
                </div>
                <Badge type={announcement.category} variant="neutral">
                  {announcement.category || "N/A"}
                </Badge>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <Info label="Type" value={announcement.type || "N/A"} />
                <Info label="Category" value={announcement.category || "N/A"} />
                <Info
                  label="Created By"
                  value={
                    <PersonCell
                      name={announcement.createdBy || "System"}
                      email={announcement.createdByEmail}
                    />
                  }
                />
                <Info label="Created At" value={formatDate(announcement.createdAt)} />
                <Info
                  label="Updated By"
                  value={
                    <PersonCell
                      name={getUpdatedBy(announcement)}
                      email={announcement.updatedByEmail}
                      fallback="N/A"
                    />
                  }
                />
                <Info label="Updated At" value={formatDate(getUpdatedAt(announcement))} />
              </dl>
              {isEditing && (
                <div className="mt-3">
                  {activeTab === "archived" ? (
                    <div className="flex justify-end gap-2">
                      <IconButton
                        label="Unarchive announcement"
                        tone="green"
                        onClick={(clickEvent) => {
                          stopActionClick(clickEvent);
                          handleToggleArchive(announcement);
                        }}
                        disabled={updatingId === getId(announcement)}
                      >
                        <FiRotateCcw size={16} />
                      </IconButton>
                      <IconButton
                        label="Permanently delete announcement"
                        tone="red"
                        onClick={(clickEvent) => {
                          stopActionClick(clickEvent);
                          handleDeleteAnnouncement(announcement);
                        }}
                        disabled={updatingId === getId(announcement)}
                      >
                        <FiTrash2 size={16} />
                      </IconButton>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <IconButton
                        label={
                          announcement.isAdminFeatured
                            ? "Remove pinned announcement"
                            : "Pin as featured announcement"
                        }
                        tone={announcement.isAdminFeatured ? "black" : "yellow"}
                        onClick={(clickEvent) => {
                          stopActionClick(clickEvent);
                          handleToggleFeatured(announcement);
                        }}
                        disabled={updatingId === getId(announcement)}
                      >
                        <FiStar
                          size={16}
                          className={announcement.isAdminFeatured ? "fill-current" : ""}
                        />
                      </IconButton>
                      <IconButton
                        label="Edit announcement"
                        tone="yellow"
                        onClick={(clickEvent) => {
                          stopActionClick(clickEvent);
                          onEditAnnouncement(announcement);
                        }}
                      >
                        <FiEdit2 size={16} />
                      </IconButton>
                      <IconButton
                        label="Archive announcement"
                        tone="red"
                        onClick={(clickEvent) => {
                          stopActionClick(clickEvent);
                          handleToggleArchive(announcement);
                        }}
                        disabled={updatingId === getId(announcement)}
                      >
                        <FiArchive size={16} />
                      </IconButton>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-gray-100 md:block">
        <div className="min-w-[1320px]">
          <AdminTable headers={headers}>
            {loading ? (
              <TableState colSpan={headers.length} text="Loading announcements..." />
            ) : announcements.length === 0 ? (
              <TableState colSpan={headers.length} text="No announcements found." />
            ) : (
              announcements.map((announcement) => (
                <tr
                  key={getId(announcement)}
                  tabIndex={0}
                  onClick={() => onViewAnnouncement(announcement)}
                  onKeyDown={(keyboardEvent) =>
                    handleRowKeyDown(keyboardEvent, announcement)
                  }
                  className="cursor-pointer transition-colors hover:bg-yellow-50/50 focus:bg-yellow-50 focus:outline-none"
                >
                  <td className="px-6 py-5 text-sm font-bold text-gray-950">
                    {announcement.title}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600">
                    {announcement.type || "N/A"}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600">
                    {announcement.eventTitle || "N/A"}
                  </td>
                  <td className="px-6 py-5">
                    <Badge type={announcement.category} variant="neutral">
                      {announcement.category || "N/A"}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <PersonCell
                      name={announcement.createdBy || "System"}
                      email={announcement.createdByEmail}
                    />
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600">
                    {formatDate(announcement.createdAt)}
                  </td>
                  <td className="px-6 py-5">
                    <PersonCell
                      name={getUpdatedBy(announcement)}
                      email={announcement.updatedByEmail}
                      fallback="N/A"
                    />
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-600">
                    {formatDate(getUpdatedAt(announcement))}
                  </td>
                  {isEditing && (
                    <td className="px-6 py-5">
                      {activeTab === "archived" ? (
                        <div className="flex gap-2">
                          <IconButton
                            label="Unarchive announcement"
                            tone="green"
                            onClick={(clickEvent) => {
                              stopActionClick(clickEvent);
                              handleToggleArchive(announcement);
                            }}
                            disabled={updatingId === getId(announcement)}
                          >
                            <FiRotateCcw size={16} />
                          </IconButton>
                          <IconButton
                            label="Permanently delete announcement"
                            tone="red"
                            onClick={(clickEvent) => {
                              stopActionClick(clickEvent);
                              handleDeleteAnnouncement(announcement);
                            }}
                            disabled={updatingId === getId(announcement)}
                          >
                            <FiTrash2 size={16} />
                          </IconButton>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <IconButton
                            label={
                              announcement.isAdminFeatured
                                ? "Remove pinned announcement"
                                : "Pin as featured announcement"
                            }
                            tone={announcement.isAdminFeatured ? "black" : "yellow"}
                            onClick={(clickEvent) => {
                              stopActionClick(clickEvent);
                              handleToggleFeatured(announcement);
                            }}
                            disabled={updatingId === getId(announcement)}
                          >
                            <FiStar
                              size={16}
                              className={announcement.isAdminFeatured ? "fill-current" : ""}
                            />
                          </IconButton>
                          <IconButton
                            label="Edit announcement"
                            tone="yellow"
                            onClick={(clickEvent) => {
                              stopActionClick(clickEvent);
                              onEditAnnouncement(announcement);
                            }}
                          >
                            <FiEdit2 size={16} />
                          </IconButton>
                          <IconButton
                            label="Archive announcement"
                            tone="red"
                            onClick={(clickEvent) => {
                              stopActionClick(clickEvent);
                              handleToggleArchive(announcement);
                            }}
                            disabled={updatingId === getId(announcement)}
                          >
                            <FiArchive size={16} />
                          </IconButton>
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
      <dd className="mt-0.5 min-w-0 text-gray-700">{value}</dd>
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

function IconButton({ label, tone, disabled = false, onClick, children }) {
  const toneClasses = {
    green: "border-green-500 text-green-700 hover:bg-green-50",
    red: "border-red-500 text-red-600 hover:bg-red-50",
    yellow: "border-yellow-500 text-yellow-700 hover:bg-yellow-50",
    black: "border-gray-900 bg-black text-yellow-300 hover:bg-gray-800",
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid h-9 w-9 place-items-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${toneClasses[tone]}`}
    >
      {children}
    </button>
  );
}
