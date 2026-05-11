import { useState } from "react";
import { NavLink } from "react-router-dom";
import LoginModal from "./LoginModal";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const links = [
    ["Home", "/"], ["Events", "/events"], ["Announcements", "/announcements"], ["About", "/about"],
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#070707] border-b border-white/10">
        <div className="relative flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-12">
          
          {/* LOGO - Fixed width on mobile to prevent shrinking */}
          <NavLink to="/" className="flex items-center gap-2 z-50 shrink-0">
            <img src="/images/Logo 2.svg" alt="Logo" className="h-8 w-8 lg:h-10 lg:w-10" />
            <div className="leading-tight">
              <h1 className="font-playfair text-[13px] font-bold text-white sm:text-base lg:text-lg">Golden Gatherings</h1>
              <p className="hidden md:block text-[9px] uppercase tracking-[0.18em] text-[#f6c744]">Official Events Page of UST</p>
            </div>
          </NavLink>

          {/* DESKTOP NAV - Hidden on mobile, centered on MD+ */}
          <nav className="hidden absolute left-1/2 -translate-x-1/2 items-center gap-6 md:flex lg:gap-10">
            {links.map(([label, path]) => (
              <NavLink 
                key={path} 
                to={path} 
                className={({ isActive }) => `text-[12px] lg:text-[13px] font-inter font-semibold transition-all border-b-2 py-1 ${isActive ? "text-[#f6c744] border-[#f6c744]" : "text-white border-transparent hover:text-[#f6c744]"}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* ACTION ICONS + MOBILE BURGER */}
          <div className="flex items-center gap-3 sm:gap-5 z-50">
            <NavLink to="/bookmarks" className="text-white hover:text-[#f6c744] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
            </NavLink>
            
            <button onClick={() => setIsLoginOpen(true)} className="text-white hover:text-[#f6c744] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="flex flex-col gap-1.5 md:hidden pl-2 border-l border-white/10"
            >
              <span className={`h-0.5 w-5 bg-white transition-all ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`h-0.5 w-5 bg-white transition-all ${isMenuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-5 bg-white transition-all ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN MENU */}
        <div className={`absolute top-full left-0 w-full bg-[#0d0d0d] border-b border-white/10 transition-all duration-300 ease-in-out md:hidden ${
          isMenuOpen ? "translate-y-0 opacity-100 visible shadow-2xl" : "-translate-y-4 opacity-0 invisible"
        }`}>
          <nav className="flex flex-col p-6 gap-4">
            {links.map(([label, path]) => (
              <NavLink 
                key={path} 
                to={path} 
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => `text-sm font-bold tracking-widest uppercase transition-colors ${isActive ? "text-[#f6c744]" : "text-white/70"}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}