import HomeLayout from "../components/HomeLayout";
export default function Events() {
  const eventList = [
    { id: 1, title: "Paskuhan 2026", date: "Dec 2026", type: "University-wide" },
    { id: 2, title: "USTv Awards", date: "May 2026", type: "Cultural" },
  ];

  return (
    
    <div className="min-h-screen bg-[#070707] p-10 text-white">
      <h1 className="font-playfair text-4xl font-bold text-[#f6c744]">Upcoming Events</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {eventList.map((event) => (
          <div key={event.id} className="border border-white/10 p-6 bg-white/5">
            <p className="text-[10px] uppercase tracking-widest text-[#f6c744] font-inter">
              {event.type}
            </p>
            <h3 className="mt-2 text-xl font-bold font-serif">{event.title}</h3>
            <p className="text-sm text-white/60 mt-1">{event.date}</p>
          </div>
        ))}
      </div>
    </div>
    
  );
}