import { useState } from "react";
import MainLayout from "../components/MainLayout";

const DUMMY_EVENTS = Array(8).fill({
  id: "1",
  title: "UST PASKUHAN FESTIVITIES",
  category: "CICS",
  location: "Frassati Building",
  startTime: "8AM-6PM",
  startDate: "May 4-8, 2026",
  organizedBy: "CICS Student Council",
  image: "/images/ust-main-building.png",
  description: "College Week is the biggest annual celebration of the College of Information and Computing Sciences (CICS). Held across five days, the event features programming competitions, hackathons, IT showcases, and cultural performances organized by Thomasian students of CICS. It is a vibrant week full of innovation, camaraderie, and technology showcases that highlight the best and brightest minds of the college.",
  schedule: [
    { day: "Day 1", activity: "Opening ceremony & tech expo launch", sub: "" },
    { day: "Day 2", activity: "Hackathon: 24-hour challenge", sub: "Industry mentors" },
    { day: "Day 3", activity: "Programming Olympics & quiz bowl", sub: "" },
    { day: "Day 4", activity: "Cultural night & talent show", sub: "" },
    { day: "Day 5", activity: "Awarding & closing ceremony", sub: "CICS Dean" },
  ],
  speakers: [
    { name: "Assoc. Dean Dela Rosa", role: "CICS Associate Dean", initials: "AD" },
    { name: "Mark Reyes", role: "Software Engineer, Google PH", initials: "MR" },
  ]
});

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Layout for the Detail View
  if (selectedEvent) {
    return (
      <div className="min-h-screen bg-white text-black font-inter">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            {/* Back Button */}
            <button 
              onClick={() => setSelectedEvent(null)}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#f6c744] hover:text-[#c49600] transition-colors mb-6"
            >
              ← Go back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
              
              {/* Left Column: Main Content */}
              <section>
                <h1 className="font-playfair text-4xl font-black uppercase tracking-tight text-neutral-900 mb-8">
                  {selectedEvent.title}
                </h1>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
                  {[
                    { label: "DATE", val: selectedEvent.startDate, icon: "📅" },
                    { label: "TIME", val: selectedEvent.startTime, icon: "🕒" },
                    { label: "VENUE", val: selectedEvent.location, icon: "📍" },
                    { label: "ORGANIZED BY", val: selectedEvent.organizedBy, icon: "👤" },
                    { label: "CATEGORY", val: selectedEvent.category, icon: "🏷️" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-[#f6c744] text-[10px]">{item.icon}</div>
                      <div>
                        <p className="text-[8px] font-black text-neutral-400 uppercase tracking-tighter">{item.label}</p>
                        <p className="text-[10px] font-bold text-neutral-800 leading-tight">{item.val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* About Section */}
                <div className="mb-12">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 pb-2 mb-4">About this event</h2>
                  <p className="text-[13px] leading-relaxed text-neutral-600 text-justify">{selectedEvent.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-10">
                  {/* Schedule */}
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 pb-2 mb-4">Program Schedule</h2>
                    <div className="divide-y divide-neutral-100">
                      {selectedEvent.schedule.map((item, i) => (
                        <div key={i} className="py-3 flex gap-6">
                          <span className="text-[11px] font-bold text-[#c49600] shrink-0 w-12">{item.day}</span>
                          <div>
                            <p className="text-[12px] font-bold text-neutral-800">{item.activity}</p>
                            {item.sub && <p className="text-[10px] text-neutral-400 italic">{item.sub}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Speakers */}
                  <div>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-neutral-100 pb-2 mb-4">Featured Speakers</h2>
                    <div className="space-y-4">
                      {selectedEvent.speakers.map((speaker, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-[#f6c744] flex items-center justify-center font-bold text-xs">{speaker.initials}</div>
                          <div>
                            <p className="text-[12px] font-bold text-neutral-800">{speaker.name}</p>
                            <p className="text-[10px] text-neutral-400">{speaker.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gallery */}
                <div className="mt-16">
                   <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 border-b border-[#f6c744] pb-2 mb-6">Event Gallery</h2>
                   <div className="grid grid-cols-3 gap-4">
                      {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="aspect-video bg-neutral-100 border border-neutral-200" />
                      ))}
                   </div>
                </div>
              </section>

              {/* Right Column: Sidebar */}
              <aside className="space-y-10">
                <div>
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-2 mb-4">Venue</h2>
                  <div className="aspect-square bg-neutral-50 border border-neutral-100 flex flex-col items-center justify-center p-6 text-center">
                    <span className="text-xl mb-2">📍</span>
                    <p className="text-[11px] font-bold text-neutral-700">{selectedEvent.location} · UST Manila</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-2 mb-4">Related Events</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {DUMMY_EVENTS.slice(0, 3).map((ev, i) => (
                      <div key={i} className={`bg-white border border-neutral-100 p-3 ${i === 2 ? 'col-span-2' : ''}`}>
                         <div className="aspect-video bg-neutral-800 mb-2 flex items-center justify-center text-xl">
                            {i === 0 ? "🎆" : i === 1 ? "🎓" : "📚"}
                         </div>
                         <p className="text-[10px] font-black leading-tight mb-1 uppercase">{ev.title}</p>
                         <p className="text-[8px] text-neutral-400 uppercase font-bold">December 18, 2026</p>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
      </div>
    );
  }

  // Standard Grid View (Shown by default)
  return (
    <div className="min-h-screen w-full bg-white text-black">
      {/* ... Hero Section remains the same as previous code ... */}
      <MainLayout>
        <div className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="font-playfair text-2xl font-bold text-neutral-900">Upcoming Events</h2>
            <div className="flex flex-wrap gap-1.5">
              {["All", "CICS", "Engineering", "AMV", "Nursing"].map((tab, i) => (
                <button key={tab} className={`px-3 py-1 text-[8px] font-bold uppercase border ${i === 0 ? "border-[#f6c744] bg-[#fffbeb] text-[#a18117]" : "border-neutral-200 text-neutral-400"}`}>{tab}</button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {DUMMY_EVENTS.map((event, index) => (
              <div key={index} className="group flex flex-col bg-white border border-neutral-100 shadow-sm border-t-[3px] border-t-[#f6c744]">
                <div className="relative aspect-video overflow-hidden bg-neutral-200">
                  <img src={event.image} className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105" alt={event.title} />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400">{event.category}</span>
                  <h3 className="mt-1.5 font-playfair text-[13px] font-bold leading-tight h-8 line-clamp-2 text-neutral-900 group-hover:text-[#c49600] transition-colors">{event.title}</h3>
                  <div className="mt-3 text-[10px] text-neutral-500 italic">
                    <p className="truncate">{event.location}</p>
                    <p className="truncate mt-0.5">{event.startDate}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedEvent(event)} 
                    className="mt-4 w-full bg-[#f6c744] py-2 text-[8px] font-black uppercase tracking-widest text-black hover:bg-[#e3b832] transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    </div>
  );
}