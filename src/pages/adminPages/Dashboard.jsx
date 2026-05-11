import StatCard from "../../components/adminComponents/StatCard";
import QuickActions from "../../components/adminComponents/QuickActions";
import { CiCalendar, CiBullhorn, CiUser } from "react-icons/ci";
import { IoIosPhotos } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { LuText } from "react-icons/lu";
import DashboardTable from "../../components/adminComponents/DashboardTable"; // add this
import { useState, useMemo } from "react";
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

  const [activeTab, setActiveTab] = useState("active"); // add if not already here

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
        <div className="sm:col-span-4 col-span-6   px-6">
          <h2 className="font-serif text-sm tracking-widest uppercase font-bold mb-4 border-b py-3">
            Recent Activity
          </h2>
          <div className="text-gray-400 text-sm italic">
            Table implementation coming in the next step...
          </div>
        </div>

        <div className="sm:col-span-2 col-span-6    px-6">
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
      <DashboardTable
        events={events}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
