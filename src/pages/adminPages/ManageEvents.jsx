import StatCard from "../../components/adminComponents/StatCard";
import { LuText } from "react-icons/lu";
import { IoIosPhotos } from "react-icons/io";
import { useState } from "react";
import FilterBar from "../../components/adminComponents/events/FilterBar";
import Pagination from "../../components/adminComponents/events/Pagination";
import EventModal from "../../components/adminComponents/events/EventModal";
import EventsTable from "../../components/adminComponents/EventsTable";

export default function ManageEvents() {
  const events = [
    {
      id: 1,
      title: "University Basketball Cup",
      date: "Oct 24, 2024",
      venue: "Main Bldg Aud.",
      category: "Sports",
      attending: 120,
    },
    {
      id: 2,
      title: "University Basketball Cup",
      date: "Oct 24, 2024",
      venue: "Main Bldg Aud.",
      category: "Sports",
      attending: 120,
    },
    {
      id: 3,
      title: "University Basketball Cup",
      date: "Oct 24, 2024",
      venue: "Main Bldg Aud.",
      category: "Sports",
      attending: 120,
    },
  ];

  const [activeTab, setActiveTab] = useState("published");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("az");
  const [category, setCategory] = useState("all");

  const handleViewDetails = (event) => {
    const detailedEvent = {
      ...event,
      venue: "Frassati Building",
      organizer: "CICS Student Council",
      description: "College Week is the biggest annual celebration...",
      createdBy: "Dylan",
      createdAt: "December 18, 2026",
      updatedAt: "December 22, 2026",
    };
    setSelectedEvent(detailedEvent);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Manage Events
          </h1>
          <p className="text-sm text-gray-500">
            View and manage all organization events.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-6">
        <StatCard
          title="Featured Events"
          value="Thomasian Leadership Summit"
          subtext="May 08, 2026"
          image="/images/tls.png"
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
        />
      </div>

      <FilterBar
        search={{
          placeholder: "Search events...",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filters={[
          {
            key: "category",
            label: "Category",
            value: category,
            onChange: setCategory,
            options: [
              { value: "all", label: "All" },
              { value: "sports", label: "Sports" },
              { value: "academic", label: "Academic" },
              { value: "career", label: "Career" },
            ],
          },
          {
            key: "sort",
            label: "Sort By",
            value: sortBy,
            onChange: setSortBy,
            options: [
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
            ],
          },
        ]}
      />
      <EventsTable
        events={events}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onView={handleViewDetails}
      />

      <Pagination />

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent || {}}
      />
    </div>
  );
}
