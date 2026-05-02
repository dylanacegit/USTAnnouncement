import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const [timeLeft, setTimeLeft] = useState({ days: "00", hrs: "00", min: "00", sec: "00" });

  useEffect(() => {
    const targetDate = new Date("May 16, 2026 00:00:00").getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: "00", hrs: "00", min: "00", sec: "00" });
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days: d.toString().padStart(2, "0"),
          hrs: h.toString().padStart(2, "0"),
          min: m.toString().padStart(2, "0"),
          sec: s.toString().padStart(2, "0"),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const countdownData = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs", value: timeLeft.hrs },
    { label: "Min", value: timeLeft.min },
    { label: "Sec", value: timeLeft.sec },
  ];

  return (
    <aside className="space-y-12">
      {/* Next Event Section - Now Left Aligned */}
      <section className="bg-[#080808] px-5 py-7 text-left text-white sm:px-6 sm:py-8">
        <p className="font-inter text-[10px] font-black uppercase tracking-[0.38em] text-[#f6c744]">
          Next Event In
        </p>
        <h3 className="mt-5 font-serif text-xl leading-tight">
          Thomasian Research Congress 2026
        </h3>
        <div className="mt-6 flex justify-start gap-2 font-playfair">
          {countdownData.map((item, i) => (
            <div
              key={i}
              className="grid h-12 w-12 place-items-center border border-[#2E2E2E] bg-[#171717] sm:h-14 sm:w-14"
            >
              <strong className="text-lg font-black text-[#f6c744] sm:text-xl">
                {item.value}
              </strong>
              <span className="text-[7px] uppercase text-white/70 sm:text-[8px]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Announcements List - Changed text-center to text-left */}
      <section>
        <h3 className="mb-6 border-b-2 border-[#f6c744] pb-3 font-serif text-xl font-bold text-left">
          Announcements
        </h3>
        <div className="divide-y divide-black/10">
          {[
            ["ACADEMIC", "Summer enrollment now open via MyUSTe portal.", "March 24, 2026"],
            ["LIBRARY", "UST Central Library extends hours until 10 PM.", "March 22, 2026"],
          ].map(([cat, text, date]) => (
            /* 1. Change article to Link */
            <Link 
              key={text} 
              to="/announcements" 
              className="block py-4 text-left transition-all hover:bg-black/5 group first:pt-0"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.32em] text-[#f6c744]">
                {cat}
              </span>
              {/* 2. Added hover color change to the text */}
              <p className="mt-1 text-sm leading-relaxed text-black/80 group-hover:text-black">
                {text}
              </p>
              <small className="mt-2 block text-xs text-black/40">{date}</small>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Access */}
      <section>
        <h3 className="mb-4 border-b-2 border-[#f6c744] pb-3 font-serif text-xl font-bold text-left">
          Quick Access
        </h3>
        <div className="flex flex-col">
          {["Academic Calendar", "Student Organizations", "Campus Map"].map((item) => (
            <a
              href="/"
              key={item}
              className="group flex items-center justify-between border-b border-neutral-200 py-3 text-sm font-medium text-neutral-700 hover:text-[#c49600]"
            >
              {item}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          ))}
        </div>
      </section>
    </aside>
  );
}