import Badge from "./Badge";
import DataTable from "./DataTable";

const tableHeaders = [
  "Title",
  "Type",
  "Event Title",
  "Category",
  "Image",
  "Created By",
  "Created At",
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

export default function AnnouncementsTable({
  announcements,
  activeTab,
  setActiveTab,
}) {
  return (
    <DataTable
      headers={tableHeaders}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      emptyMessage="No announcements found."
    >
      {announcements.map((item) => (
        <tr
          key={item.id}
          className="hover:bg-gray-50/50 transition-colors group"
        >
          <td className="px-6 py-4 text-sm font-medium text-gray-900">
            {item.title}
          </td>

          <td className="px-6 py-4 text-sm text-gray-500">{item.type}</td>

          <td className="px-6 py-4 text-sm text-dark">{item.etitle}</td>

          <td className="px-6 py-4">
            <Badge type={item.category}>{item.category}</Badge>
          </td>

          <td className="px-6 py-4">
            <img
              src={item.image}
              alt=""
              className="w-25 h-15 rounded object-cover border border-gray-200"
            />
          </td>

          <td className="px-6 py-4 text-sm font-medium text-gray-900">
            {item.createdBy}
          </td>

          <td className="px-6 py-4 text-sm text-dark">
            {formatDate(item.createdAt)}
          </td>
        </tr>
      ))}
    </DataTable>
  );
}
