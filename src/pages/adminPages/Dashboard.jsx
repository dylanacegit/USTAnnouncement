import StatCard from "../../components/adminComponents/StatCard";
import QuickActions from "../../components/adminComponents/QuickActions";
import { CiCalendar, CiBullhorn, CiUser } from "react-icons/ci";
import { IoIosPhotos } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { LuText } from "react-icons/lu";
import AdminTable from "../../components/adminComponents/AdminTable";
import Badge from "../../components/adminComponents/Badge";
export default function Dashboard() {
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
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-PH", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };
  return (
    <div className="space-y-2">
      <div>
        <h2 className="font-serif text-lg font-bold">Dashboard</h2>
        <p className="text-gray-500 text-xs">
          Welcome back Admin. Here's your overview.
        </p>
      </div>

      {/* 1. Stats Grid */}
      <div className="grid grid-cols-3  gap-2 sm:gap-6">
        <StatCard
          title="Total Events"
          value="12"
          subtext="+3 this week"
          icon={CiCalendar}
        />
        <StatCard
          title="Announcements"
          value="08"
          subtext="+1 this week"
          icon={CiBullhorn}
        />
        <StatCard
          title="Photos to Audit"
          value="45"
          subtext="+12 today"
          icon={IoIosPhotos}
        />
        {/* <StatCard
          title="Accounts"
          value="150"
          subtext="+5 new users"
          icon={CiUser}
        /> */}
      </div>

      {/* 2. Recent Activity Table (Placeholder for now) */}
      <div className="grid grid-cols-6  gap-4">
        <div className="sm:col-span-4 col-span-6 bg-white rounded-xl shadow-sm border border-gray-100  px-6">
          <h2 className="font-serif text-sm tracking-widest uppercase font-bold mb-4 border-b py-3">
            Recent Activity
          </h2>
          <div className="text-gray-400 text-sm italic">
            Table implementation coming in the next step...
          </div>
        </div>

        <div className="sm:col-span-2 col-span-6 bg-white rounded-xl shadow-sm border border-gray-100  px-6">
          <h2 className="font-serif text-sm py-3 tracking-widest uppercase font-bold mb-4 border-b">
            Quick Actions
          </h2>
          <div className="flex flex-col ">
            <QuickActions icon={FaPlus} title="Add new event" />
            <QuickActions icon={FaPlus} title="Add announcement" />
            <QuickActions icon={LuText} title="View all events" />
            <QuickActions icon={IoIosPhotos} title="Audit photos" />
          </div>
        </div>
      </div>

      {/* upcoming events */}
      <div className=" bg-white rounded-xl shadow-sm border border-gray-100  px-6">
        <h2 className="font-serif text-sm tracking-widest uppercase font-bold mb-4 border-b py-3">
          upcoming events at a glance
        </h2>
        <AdminTable headers={tableHeaders}>
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

              <td className="px-6 py-4 flex gap-2">
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
                <button className="hover:bg-gray-300 border  border-gray-500 text-gray-500 px-1 transition-colors">
                  view
                </button>
                <button className="hover:bg-gray-300 border  border-gray-500 text-gray-500 px-1 transition-colors">
                  edit
                </button>
                <button className="hover:bg-gray-300 border  border-red-500 text-red-500 px-1 transition-colors">
                  archive
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </div>
  );
}
