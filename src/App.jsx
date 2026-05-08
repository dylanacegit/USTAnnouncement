import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Events from "./pages/Events";
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

// 1. Create a Layout specifically for the User side
function UserLayout() {
  return (
    <>
      <Header />
      {/* The Outlet is where Home, Events, Announcements, etc., will be injected */}
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
            USER SIDE (Includes Header & Footer)
            ========================================= */}
        <Route path="/" element={<UserLayout />}>
          {/* 'index' means this renders at the exact "/" path */}
          <Route index element={<Home />} />

          <Route path="events" element={<Events />} />
          <Route
            path="announcements"
            element={<PlaceholderPage title="Announcements Page" />}
          />
          <Route
            path="about"
            element={<PlaceholderPage title="About Page" />}
          />
        </Route>

        {/* =========================================
            ADMIN SIDE (Sidebar only, NO Header/Footer)
            ========================================= */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Uncomment these once the files actually exist */}
          <Route index element={<Dashboard />} />
          <Route path="events" element={<ManageEvents />} />
          <Route path="accounts" element={<ManageAccounts />} />
          {/* <Route path="announcements" element={<ManageAnnouncements />} /> */}
          {/* Add your other routes here (logs, accounts, settings) */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
