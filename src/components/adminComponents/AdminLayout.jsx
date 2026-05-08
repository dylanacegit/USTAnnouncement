import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { IoMdMenu, IoMdSearch, IoMdNotifications } from "react-icons/io";
import { CiCalendar, CiSettings } from "react-icons/ci";
import { TfiAnnouncement } from "react-icons/tfi";
import { AiOutlineAppstore } from "react-icons/ai";
import { IoDocumentTextOutline, IoPersonOutline } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { useState } from "react";

export default function AdminLayout() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    navigate("/login");
  };

  // Grouped Navigation based on mockup
  const navGroups = [
    {
      label: "MAIN",
      items: [
        {
          name: "Dashboard",
          path: "/admin",
          icon: <AiOutlineAppstore />,
          badge: null,
        },
      ],
    },
    {
      label: "CONTENT",
      items: [
        {
          name: "Events",
          path: "/admin/events",
          icon: <CiCalendar />,
          badge: 8,
        },
        {
          name: "Announcements",
          path: "/announcements",
          icon: <TfiAnnouncement />,
          badge: 4,
        },
        {
          name: "Logs",
          path: "/logs",
          icon: <IoDocumentTextOutline />,
          badge: 4,
        },
        {
          name: "Accounts",
          path: "/accounts",
          icon: <IoPersonOutline />,
          badge: 10,
        },
      ],
    },
    {
      label: "SYSTEM",
      items: [
        {
          name: "Settings",
          path: "/settings",
          icon: <CiSettings />,
          badge: null,
        },
      ],
    },
  ];

  return (
    <div className="flex h-screen  overflow-hidden font-sans">
      {/* SIDEBAR (Dark Theme) */}
      {/* --- MOBILE OVERLAY --- */}
      {/* This darkens the background on small screens when the sidebar is open */}
      {isSideBarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsSideBarOpen(false)}
        />
      )}

      {/* SIDEBAR (Dark Theme) */}
      <aside
        className={`bg-dark text-gray-400 transition-all duration-300 ease-in-out z-50 flex flex-col border-r border-yellow-600/30 h-full fixed md:relative
          ${
            isSideBarOpen
              ? "translate-x-0 w-64" // Open: Full width, visible on all screens
              : "-translate-x-full md:translate-x-0 md:w-20" // Closed: Hidden off-screen on mobile, shrunk to w-20 on desktop
          } 
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-center border-b border-gray-800 mt-4 mb-4">
          <div className="text-yellow font-serif font-bold text-xl flex items-center gap-2">
            <img
              src="/images/Logo 2.svg"
              alt="Golden Gatherings Logo"
              className="h-10 w-10 object-contain sm:h-8 sm:w-8"
            />{" "}
            {isSideBarOpen && (
              <div className="flex flex-col text-sm leading-tight">
                <span className="font-playfair text-base font-bold text-white lg:text-lg">
                  Golden Gatherings
                </span>
                <span className="text-[9px] uppercase tracking-[0.18em] text-[#f6c744]">
                  Admin Panel
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              {isSideBarOpen && (
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-2 ml-2">
                  {group.label}
                </p>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? "text-yellow-500 bg-gray-800/50 font-medium border-l-2 border-yellow-500"
                            : "hover:bg-gray-800 hover:text-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{item.icon}</span>
                          {isSideBarOpen && <span>{item.name}</span>}
                        </div>
                        {isSideBarOpen && item.badge && (
                          <span className="bg-gray-800 text-gray-400 text-xs py-0.5 px-2 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-gray-800 hover:text-red-400 rounded-lg w-full transition-colors"
          >
            <FiLogOut size={20} />
            {isSideBarOpen && <span className="font-medium">Log out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header (Dark) */}
        <header className="bg-dark text-white h-16 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSideBarOpen(!isSideBarOpen)}
              className="text-gray-400 hover:text-white"
            >
              <IoMdMenu size={24} />
            </button>
            <h1 className="font-serif text-xl font-medium tracking-wide">
              {/* Dynamic Title based on route or fixed for now */}
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <IoMdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-900 border border-gray-700 text-sm rounded-md pl-10 pr-4 py-1.5 focus:outline-none focus:border-yellow-500 text-gray-300 w-64"
              />
            </div>
            <button className="text-gray-400 hover:text-white relative">
              <IoMdNotifications size={22} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-sm font-bold text-black">
              AD
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto py-2 px-6 bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
