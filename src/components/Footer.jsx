import { Link } from "react-router-dom";

const navigationLinks = [
  { label: "Home", to: "/" },
  { label: "Events", to: "/events" },
  { label: "Announcements", to: "/announcements" },
  { label: "About", to: "/about" },
];

const quickLinks = [
  { label: "Academics", href: "https://www.ust.edu.ph/academics/" },
  { label: "MyUSTe Portal", href: "https://myusteportal.ust.edu.ph/" },
];

function FooterLink({ children, to, href }) {
  const className =
    "group flex items-center justify-between border-b border-[#1a1a1a] py-2.5 text-sm text-[#8f8f8f] transition-colors hover:text-[#F7C948]";

  const content = (
    <>
      <span>{children}</span>
      <span className="text-[10px] text-[#444] transition-colors group-hover:text-[#F7C948]">
        &gt;
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <a href={href} className={className} target="_blank" rel="noreferrer">
      {content}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="border-t-[3px] border-[#F7C948] bg-[#0D0D0D] font-inter text-white">
      <div className="px-6 py-12 sm:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-md space-y-6">
            <div className="flex items-center gap-3">
              <img
                src="/images/Logo 2.svg"
                alt="Golden Gatherings Logo"
                className="h-11 w-11 object-contain sm:h-9 sm:w-9"
              />
              <div>
                <div className="font-playfair text-base font-bold leading-tight">
                  Golden Gatherings
                </div>
                <div className="mt-1 text-[9px] font-bold uppercase tracking-[3px] text-[#F7C948]">
                  Official Events Page of UST
                </div>
              </div>
            </div>

            <p className="text-sm leading-7 text-[#8f8f8f]">
              Golden Gatherings centralizes UST events, announcements, and
              approved campus memories so Thomasians can discover updates,
              follow activities, and stay connected in one official space.
            </p>
          </div>

          <div>
            <div className="mb-4 border-b border-[#242424] pb-2 text-[10px] font-bold uppercase tracking-[3px] text-[#F7C948]">
              Navigate
            </div>
            <div className="flex flex-col">
              {navigationLinks.map((link) => (
                <FooterLink key={link.to} to={link.to}>
                  {link.label}
                </FooterLink>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 border-b border-[#242424] pb-2 text-[10px] font-bold uppercase tracking-[3px] text-[#F7C948]">
              Quick Links
            </div>
            <div className="flex flex-col">
              {quickLinks.map((link) => (
                <FooterLink key={link.label} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-y border-[#1a1a1a] px-6 py-7 sm:px-10">
        <div className="flex flex-col items-center justify-between gap-5 rounded-sm border border-[#242424] bg-[#111] px-5 py-5 text-center lg:flex-row lg:text-left">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[3px] text-[#F7C948]">
              Thomasian Spirit
            </div>
            <div className="mt-2 font-playfair text-xl italic tracking-wide text-white">
              Veritas in Caritate
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 border border-[#333] px-4 py-2 text-[10px] font-bold uppercase tracking-[2px] text-[#bdbdbd] transition-colors hover:border-[#F7C948] hover:text-[#F7C948]"
          >
            <svg
              className="h-3 w-3 fill-none stroke-current stroke-2"
              viewBox="0 0 12 12"
              aria-hidden="true"
            >
              <polyline points="2 8 6 4 10 8" />
            </svg>
            Top
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 px-6 py-5 text-center text-xs text-[#666] sm:px-10 lg:flex-row lg:text-left">
        <div>
          {"\u00A9"} 2026{" "}
          <span className="font-semibold text-[#F7C948]">
            Golden Gatherings
          </span>{" "}
          · University of Santo Tomas
        </div>
        <div className="text-[#4f4f4f]">
          Built for official UST campus updates and events.
        </div>
      </div>
    </footer>
  );
}
