import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Events from "./pages/Events"; 
import Announcements from "./pages/Announcements";
import Footer from "./components/Footer";
import AdminLayout from "./components/adminComponents/AdminLayout";
import Dashboard from "./pages/adminPages/Dashboard";
import ManageEvents from "./pages/adminPages/ManageEvents";
import ManageAccounts from "./pages/adminPages/ManageAccounts";

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
          <Route path="about" element={<PlaceholderPage title="About Page" />} />
        </Route>

        {/* =========================================
            ADMIN SIDE (Sidebar only, NO Header/Footer)
            ========================================= */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="events" element={<ManageEvents />} />
          <Route path="accounts" element={<ManageAccounts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}