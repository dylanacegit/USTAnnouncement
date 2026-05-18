import React from "react";

const teamMembers = [
  { id: "01", initials: "DG", name: "Dylan Ace Eisley Garcia", role: "PROJECT LEADER & AI FUNCTIONALITY DEVELOPER", photo: "/images/dylanphoto.jpg", photoPosition: "center 25%",description: "Organized most parts of Golden Gatherings as project leader, coordinated task delegation, and led the website's AI functionality through OpenRouter and Google Vision AI. Some challenges were balancing leadership with heavy schedules and also while learning how to choose practical, free AI tools for implementation.", contributions: ["Set up MongoDB Atlas database connection", "Integrated OpenRouter AI chat system", "Implemented Google Vision AI for image validation and content moderation", "Redesigned the Admin side and connected tables dynamically", "Coded search bar functionality on the Admin side", "Established Git repository and MongoDB connection", "Helped design the website using Figma"], tags: ["Leadership", "AI", "Full-Stack"] },
  { id: "02", initials: "JO", name: "Josh Charles Ong", role: "ADMIN FRONT-END DEVELOPER & DOCUMENTATION CONTRIBUTOR", photo: "/images/joshphoto.jpg", photoPosition: "center 22%", description: "Coded the front end of the Admin side, including the dashboard cards, management tables, navigation bars, and most of the admin pages. He also created the UML diagram and helped complete the project documentation. One challenge was keeping the admin interface consistent while handling many pages, tables, and documentation requirements at the same time.", contributions: ["Coded Admin side front-end pages", "Built dashboard cards and management tables", "Implemented admin navigation bars", "Developed most Admin side page layouts", "Created the UML diagram", "Helped accomplish project documentation"], tags: ["Admin UI", "Front-End", "Documentation"] },
  { id: "03", initials: "CS", name: "Christian Sean Suaco", role: "USER SIDE BACK-END DEVELOPER", photo: "/images/seanphoto.jpg", photoPosition: "center 27%", description: "Built the back-end flow for the user side of Golden Gatherings, making pages dynamic by connecting them to the database and fetching live data. He also coded the hero page search and redirection behavior, added the notification function for users, and contributed to the documentation. A challenge was making the user pages reliably update from database records while keeping search, redirects, and notifications connected smoothly.", contributions: ["Connected user-side pages to the database", "Fetched live event and announcement data dynamically", "Coded hero page search functionality", "Implemented page redirections from user interactions", "Added user notification functionality", "Contributed to project documentation"], tags: ["Back-End", "User Side", "Notifications"] },
  { id: "04", initials: "MY", name: "Miguel Paolo Yanto", role: "USER SIDE FRONT-END DEVELOPER & DESIGN LEAD", photo: "/images/migsphoto.jpg", photoPosition: "center 50%", description: "Led the visual direction of Golden Gatherings as the team's head of design, primarily designing the whole website in Figma, coding the front end of the user side, and creating the presentation PowerPoint. One difficulty was turning the Figma design into responsive pages while keeping the user experience polished across different screens.", contributions: ["Designed the overall website in Figma", "Led the team's design direction", "Coded the user-side front end", "Built user-facing page layouts and interface sections", "Helped translate the design system into working pages", "Created the presentation PowerPoint"], tags: ["Design Lead", "Front-End", "User Side"] },
  { id: "05", initials: "RT", name: "Rogel Matthew Tabinas", role: "CONTENT STRATEGIST & DOCUMENTATION LEAD", description: "Ensured Golden Gatherings speaks clearly to every Thomasian — managing all content, user flows, documentation, and the overall messaging that ties the portal together.", contributions: ["Content strategy & copywriting", "User flow & information architecture", "Technical documentation", "Announcements module content", "About page & branding narrative"], tags: ["Content", "Docs", "Strategy"] }
];

