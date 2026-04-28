import { NavLink } from "react-router-dom";

export default function Header() {
  const links = [
    ["Home", "/"],
    ["Events", "/events"],
    ["Announcements", "/announcements"],
    ["About", "/about"],
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#070707]">
      <div className="grid h-13 w-full grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-12">
        <NavLink to="/" className="flex min-w-fit items-center gap-3 justify-self-start">
          <img
            src="/images/logo.png"
            alt="Golden Gatherings Logo"
            className="h-11 w-11 object-contain sm:h-8 sm:w-8"
          />

          <div className="hidden leading-tight sm:block">
            <h1 className="font-playfair text-base font-bold text-white lg:text-lg">
              Golden Gatherings
            </h1>
            <p className="text-[9px] uppercase tracking-[0.18em] text-[#f6c744]">
              Official Events Page of UST
            </p>
          </div>
        </NavLink>

        <nav className="hidden items-center justify-center gap-10 md:flex lg:gap-14">
          {links.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `text-sm transition font-inter ${
                  isActive ? "text-[#f6c744]" : "text-white hover:text-[#f6c744]"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block" />

        <nav className="col-span-2 flex min-w-0 items-center justify-end gap-3 text-[10px] min-[390px]:gap-4 min-[390px]:text-[11px] sm:text-xs md:hidden">
        {links.slice(0, 4).map(([label, path]) => (
            <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
                `whitespace-nowrap font-bold ${
                isActive ? "text-[#f6c744]" : "text-white"
                }`
            }
            >
            {label}
            </NavLink>
        ))}
        </nav>
      </div>
    </header>
  );
}