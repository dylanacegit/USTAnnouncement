import AdminTable from "../../components/adminComponents/AdminTable";
import Badge from "../../components/adminComponents/Badge";
import StatCard from "../../components/adminComponents/StatCard";
import { LuText } from "react-icons/lu";
import { IoIosPhotos } from "react-icons/io";
import { useState } from "react";
import FilterBar from "../../components/adminComponents/mngevents/FilterBar";
import Pagination from "../../components/adminComponents/mngevents/Pagination";
import EventModal from "../../components/adminComponents/mngevents/EventModal";

// import { FiEdit2, FiTrash2, FiEye } from "react-icons/fi";

export default function ManageAnnouncements() {
  // Sample Data (In a real app, this comes from an API/Database)
  const events = [
    {
      id: 1,
      title: "University Basketball Cup",
      type: "Event",
      etitle: "University Basketball Cup.",
      category: "Sports",
      image: "/images/tls.png",
      createdBy: "Dylan",
      createdAt: "01/01/2026",
    },
    {
      id: 2,
      title: "University Basketball Cup",
      type: "Event",
      etitle: "University Basketball Cup.",
      category: "Sports",
      image: "/images/tls.png",
      createdBy: "Dylan",
      createdAt: "01/01/2026",
    },
    {
      id: 3,
      title: "University Basketball Cup",
      type: "Event",
      etitle: "University Basketball Cup.",
      category: "Sports",
      image: "/images/tls.png",
      createdBy: "Dylan",
      createdAt: "01/01/2026",
    },
  ];

  const tableHeaders = [
    " Title",
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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  //   const handleViewDetails = (event) => {
  //     // Add dummy data for the details view
  //     const detailedEvent = {
  //       ...event,
  //       venue: "Frassati Building",
  //       organizer: "CICS Student Council",
  //       description: "College Week is the biggest annual celebration...",
  //       createdBy: "Dylan",
  //       createdAt: "December 18, 2026",
  //       updatedAt: "December 22, 2026",
  //     };
  //     setSelectedEvent(detailedEvent);
  //     setIsModalOpen(true);
  //   };
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Manage Announcements
          </h1>
          <p className="text-sm text-gray-500">
            View and manage all organization events.
          </p>
        </div>
        {/* <button className="bg-dark text-yellow-500 px-6 py-2 rounded-md font-bold text-sm hover:bg-gray-800 transition-colors border border-yellow-600/50">
          + CREATE NEW EVENT
        </button> */}
      </div>

      {/* 1. Stats Grid */}
      <div className="grid grid-cols-3  gap-2 sm:gap-6">
        <StatCard
          title="Featured Events"
          value="Thomasian Leadership Summit"
          subtext="May 08, 2026"
          image="/images/tls.png" // Path to your image
          valueClassName="text-[10px] md:text-sm lg:text-[10px] xl:text-sm"
          subtextClassName="text-gray-500"
          imageclassName="w-full h-full object-contain"
        />
        <StatCard
          title="Published Events"
          value="08"
          subtext="+1 this week"
          icon={LuText}
        />
        <StatCard
          title="Upcoming Events"
          value="45"
          subtext="Needs Review"
          subtextClassName="text-red-500"
          icon={IoIosPhotos}
          className="text-red-500"
        />
        {/* <StatCard
          title="Accounts"
          value="150"
          subtext="+5 new users"
          icon={CiUser}
        /> */}
      </div>

      <FilterBar />

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
            <td className="px-6 py-4 text-sm text-gray-500">{event.type}</td>
            <td className="px-6 py-4 text-sm text-dark"> {event.etitle}</td>

            <td className="px-6 py-4">
              <Badge type={event.category}>{event.category}</Badge>
            </td>
            <td className="px-6 py-4">
              <div className=" flex items-center gap-3">
                <img
                  src={event.image}
                  alt=""
                  className="w-25 h-15  rounded object-cover border border-gray-200"
                />
              </div>
            </td>
            <td className="px-6 py-4 text-sm font-medium text-gray-900">
              {event.createdBy}
            </td>
            <td className="px-6 py-4 text-sm text-dark">
              {" "}
              {formatDate(event.createdAt)}
            </td>
          </tr>
        ))}
      </AdminTable>

      <Pagination />
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent || {}}
      />
    </div>
  );
}
