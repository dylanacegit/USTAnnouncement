import React from "react";

const teamMembers = [
  {
    id: "01",
    initials: "DG",
    name: "Dylan Ace Eisley Garcia",
    role: "PROJECT LEADER & AI FUNCTIONALITY DEVELOPER",
    photo: "/images/dylanphoto.jpg",
    photoPosition: "center 25%",
    description:
      "Organized most parts of Golden Gatherings as project leader, coordinated task delegation, and led the website's AI functionality through OpenRouter and Google Vision AI. Some challenges were balancing leadership with heavy schedules and learning how to choose practical, free AI tools for implementation.",
    contributions: [
      "Set up MongoDB Atlas database connection",
      "Integrated OpenRouter AI chat system",
      "Implemented Google Vision AI for image validation and content moderation",
      "Redesigned the Admin side and connected tables dynamically",
      "Coded search bar functionality on the Admin side",
      "Established Git repository and MongoDB connection",
      "Helped design the website using Figma",
    ],
    tags: ["Leadership", "Tiggy AI Chat", "Google Vision AI"],
  },
  {
    id: "02",
    initials: "JO",
    name: "Josh Charles Ong",
    role: "ADMIN FRONT-END DEVELOPER & DOCUMENTATION CONTRIBUTOR",
    photo: "/images/joshphoto.jpg",
    photoPosition: "center 22%",
    description:
      "Coded the front end of the Admin side, including the dashboard cards, management tables, navigation bars, and most of the admin pages. He also created the UML diagram and helped complete the project documentation. One challenge was keeping the admin interface consistent while handling many pages, tables, and documentation requirements at the same time.",
    contributions: [
      "Coded Admin side front-end pages",
      "Built dashboard cards and management tables",
      "Implemented admin navigation bars",
      "Developed most Admin side page layouts",
      "Created the UML diagram",
      "Helped accomplish project documentation",
    ],
    tags: ["Admin UI", "Front-End", "Documentation"],
  },
  {
    id: "03",
    initials: "CS",
    name: "Christian Sean Suaco",
    role: "USER SIDE BACK-END DEVELOPER",
    photo: "/images/seanphoto.jpg",
    photoPosition: "center 27%",
    description:
      "Built the back-end flow for the user side of Golden Gatherings, making pages dynamic by connecting them to the database and fetching live data. He also coded the registration and login flow, hero page search and redirection behavior, added the notification function for users, and contributed to the documentation. A challenge was making the user pages reliably update from database records while keeping search, redirects, authentication, and notifications connected smoothly.",
    contributions: [
      "Coded user registration and login functionality",
      "Connected user-side pages to the database",
      "Fetched live event and announcement data dynamically",
      "Coded hero page search functionality",
      "Implemented page redirections from user interactions",
      "Added user notification functionality",
      "Contributed to project documentation",
    ],
    tags: ["Back-End", "User Side", "Notifications"],
  },
  {
    id: "04",
    initials: "MY",
    name: "Miguel Paolo Yanto",
    role: "USER SIDE FRONT-END DEVELOPER & DESIGN LEAD",
    photo: "/images/migsphoto.jpg",
    photoPosition: "center 50%",
    description:
      "Led the visual direction of Golden Gatherings as the team's head of design, primarily designing the whole website in Figma, coding the front end of the user side, and creating the presentation PowerPoint. One difficulty was turning the Figma design into responsive pages while keeping the user experience polished across different screens. Also, keeping the consistency of the design while the code was being developed and updated was a challenge that required close collaboration with the team.  ",
    contributions: [
      "Designed the overall website in Figma",
      "Led the team's design direction",
      "Coded the user-side front end",
      "Built user-facing page layouts and interface sections",
      "Helped translate the design system into working pages",
      "Created the presentation PowerPoint",
    ],
    tags: ["Design Lead", "Front-End", "User Side"],
  },
  {
    id: "05",
    initials: "RT",
    name: "Rogel Matthew Tabinas",
    role: "ADMIN BACK-END DEVELOPER & DOCUMENTATION CONTRIBUTOR",
    photo: "/images/rogel%20photo.png",
    photoPosition: "center 35%",
    description:
      "Worked on the Admin side back end of Golden Gatherings, connecting data tables with search and filter functionality while also helping complete the project documentation. One difficulty was making the admin tables, search, and filters work smoothly together while keeping the data accurate and easy to manage.",
    contributions: [
      "Coded the backend of the Admin side",
      "Connected tables to live data",
      "Implemented search functionality",
      "Implemented filter functionality",
      "Helped create project documentation",
    ],
    tags: ["Admin Back-End", "Tables", "Documentation"],
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white font-inter">
      <section className="relative overflow-hidden bg-[#0f0f0f] px-8 pb-12 pt-16 lg:px-24">
        <div className="relative z-10 max-w-4xl">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#f6c744]">
            The people behind the portal
          </p>
          <h1 className="mb-4 font-playfair text-4xl font-bold leading-tight text-white lg:text-5xl">
            Meet the <span className="text-[#f6c744]">Makers.</span>
          </h1>
          <div className="mb-6 h-1 w-12 bg-[#f6c744]" />
          <p className="mb-8 max-w-2xl text-sm leading-relaxed text-neutral-400">
            Golden Gatherings was built by five BS Information Technology
            students from the University of Santo Tomas, driven by a shared
            vision of making every Thomasian event more accessible, organized,
            and memorable.
          </p>
          <div className="flex flex-wrap gap-8 border-t border-white/10 pt-6">
            {["5 Developers", "1 Vision", "BSIT Program", "UST Manila"].map(
              (stat) => {
                const [value, ...label] = stat.split(" ");

                return (
                  <div key={stat}>
                    <p className="font-playfair text-xl font-bold text-[#f6c744]">
                      {value}
                    </p>
                    <p className="text-[8px] font-medium uppercase tracking-widest text-white">
                      {label.join(" ")}
                    </p>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>

      <section className="bg-white px-8 py-16 lg:px-24">
        <div className="mb-12">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
            The team
          </p>
          <h2 className="font-playfair text-3xl font-bold text-black">
            Our developers
          </h2>
          <div className="mt-3 h-1 w-10 bg-[#f6c744]" />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <article
              key={member.id}
              className="group border border-neutral-100 bg-white transition-all duration-500 hover:shadow-xl"
            >
              <div className="relative flex h-40 items-center justify-center overflow-hidden bg-[#0f0f0f]">
                <span className="absolute left-3 top-3 z-10 text-[10px] font-bold text-white/20">
                  {member.id}
                </span>
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: member.photoPosition || "center" }}
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#f6c744] font-playfair text-xl font-bold text-[#f6c744] transition-transform group-hover:scale-110">
                    {member.initials}
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="mb-1 font-playfair text-lg font-bold text-black">
                  {member.name}
                </h3>
                <p className="mb-3 text-[8px] font-black uppercase tracking-widest text-[#c49600]">
                  {member.role}
                </p>
                <p className="mb-4 border-b border-neutral-100 pb-4 text-[11px] leading-relaxed text-neutral-500">
                  {member.description}
                </p>
                <p className="mb-2 text-[8px] font-black uppercase text-black">
                  Key contributions
                </p>
                <ul className="mb-6 space-y-1">
                  {member.contributions.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-[10px] text-neutral-600"
                    >
                      <span className="text-[#f6c744]">-</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {member.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-neutral-100 bg-neutral-50 px-2 py-0.5 text-[7px] font-bold uppercase text-neutral-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
