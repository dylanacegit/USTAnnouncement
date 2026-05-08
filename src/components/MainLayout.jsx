import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  return (
    <main className="flex min-h-screen w-full flex-col bg-white">
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-5">
        
        {/* Left Side (80%) - Renders dynamic content */}
        <div className="lg:col-span-4">
          {children}
        </div>

        {/* Right Side (20%) - Static Sidebar */}
        <div className="lg:col-span-1 bg-[#F8F7F4] p-6 sm:p-8">
          <Sidebar />
        </div>
        
      </div>
    </main>
  );
}