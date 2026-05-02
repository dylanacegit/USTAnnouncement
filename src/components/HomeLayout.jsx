import AnnouncementsSection from "./AnnouncementsSection";
import Sidebar from "./Sidebar";

export default function HomeLayout() {
  return (
    /* Changed mx-auto to w-full and ensured it fills the viewport */
    <main className="flex min-h-screen w-full flex-col bg-white">
      
      {/* The grid needs 'flex-1' to push to the bottom of the screen */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-5">
  {/* Left Side (80%) */}
<div className="lg:col-span-4 flex flex-col h-full overflow-hidden">
      <AnnouncementsSection />
  </div>

  {/* Right Side (20%) */}
  <div className="lg:col-span-1 bg-[#F8F7F4] p-6 sm:p-8">
    <Sidebar />
  </div>
</div>
    </main>
  );
}