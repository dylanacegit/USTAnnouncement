export default function Sidebar() {
  return (
    <aside className="space-y-7">
      <section className="bg-[#080808] px-5 py-7 text-center text-white sm:px-6 sm:py-8">
        <p className="text-[10px] font-black uppercase tracking-[0.38em] text-[#f6c744] sm:tracking-[0.45em]">
          Next Event In
        </p>

        <h3 className="mx-auto mt-5 max-w-[230px] font-serif text-xl font-bold leading-tight sm:mt-6 sm:text-2xl">
          Thomasian Research Congress 2026
        </h3>

        <div className="mt-6 flex justify-center gap-2 sm:mt-7 sm:gap-3">
          {[
            ["08", "DAYS"],
            ["14", "HRS"],
            ["37", "MIN"],
          ].map(([num, label]) => (
            <div
              key={label}
              className="grid h-14 w-14 place-items-center bg-[#171717] sm:h-16 sm:w-16"
            >
              <strong className="text-xl font-black text-[#f6c744] sm:text-2xl">
                {num}
              </strong>
              <span className="text-[8px] text-white/70 sm:text-[9px]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="border-b-2 border-[#f6c744] pb-3 text-center font-serif text-2xl font-bold">
          Announcements
        </h3>

        <div className="divide-y divide-neutral-200">
          {[
            [
              "ACADEMIC",
              "Summer enrollment now open via MyUSTe portal.",
              "March 24, 2026",
            ],
            [
              "LIBRARY",
              "UST Central Library extends hours until 10 PM starting April 1.",
              "March 22, 2026",
            ],
            [
              "SCHOLARSHIP",
              "UST Scholarship applications for AY 2026–27 due April 30 via OSDS.",
              "March 20, 2026",
            ],
          ].map(([cat, text, date]) => (
            <article key={text} className="py-5 text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.32em] text-[#c49600]">
                {cat}
              </span>
              <p className="mt-3 text-sm leading-6">{text}</p>
              <small className="mt-2 block text-xs text-neutral-500">
                {date}
              </small>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h3 className="border-b-2 border-[#f6c744] pb-3 font-serif text-xl font-bold">
          Quick Access
        </h3>

        <div className="divide-y divide-neutral-200">
          {[
            "Academic Calendar",
            "Student Organizations",
            "Registrar's Office",
            "Campus Map",
            "Contact OSAM",
          ].map((item) => (
            <a
              href="/"
              key={item}
              className="flex items-center justify-between py-3 text-sm font-medium text-neutral-800 hover:text-[#c49600]"
            >
              {item}
              <span className="text-[#c49600]">→</span>
            </a>
          ))}
        </div>
      </section>
    </aside>
  );
}