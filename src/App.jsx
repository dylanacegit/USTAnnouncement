import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Announcements from "./pages/Announcements";
import Footer from "./components/Footer";
import AIChatWidget from "./components/AIChatWidget";
import AdminLayout from "./components/adminComponents/AdminLayout";
import Dashboard from "./pages/adminPages/Dashboard";
import ManageEvents from "./pages/adminPages/ManageEvents";
import ManageAnnouncements from "./pages/adminPages/ManageAnnouncements";
import ManageAccounts from "./pages/adminPages/ManageAccounts";
import Settings from "./pages/adminPages/Settings";
function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen bg-[#070707] p-10">
      <h1 className="font-serif text-4xl font-bold text-white">{title}</h1>
    </div>
  );
}

// 1. Layout for the User side (includes Header and Footer)
function UserLayout() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <AIChatWidget />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================================
            USER SIDE (With Header & Footer)
            ========================================= */}
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="events" element={<Events />} />
          <Route path="announcements" element={<Announcements />} />
          <Route
            path="about"
            element={<PlaceholderPage title="About Page" />}
          />
        </Route>

        {/* =========================================
            ADMIN SIDE (Sidebar only, NO Header/Footer)
            ========================================= */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<ManageEvents />} />
          <Route path="announcements" element={<ManageAnnouncements />} />

          <Route path="accounts" element={<ManageAccounts />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
