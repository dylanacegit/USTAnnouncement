import Hero from "../components/Hero";
import MainLayout from "../components/MainLayout";
import AnnouncementsSection from "../components/AnnouncementsSection";
import UpcomingEvents from "../components/UpcomingEvents";
import { NavLink } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-white text-black">
      {/* Hero sits outside the layout to stay full-width */}
      <Hero />

      {/* 
         MainLayout provides the 80/20 split. 
         Everything inside <MainLayout> becomes the 'children' 
         and appears in the left column.
      */}
      <MainLayout>
        <div className="flex flex-col">
          {/* 1. Announcements */}
          <AnnouncementsSection />

          {/* 2. Content below Announcements */}
          <div className="px-6 pb-12 sm:px-10 lg:px-12">
            <UpcomingEvents />

            <section className="mt-10 sm:mt-12">
              <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
                <h2 className="font-playfair text-2xl font-bold sm:text-3xl">
                  Recent Event Highlights
                </h2>

                <NavLink
                  to="/events"
                  className="shrink-0 text-xs font-bold font-inter text-[#c49600] sm:text-sm hover:underline"
                >
                  View Archive →
                </NavLink>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="h-32 bg-neutral-100 sm:h-36 border border-dashed border-neutral-300" />
                <div className="h-32 bg-neutral-100 sm:h-36 border border-dashed border-neutral-300" />
                <div className="h-32 bg-neutral-100 sm:h-36 border border-dashed border-neutral-300" />
              </div>
            </section>
          </div>
        </div>
      </MainLayout>

      {/* <AIChatWidget /> */}
      {/* <Footer /> */}
    </div>
  );
}