import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { IoMdMenu, IoMdSearch, IoMdNotifications } from "react-icons/io";
import { CiCalendar, CiSettings } from "react-icons/ci";
import { TfiAnnouncement } from "react-icons/tfi";
import { AiOutlineAppstore } from "react-icons/ai";
import { IoDocumentTextOutline, IoPersonOutline } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { getAccounts, getAnnouncements, getEvents } from "../../services/api";

const SEARCH_LIMIT_PER_GROUP = 4;

function getDateLabel(date) {
  if (!date) return "";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function includesQuery(fields, query) {
  return fields
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query.toLowerCase());
}

function SearchGroup({ label, items, onSelect }) {
  if (items.length === 0) return null;

  return (
    <div className="py-2">
      <p className="px-2 pb-1 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
        {label}
      </p>
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={`${label}-${item.id}`}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(item.path)}
            className="block w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-yellow-50"
          >
            <span className="block truncate text-sm font-bold text-gray-950">
              {item.title}
            </span>
            {item.meta && (
              <span className="mt-0.5 block truncate text-xs text-gray-500">
                {item.meta}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function SearchDropdown({
  searchLoading,
  searchQuery,
  hasSearchResults,
  searchResults,
  onSelect,
  className,
}) {
  return (
    <div
      className={`z-[70] overflow-hidden rounded-xl border border-gray-800 bg-white text-gray-900 shadow-2xl ${className}`}
    >
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
          Admin Search
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Search events, announcements, and accounts.
        </p>
      </div>

      {searchLoading ? (
        <div className="px-4 py-5 text-sm text-gray-500">
          Loading searchable records...
        </div>
      ) : searchQuery.trim() && hasSearchResults ? (
        <div className="max-h-[24rem] overflow-y-auto p-2 md:max-h-[28rem]">
          <SearchGroup
            label="Events"
            items={searchResults.events}
            onSelect={onSelect}
          />
          <SearchGroup
            label="Announcements"
            items={searchResults.announcements}
            onSelect={onSelect}
          />
          <SearchGroup
            label="Accounts"
            items={searchResults.accounts}
            onSelect={onSelect}
          />
        </div>
      ) : searchQuery.trim() ? (
        <div className="px-4 py-5 text-sm text-gray-500">
          No matching admin records found.
        </div>
      ) : (
        <div className="px-4 py-5 text-sm text-gray-500">
          Start typing to find content across the admin panel.
        </div>
      )}
    </div>
  );
}

export default function AdminLayout() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDataLoaded, setSearchDataLoaded] = useState(false);
  const [searchData, setSearchData] = useState({
    events: [],
    announcements: [],
    accounts: [],
  });
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    navigate("/login");
  };

  const loadSearchData = async () => {
    if (searchDataLoaded || searchLoading) return;

    try {
      setSearchLoading(true);
      const [eventsData, announcementsData, accountsData] = await Promise.all([
        getEvents(),
        getAnnouncements(),
        getAccounts(),
      ]);

      setSearchData({
        events: Array.isArray(eventsData) ? eventsData : eventsData.events || [],
        announcements: Array.isArray(announcementsData)
          ? announcementsData
          : announcementsData.announcements || [],
        accounts: Array.isArray(accountsData)
          ? accountsData
          : accountsData.accounts || [],
      });
      setSearchDataLoaded(true);
    } catch (error) {
      console.error("Failed to load admin search data:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const searchResults = useMemo(() => {
    const query = searchQuery.trim();

    if (!query) {
      return {
        events: [],
        announcements: [],
        accounts: [],
      };
    }

    const events = searchData.events
      .filter((event) =>
        includesQuery(
          [
            event.title,
            event.category,
            event.location,
            event.venue,
            event.organizer,
            event.createdBy,
          ],
          query
        )
      )
      .slice(0, SEARCH_LIMIT_PER_GROUP)
      .map((event) => ({
        id: event._id,
        title: event.title || "Untitled event",
        meta: [
          event.category,
          event.location || event.venue,
          getDateLabel(event.startDate || event.date),
        ]
          .filter(Boolean)
          .join(" / "),
        path: `/admin/events?tab=${
          event.status?.toLowerCase() === "archived" ? "archived" : "published"
        }&search=${encodeURIComponent(event.title || query)}`,
      }));

    const announcements = searchData.announcements
      .filter((announcement) =>
        includesQuery(
          [
            announcement.title,
            announcement.eventTitle,
            announcement.category,
            announcement.type,
            announcement.caption,
            announcement.content,
            announcement.createdBy,
          ],
          query
        )
      )
      .slice(0, SEARCH_LIMIT_PER_GROUP)
      .map((announcement) => ({
        id: announcement._id,
        title: announcement.title || "Untitled announcement",
        meta: [announcement.category, announcement.type, announcement.eventTitle]
          .filter(Boolean)
          .join(" / "),
        path: `/admin/announcements?tab=${
          announcement.status?.toLowerCase() === "archived"
            ? "archived"
            : "published"
        }&search=${encodeURIComponent(
          announcement.title || query
        )}`,
      }));

    const accounts = searchData.accounts
      .filter((account) =>
        includesQuery(
          [
            account.firstName,
            account.lastName,
            account.email,
            account.department,
            account.role,
            account.createdBy,
          ],
          query
        )
      )
      .slice(0, SEARCH_LIMIT_PER_GROUP)
      .map((account) => ({
        id: account._id,
        title:
          `${account.firstName || ""} ${account.lastName || ""}`.trim() ||
          account.email ||
          "Unnamed account",
        meta: [account.department, account.role, account.email]
          .filter(Boolean)
          .join(" / "),
        path: `/admin/accounts?tab=${
          account.status?.toLowerCase() === "archived" ? "archived" : "active"
        }&search=${encodeURIComponent(
          `${account.firstName || ""} ${account.lastName || ""}`.trim() ||
            account.email ||
            query
        )}`,
      }));

    return { events, announcements, accounts };
  }, [searchData, searchQuery]);

  const hasSearchResults = Object.values(searchResults).some(
    (group) => group.length > 0
  );

  const handleSearchResultClick = (path) => {
    navigate(path);
    setSearchQuery("");
    setSearchOpen(false);
    setMobileSearchVisible(false);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const firstResult = [
      ...searchResults.events,
      ...searchResults.announcements,
      ...searchResults.accounts,
    ][0];

    if (firstResult) {
      handleSearchResultClick(firstResult.path);
      return;
    }

    if (searchQuery.trim()) {
      navigate(`/admin/events?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  useEffect(() => {
    setSearchOpen(false);
    setMobileSearchVisible(false);
  }, [location.pathname]);

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
          path: "/admin/announcements",
          icon: <TfiAnnouncement />,
          badge: 4,
        },
        {
          name: "Logs",
          path: "/admin/logs",
          icon: <IoDocumentTextOutline />,
          badge: 4,
        },
        {
          name: "Accounts",
          path: "/admin/accounts",
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
          path: "/admin/settings",
          icon: <CiSettings />,
          badge: null,
        },
      ],
    },
  ];

  const getTitle = () => {
    const path = location.pathname;

    const titles = {
      "/admin": "Dashboard",
      "/admin/events": "Events",
      "/admin/announcements": "Announcements",
      "/admin/logs": "Logs",
      "/admin/accounts": "Accounts",
      "/admin/settings": "Settings",
    };

    return titles[path] || "Admin Panel";
  };

  // Add this helper function inside AdminLayout
  const handleNavClick = () => {
    // Only close automatically if we are on a mobile screen (less than 768px)
    if (window.innerWidth < 768) {
      setIsSideBarOpen(false);
    }
  };
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
        <div
          className={`flex h-20 items-center border-b border-gray-800 px-4 ${
            isSideBarOpen ? "justify-start" : "justify-center"
          }`}
        >
          <div className="text-yellow font-serif font-bold text-xl flex min-w-0 items-center gap-3">
            <img
              src="/images/Logo 2.svg"
              alt="Golden Gatherings Logo"
              className={`shrink-0 object-contain ${
                isSideBarOpen ? "h-10 w-10" : "h-9 w-9"
              }`}
            />
            {isSideBarOpen && (
              <div className="flex min-w-0 flex-col text-sm leading-tight">
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
                        onClick={handleNavClick} // <--- ADD THIS LINE
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
        <header className="bg-dark text-white h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsSideBarOpen(!isSideBarOpen)}
              className="text-gray-400 hover:text-white"
            >
              <IoMdMenu size={22} />
            </button>
            <h1 className="truncate font-serif text-lg font-medium tracking-wide sm:text-xl">
              {/* Dynamic Title based on route or fixed for now */}
              {getTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => {
                setMobileSearchVisible((current) => {
                  const next = !current;
                  if (next) {
                    setSearchOpen(true);
                    loadSearchData();
                  } else {
                    setSearchOpen(false);
                  }
                  return next;
                });
              }}
              className={`relative rounded-full p-1.5 transition-all duration-300 hover:bg-white/5 hover:text-white md:hidden ${
                mobileSearchVisible ? "text-yellow-400" : ""
              }`}
              aria-label="Search admin records"
            >
              <IoMdSearch size={22} />
            </button>

            <form
              onSubmit={handleSearchSubmit}
              className="relative hidden md:block"
            >
              <IoMdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onFocus={() => {
                  setSearchOpen(true);
                  loadSearchData();
                }}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSearchOpen(true);
                  loadSearchData();
                }}
                onBlur={() => {
                  window.setTimeout(() => setSearchOpen(false), 140);
                }}
                className="bg-gray-900 border border-gray-700 text-sm rounded-md pl-10 pr-4 py-1.5 focus:outline-none focus:border-yellow-500 text-gray-300 w-64"
              />

              {searchOpen && (
                <SearchDropdown
                  searchLoading={searchLoading}
                  searchQuery={searchQuery}
                  hasSearchResults={hasSearchResults}
                  searchResults={searchResults}
                  onSelect={handleSearchResultClick}
                  className="absolute right-0 top-[calc(100%+0.5rem)] w-[26rem]"
                />
              )}
            </form>
            <button className="text-gray-400 hover:text-white relative">
              <IoMdNotifications size={22} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-sm font-bold text-black">
              AD
            </div>
          </div>
        </header>

        <div
          className={`relative bg-dark px-4 transition-all duration-300 ease-out md:hidden ${
            mobileSearchVisible
              ? "max-h-[36rem] border-t border-gray-900 pb-4 opacity-100"
              : "max-h-0 overflow-hidden pb-0 opacity-0"
          }`}
        >
          <div
            className={`transition-transform duration-300 ease-out ${
              mobileSearchVisible ? "translate-y-0" : "-translate-y-2"
            }`}
          >
            <form onSubmit={handleSearchSubmit} className="relative pt-3">
              <IoMdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onFocus={() => {
                  setSearchOpen(true);
                  loadSearchData();
                }}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSearchOpen(true);
                  loadSearchData();
                }}
                onBlur={() => {
                  window.setTimeout(() => setSearchOpen(false), 140);
                }}
                className="h-11 w-full rounded-xl border border-gray-800 bg-gray-900 pl-10 pr-4 text-sm text-gray-200 outline-none transition-all duration-300 placeholder:text-gray-500 focus:border-yellow-500 focus:bg-gray-950"
              />

              {searchOpen && (
                <SearchDropdown
                  searchLoading={searchLoading}
                  searchQuery={searchQuery}
                  hasSearchResults={hasSearchResults}
                  searchResults={searchResults}
                  onSelect={handleSearchResultClick}
                  className="mt-3 w-full border-gray-200 shadow-xl"
                />
              )}
            </form>
          </div>
        </div>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 px-3 py-3 sm:px-6 sm:py-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
