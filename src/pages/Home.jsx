import Header from "../components/Header";
import Hero from "../components/Hero";
import HomeLayout from "../components/HomeLayout";
import AnnouncementsSection from "../components/AnnouncementsSection";
import UpcomingEvents from "../components/UpcomingEvents";
import Sidebar from "../components/Sidebar";
import AIChatWidget from "../components/AIChatWidget";
import { NavLink } from "react-router-dom";
import Footer from "../components/Footer"

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-white text-black">
      <Hero />

      <main>
        <HomeLayout />
      </main>
      {/* <main className="w-full px-4 py-7 sm:px-6 sm:py-8 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.35fr)_210px]">
          <div className="min-w-0">
            <AnnouncementsSection />

            <UpcomingEvents />

            <section className="mt-10 sm:mt-12">
              <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
                <h2 className="font-serif text-2xl font-bold sm:text-3xl">
                  Recent Event Highlights
                </h2>

                <NavLink
                  to="/events"
                  className="shrink-0 text-xs font-bold font-inter text-[#c49600] sm:text-sm"
                >
                  View Archive →
                </NavLink>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="h-32 bg-neutral-200 sm:h-36" />
                <div className="h-32 bg-neutral-200 sm:h-36" />
                <div className="h-32 bg-neutral-200 sm:h-36" />
              </div>
            </section>
          </div>

          <div className="w-full xl:max-w-[210px] xl:ml-auto">
            <Sidebar />
          </div>
        </div>
      </main> */}

      {/* <AIChatWidget /> */}

    </div>
  );
}