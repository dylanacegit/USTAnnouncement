import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    ["Home", "/"],
    ["Events", "/events"],
    ["Announcements", "/announcements"],
    ["About", "/about"],
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#070707] border-b border-white/10">
      {/* Using a grid to manage the 3 distinct areas: 
          1. Logo (Left) 
          2. Nav (Center) 
          3. Mobile Toggle (Right)
      */}
      <div className="relative grid h-16 w-full grid-cols-2 items-center px-4 md:grid-cols-[1fr_auto_1fr] sm:px-6 lg:px-12">
        {/* --- LOGO SECTION --- 
            Stays on the left. On mobile, we align it to the start.
        */}
        <NavLink
          to="/"
          className="flex items-center gap-2 md:gap-3 z-50 justify-self-start"
        >
          <img
            src="/images/Logo 2.svg"
            alt="Logo"
            className="h-8 w-8 object-contain lg:h-10 lg:w-10"
          />
          <div className="leading-tight">
            <h1 className="font-playfair text-[14px] font-bold text-white sm:text-base lg:text-lg whitespace-nowrap">
              Golden Gatherings
            </h1>
            <p className="hidden md:block text-[9px] uppercase tracking-[0.18em] text-[#f6c744]">
              Official Events Page of UST
            </p>
          </div>
        </NavLink>

        {/* --- DESKTOP NAVIGATION (Centered) --- */}
        <nav className="hidden items-center gap-8 md:flex lg:gap-12 justify-center">
          {links.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `text-sm font-inter font-semibold transition-all duration-300 border-b-2 py-1 ${
                  isActive
                    ? "text-[#f6c744] border-[#f6c744]"
                    : "text-white border-transparent hover:text-[#f6c744]"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* --- BURGER MENU BUTTON (Mobile Only - Aligned Right) --- */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="z-50 flex flex-col gap-1.5 md:hidden justify-self-end"
        >
          <span
            className={`h-0.5 w-6 bg-white transition-all ${isOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-white transition-all ${isOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-white transition-all ${isOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>

        {/* --- MOBILE DROPDOWN MENU --- */}
        <div
          className={`absolute top-0 left-0 w-full bg-[#070707] transition-all duration-300 ease-in-out md:hidden ${
            isOpen
              ? "translate-y-16 opacity-100 visible"
              : "-translate-y-full opacity-0 invisible"
          } border-b border-white/10`}
        >
          <nav className="flex flex-col items-center gap-6 py-8">
            {links.map(([label, path]) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `text-base font-bold font-inter ${
                    isActive ? "text-[#f6c744]" : "text-white"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
