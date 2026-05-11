import StatCard from "../../components/adminComponents/StatCard";
import { LuText } from "react-icons/lu";
import { IoIosPhotos } from "react-icons/io";
import { useState } from "react";
import FilterBar from "../../components/adminComponents/events/FilterBar";
import Pagination from "../../components/adminComponents/events/Pagination";
import EventModal from "../../components/adminComponents/events/EventModal";
import AnnouncementsTable from "../../components/adminComponents/AnnouncementsTable";

export default function ManageAnnouncements() {
  const announcements = [
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

  const [activeTab, setActiveTab] = useState("published");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("az");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Manage Announcements
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
          placeholder: "Search name or email",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filters={[
          {
            key: "sort",
            label: "Sort By",
            value: sortBy,
            onChange: setSortBy,
            options: [
              { value: "az", label: "A-Z" },
              { value: "za", label: "Z-A" },
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
            ],
          },
        ]}
      />

      <AnnouncementsTable
        announcements={announcements}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