export default function About() {
  return (
    <div className="min-h-screen bg-white font-inter">
      {/* COMPACT HERO SECTION */}
      <section className="relative bg-[#0f0f0f] pt-16 pb-12 px-8 lg:px-24 overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <p className="text-[#f6c744] text-[10px] tracking-[0.3em] font-bold uppercase mb-3">THE PEOPLE BEHIND THE PORTAL</p>
          <h1 className="font-playfair text-4xl lg:text-5xl text-white font-bold leading-tight mb-4">
            Meet the <span className="text-[#f6c744]">Makers.</span>
          </h1>
          <div className="w-12 h-1 bg-[#f6c744] mb-6" />
          <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl mb-8">
            Golden Gatherings was built by five BS Information Technology students from the 
            University of Santo Tomas — driven by a shared vision of making every Thomasian event 
            more accessible, organized, and memorable.
          </p>
          <div className="flex gap-8 border-t border-white/10 pt-6">
            {["5 Developers", "1 Vision", "BSIT Program", "UST Manila"].map((stat, i) => (
              <div key={i}>
                <p className="text-[#f6c744] font-playfair text-xl font-bold">{stat.split(' ')[0]}</p>
                <p className="text-white text-[8px] tracking-widest uppercase font-medium">{stat.split(' ').slice(1).join(' ')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEVELOPERS GRID */}
      <section className="py-16 px-8 lg:px-24 bg-white">
        <div className="mb-12">
          <p className="text-neutral-400 text-[10px] tracking-[0.3em] font-bold uppercase mb-2">THE TEAM</p>
          <h2 className="font-playfair text-3xl text-black font-bold">Our developers</h2>
          <div className="w-10 h-1 bg-[#f6c744] mt-3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div key={member.id} className="group border border-neutral-100 bg-white hover:shadow-xl transition-all duration-500">
              <div className="bg-[#0f0f0f] h-40 flex items-center justify-center relative">
                <span className="absolute top-3 left-3 text-white/10 font-bold text-[10px]">{member.id}</span>
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: member.photoPosition || "center" }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full border-2 border-[#f6c744] flex items-center justify-center text-[#f6c744] font-playfair text-xl font-bold group-hover:scale-110 transition-transform">{member.initials}</div>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-playfair text-lg font-bold text-black mb-1">{member.name}</h3>
                <p className="text-[#c49600] text-[8px] font-black tracking-widest uppercase mb-3">{member.role}</p>
                <p className="text-neutral-500 text-[11px] leading-relaxed mb-4 border-b border-neutral-100 pb-4">{member.description}</p>
                <p className="text-black text-[8px] font-black uppercase mb-2">KEY CONTRIBUTIONS</p>
                <ul className="space-y-1 mb-6">
                  {member.contributions.map((item, i) => (
                    <li key={i} className="text-[10px] text-neutral-600 flex items-start gap-2"><span className="text-[#f6c744]">•</span>{item}</li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  {member.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-neutral-50 text-neutral-400 text-[7px] font-bold uppercase border border-neutral-100">{tag}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY WE BUILT THIS (image_2b50fe.png section 1) */}
      <section className="py-16 px-8 lg:px-24 bg-[#f9f9f9] border-t border-neutral-100">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-[#c49600] text-[10px] tracking-[0.3em] font-bold uppercase mb-2">OUR STORY</p>
            <h2 className="font-playfair text-3xl text-black font-bold mb-6">Why we built this</h2>
            <div className="w-10 h-1 bg-[#f6c744] mb-8" />
            <blockquote className="border-l-4 border-[#f6c744] pl-6 py-2 mb-8">
              <p className="font-playfair text-lg italic font-bold text-black leading-relaxed">
                "Every Thomasian deserves to know what's happening on campus — and we built the portal to make that effortless."
              </p>
            </blockquote>
            <div className="space-y-4 text-neutral-500 text-xs leading-relaxed max-w-lg">
              <p>Golden Gatherings started as a BSIT capstone project at the University of Santo Tomas. We noticed that event information was scattered — tarpaulins here, Facebook posts there, word of mouth everywhere. We wanted to centralize it all into one clean, powerful, and distinctly Thomasian platform.</p>
              <p>Named after UST's iconic golden brand and the spirit of community, Golden Gatherings is built to celebrate every event — from the grandest Paskuhan to the smallest college forum — with the same level of visibility and pride.</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { icon: "📅", val: "24+", label: "Events managed on the portal" },
              { icon: "👤", val: "45K+", label: "Thomasians the portal serves" },
              { icon: "⭐", val: "8", label: "Colleges represented in events" },
              { icon: "⚠️", val: "412", label: "Years of UST tradition we honor" }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4 bg-[#0f0f0f] p-4 group hover:translate-x-2 transition-transform">
                <div className="w-10 h-10 flex items-center justify-center bg-white/5 text-[#f6c744] border border-white/10">{stat.icon}</div>
                <div>
                  <p className="text-[#f6c744] font-playfair text-lg font-bold leading-tight">{stat.val}</p>
                  <p className="text-neutral-500 text-[9px] uppercase tracking-widest">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK (image_2b50fe.png section 2) */}
      <section className="py-16 px-8 lg:px-24 bg-white border-t border-neutral-100">
        <p className="text-[#c49600] text-[10px] tracking-[0.3em] font-bold uppercase mb-2">BUILT WITH</p>
        <h2 className="font-playfair text-3xl text-black font-bold mb-8">Our tech stack</h2>
        <div className="w-10 h-1 bg-[#f6c744] mb-12" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "HTML & CSS", desc: "Structure & styling foundation", icon: "△" },
            { name: "JavaScript", desc: "Interactivity & dynamic features", icon: "▢" },
            { name: "Google Fonts", desc: "Playfair Display & Inter", icon: "🕒" },
            { name: "Secure Auth", desc: "Login & role management", icon: "💼" }
          ].map((tech, i) => (
            <div key={i} className="border border-neutral-100 p-8 text-center hover:bg-neutral-50 transition-colors">
              <div className="text-[#c49600] text-2xl mb-4 border border-[#c49600]/20 w-10 h-10 flex items-center justify-center mx-auto">{tech.icon}</div>
              <h4 className="text-[11px] font-black uppercase tracking-widest text-black mb-1">{tech.name}</h4>
              <p className="text-[9px] text-neutral-400">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
