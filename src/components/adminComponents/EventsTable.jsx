import Badge from "./Badge";
import DataTable from "./DataTable";

const tableHeaders = [
  "Event Title",
  "Date",
  "Venue",
  "Category",
  "Attending",
  "Actions",
];

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-PH", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const tabs = [
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

export default function EventsTable({
  events,
  activeTab,
  setActiveTab,
  onView,
}) {
  return (
    <DataTable
      headers={tableHeaders}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      emptyMessage="No events found."
    >
      {events.map((event) => (
        <tr
          key={event.id}
          className="hover:bg-gray-50/50 transition-colors group"
        >
          <td className="px-6 py-4 text-sm font-medium text-gray-900">
            {event.title}
          </td>

          <td className="px-6 py-4 text-sm text-gray-500">
            {formatDate(event.date)}
          </td>

          <td className="px-6 py-4">
            <Badge type={event.venue}>{event.venue}</Badge>
          </td>

          <td className="px-6 py-4">
            <Badge type={event.category}>{event.category}</Badge>
          </td>

          <td className="px-6 py-4 text-sm text-dark">{event.attending}</td>

          <td className="px-6 py-4">
            <div className="flex gap-2">
              <button
                onClick={() => onView?.(event)}
                className="border border-gray-400 px-3 py-1 text-xs hover:bg-gray-100"
              >
                View
              </button>

              <button className="border border-gray-400 px-3 py-1 text-xs hover:bg-gray-100">
                Edit
              </button>

              <button className="border border-red-400 text-red-600 px-3 py-1 text-xs hover:bg-red-50">
                Archive
              </button>
            </div>
          </td>
        </tr>
      ))}
    </DataTable>
  );
}
