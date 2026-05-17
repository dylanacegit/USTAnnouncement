import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import RegistrationPage from "../pages/RegistrationPage";
import LoginModal from "../components/LoginModal";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import ProfileMenu from "../components/ProfileMenu";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, signOut, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

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

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-16 w-full border-b border-white/10 bg-[#070707]">
        <div className="relative flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-12">
          <NavLink to="/" className="z-50 flex shrink-0 items-center gap-2">
            <img src="/images/Logo 2.svg" alt="Logo" className="h-8 w-8 lg:h-10 lg:w-10" />
            <div className="leading-tight">
              <h1 className="font-playfair text-[13px] font-bold text-white sm:text-base lg:text-lg">
                Golden Gatherings
              </h1>
              <p className="hidden text-[9px] uppercase tracking-[0.18em] text-[#f6c744] md:block">
                Official Events Page of UST
              </p>
            </div>
          </NavLink>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex lg:gap-10">
            {links.map(([label, path]) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `border-b-2 py-1 font-inter text-[12px] font-semibold transition-all lg:text-[13px] ${
                    isActive
                      ? "border-[#f6c744] text-[#f6c744]"
                      : "border-transparent text-white hover:text-[#f6c744]"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="z-50 flex items-center gap-3 sm:gap-5">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <NavLink
                  to="/events?bookmarks=bookmarked"
                  className="text-white transition-colors hover:text-[#f6c744]"
                  aria-label="Bookmarked events"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:h-5 sm:w-5">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                  </svg>
                </NavLink>
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
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex flex-col gap-1.5 border-l border-white/10 pl-2 md:hidden"
              aria-label="Toggle menu"
            >
              <span className={`h-0.5 w-5 bg-white transition-all ${isMenuOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`h-0.5 w-5 bg-white transition-all ${isMenuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-5 bg-white transition-all ${isMenuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        <div
          className={`absolute left-0 top-full w-full border-b border-white/10 bg-[#0d0d0d] transition-all duration-300 md:hidden ${
            isMenuOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-4 opacity-0"
          }`}
        >
          <nav className="flex flex-col gap-4 p-6">
            {links.map(([label, path]) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-[#f6c744]"
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

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
