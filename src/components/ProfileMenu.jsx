import { useState } from "react";
import { Link } from "react-router-dom";
import { IoPersonOutline } from "react-icons/io5";

function getFullName(user) {
  return `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Account";
}

function getUsername(user) {
  return user?.email?.split("@")[0] || "username";
}

function getInitials(user) {
  const firstName = user?.firstName || "";
  const lastName = user?.lastName || "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim();

  return initials.toUpperCase() || "U";
}

export default function ProfileMenu({
  user,
  onLogout,
  align = "right",
  variant = "dark",
  showProfileLink = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const fullName = getFullName(user);
  const username = getUsername(user);
  const isLight = variant === "light";

  const handleLogout = () => {
    const shouldLogout = window.confirm("Are you sure you want to log out?");

    if (!shouldLogout) return;

    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${
          isLight
            ? "border-gray-200 bg-white text-gray-900 hover:border-yellow-500 hover:text-yellow-700"
            : "border-white/10 bg-white/5 text-white hover:border-[#f6c744] hover:text-[#f6c744]"
        }`}
        aria-label="Open profile menu"
      >
        <span className="sr-only">Open profile menu</span>
        {getInitials(user) === "U" ? <IoPersonOutline size={18} /> : (
          <span className="text-xs font-black">{getInitials(user)}</span>
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[80] cursor-default"
            aria-label="Close profile menu"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute top-[calc(100%+0.6rem)] z-[90] w-64 overflow-hidden border border-neutral-200 bg-white font-inter text-gray-950 shadow-2xl ${
              align === "left" ? "left-0" : "right-0"
            }`}
          >
            <div className="border-b border-gray-100 px-4 py-4">
              <p className="truncate text-sm font-semibold capitalize text-gray-950">{fullName}</p>
              <p className="mt-1 truncate text-xs font-medium text-gray-500">@{username}</p>
            </div>
            {showProfileLink && (
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="block w-full border-b border-gray-100 px-4 py-3 text-left text-xs font-semibold tracking-[0.08em] text-gray-700 transition-colors hover:bg-gray-50 hover:text-black"
              >
                View profile
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full px-4 py-3 text-left text-xs font-semibold tracking-[0.08em] text-red-600 transition-colors hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
