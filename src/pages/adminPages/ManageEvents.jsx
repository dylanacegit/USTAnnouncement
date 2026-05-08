import AdminTable from "../../components/adminComponents/AdminTable";
import Badge from "../../components/adminComponents/Badge";
// import { FiEdit2, FiTrash2, FiEye } from "react-icons/fi";

export default function ManageEvents() {
  // Sample Data (In a real app, this comes from an API/Database)
  const events = [
    {
      id: 1,
      title: "University Basketball Cup",
      date: "Oct 24, 2024",
      venue: "Main Bldg Aud.",
      category: "Sports",
      attending: 120,
      //   status: "Published",
    },
    {
      id: 2,
      title: "University Basketball Cup",
      date: "Oct 24, 2024",
      venue: "Main Bldg Aud.",
      category: "Sports",
      attending: 120,
      //   status: "Published",
    },
    {
      id: 3,
      title: "University Basketball Cup",
      date: "Oct 24, 2024",
      venue: "Main Bldg Aud.",
      category: "Sports",
      attending: 120,
      //   status: "Published",
    },
  ];

  const tableHeaders = [
    "Event Title",
    "Date",
    "Venue",
    "Category",
    "Attending",
    "Actions",
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Manage Events
          </h1>
          <p className="text-sm text-gray-500">
            View and manage all organization events.
          </p>
        </div>
        <button className="bg-dark text-yellow-500 px-6 py-2 rounded-md font-bold text-sm hover:bg-gray-800 transition-colors border border-yellow-600/50">
          + CREATE NEW EVENT
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-gray-200 gap-8 mb-4">
        <button className="pb-2 border-b-2 border-dark font-bold text-xs uppercase tracking-widest text-dark">
          Published
        </button>
        <button className="pb-2 border-b-2 border-transparent font-bold text-xs uppercase tracking-widest text-gray-400 hover:text-gray-600">
          Archived
        </button>
      </div>

      {/* The Table */}
      <AdminTable headers={tableHeaders}>
        {events.map((event) => (
          <tr
            key={event.id}
            className="hover:bg-gray-50/50 transition-colors group"
          >
            <td className="px-6 py-4 text-sm font-medium text-gray-900">
              {event.title}
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">{event.date}</td>
            <td className="px-6 py-4">
              <Badge type={event.venue}>{event.venue}</Badge>
            </td>

            <td className="px-6 py-4">
              <Badge type={event.category}>{event.category}</Badge>
            </td>
            <td className="px-6 py-4 text-sm text-dark">{event.attending}</td>

            <td className="px-6 py-4">
              {/* <div className="flex gap-3 text-gray-400">
                <button className="hover:text-blue-600 transition-colors">
                  <FiEye size={18} />
                </button>
                <button className="hover:text-yellow-600 transition-colors">
                  <FiEdit2 size={18} />
                </button>
                <button className="hover:text-red-600 transition-colors">
                  <FiTrash2 size={18} />
                </button>
              </div> */}
              <button className="hover:bg-gray-300 bg-mauve-100 px-1 transition-colors">
                view
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
