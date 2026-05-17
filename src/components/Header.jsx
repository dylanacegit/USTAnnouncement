<<<<<<< HEAD
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import RegistrationPage from "../pages/RegistrationPage"; 
import LoginModal from "../components/LoginModal";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
=======
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import RegistrationPage from "../pages/RegistrationPage";
import LoginModal from "../components/LoginModal";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import ProfileMenu from "../components/ProfileMenu";
import { useAuth } from "../context/AuthContext";
>>>>>>> e59ce8f (Add bookmarks announcements updates and event gallery)

/**
 * Header Component
 * Manages navigation, reactive authentication states, and modal switching logic.
 */
export default function Header() {
  const navigate = useNavigate();
<<<<<<< HEAD
=======
  const { isAdmin, isAuthenticated, signOut, user } = useAuth();
>>>>>>> e59ce8f (Add bookmarks announcements updates and event gallery)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  
  // Track logging states reactively
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("authToken"));

  // Check auth state whenever modals close or window emits storage changes
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("authToken"));
    };

    window.addEventListener("storage", checkAuth);
    // Also re-verify state whenever the login modal visibility changes
    checkAuth();

    return () => window.removeEventListener("storage", checkAuth);
  }, [isLoginOpen]);

  const links = [
    ["Home", "/"], 
    ["Events", "/events"], 
    ["Announcements", "/announcements"], 
    ["About", "/about"],
  ];

  const openRegisterFromLogin = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const openLoginFromRegister = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const openForgotFromLogin = () => {
    setIsLoginOpen(false);
    setIsForgotOpen(true);
  };

  const openLoginFromForgot = () => {
    setIsForgotOpen(false);
    setIsLoginOpen(true);
  };

<<<<<<< HEAD
=======
  const handleLogout = () => {
    signOut();
    navigate("/");
  };

>>>>>>> e59ce8f (Add bookmarks announcements updates and event gallery)
  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#070707] border-b border-white/10 h-16">
        <div className="relative flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-12">
          
          {/* LOGO SECTION */}
          <NavLink to="/" className="flex items-center gap-2 z-50 shrink-0">
            <img src="/images/Logo 2.svg" alt="Logo" className="h-8 w-8 lg:h-10 lg:w-10" />
            <div className="leading-tight">
              <h1 className="font-playfair text-[13px] font-bold text-white sm:text-base lg:text-lg">
                Golden Gatherings
              </h1>
              <p className="hidden md:block text-[9px] uppercase tracking-[0.18em] text-[#f6c744]">
                Official Events Page of UST
              </p>
            </div>
          </NavLink>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden absolute left-1/2 -translate-x-1/2 items-center gap-6 md:flex lg:gap-10">
            {links.map(([label, path]) => (
              <NavLink 
                key={path} 
                to={path} 
                className={({ isActive }) => 
                  `text-[12px] lg:text-[13px] font-inter font-semibold transition-all border-b-2 py-1 ${
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

          {/* ACTION BUTTONS / AUTH FLOW SYSTEM */}
          <div className="flex items-center gap-3 sm:gap-5 z-50">
<<<<<<< HEAD
            {isLoggedIn ? (
              <>
                {/* 1. BOOKMARKS LINK */}
                <NavLink to="/bookmarks" className="text-white hover:text-[#f6c744] transition-colors">
=======
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <NavLink to="/events?bookmarks=bookmarked" className="text-white hover:text-[#f6c744] transition-colors">
>>>>>>> e59ce8f (Add bookmarks announcements updates and event gallery)
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                  </svg>
                </NavLink>
<<<<<<< HEAD
                
                {/* 2. PROFILE ROUTE LINK */}
                <button 
                  onClick={() => navigate("/profile")} 
                  className="text-white hover:text-[#f6c744] transition-colors focus:outline-none"
                  aria-label="View Profile"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </button>
              </>
            ) : (
              /* 3. SIGN IN CALL TO ACTION BUTTON */
              <button
                onClick={() => setIsLoginOpen(true)}
                className="bg-[#f6c744] hover:bg-[#e3b832] text-black font-inter font-black uppercase tracking-widest text-[10px] px-5 py-2.5 rounded-sm transition-all shadow-md active:scale-[0.97]"
=======
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f6c744] hover:text-white"
                  >
                    Admin
                  </NavLink>
                )}
                <ProfileMenu user={user} onLogout={handleLogout} />
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="rounded-sm bg-[#f6c744] px-5 py-2.5 font-inter text-[10px] font-black uppercase tracking-widest text-black shadow-md transition-all hover:bg-[#e3b832] active:scale-[0.97]"
                aria-label="Login"
>>>>>>> e59ce8f (Add bookmarks announcements updates and event gallery)
              >
                Sign In
              </button>
            )}

            {/* MOBILE MENU TOGGLE */}
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
        <div className={`absolute top-full left-0 w-full bg-[#0d0d0d] border-b border-white/10 transition-all duration-300 md:hidden ${
          isMenuOpen ? "translate-y-0 opacity-100 visible" : "-translate-y-4 opacity-0 invisible"
        }`}>
          <nav className="flex flex-col p-6 gap-4">
            {links.map(([label, path]) => (
              <NavLink 
                key={path} 
                to={path} 
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-bold tracking-widest uppercase text-white/70 hover:text-[#f6c744]"
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* MODAL CONTROLLERS */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSwitchToRegister={openRegisterFromLogin}
        onForgotPassword={openForgotFromLogin} 
      />

      <RegistrationPage 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
        onSwitchToLogin={openLoginFromRegister}
      />

      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        onBackToLogin={openLoginFromForgot}
      />
    </>
  );
}
