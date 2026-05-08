import HomeLayout from "../components/MainLayout"; // This is your MainLayout
import { NavLink } from "react-router-dom";

export default function Announcements() {
  return (
    <div className="min-h-screen w-full bg-white text-black">
      {/* If you want the header on this page */}

      <HomeLayout>
        {/* 
           Everything inside here will appear in the lg:col-span-4 (80%) 
           area of your MainLayout. 
        */}
        <div className="p-6 sm:p-10 lg:p-12">
          <header className="mb-8">
            <h1 className="font-playfair text-4xl font-bold text-neutral-900">
              Campus Announcements
            </h1>
            <p className="mt-2 text-neutral-500">
              Stay updated with the latest news and notices from the university.
            </p>
          </header>

          {/* This is where your full list of announcements would go */}
          <div className="space-y-6">
            <div className="h-64 w-full bg-[#F8F7F4] border border-neutral-100 p-8 flex items-center justify-center text-neutral-400 italic">
              Announcement Archive List Goes Here...
            </div>
            
            {/* Example of a simpler list item */}
            <div className="border-b border-neutral-100 pb-6">
              <span className="text-[10px] font-black uppercase text-[#c49600]">Academic</span>
              <h2 className="text-xl font-bold mt-1">Enrollment for Summer Term 2026 is now open</h2>
              <p className="text-sm text-neutral-600 mt-2">Detailed instructions for the online enrollment process...</p>
              <button className="mt-4 text-xs font-bold underline">Read More</button>
            </div>
          </div>
        </div>
      </HomeLayout>

      {/* <AIChatWidget /> */}
    </div>
  );
}