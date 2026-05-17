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
import GalleryApprovals from "./pages/adminPages/GalleryApprovals";
import EventGallery from "./pages/adminPages/EventGallery";
import VisionAIDemo from "./pages/adminPages/VisionAIDemo";
import Settings from "./pages/adminPages/Settings";
import About from "./pages/About";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import UserProfile from "./pages/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";

// Layout for the User side (includes Header, Footer, and the AI widget)
function UserLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f3]">
      <Header />
      {/* flex-grow ensures the footer stays stuck to the absolute bottom on short pages */}
      <main className="flex-grow">
        <Outlet />
      </main>
      <AIChatWidget />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          
          {/* ==================== USER SYSTEM AREA ==================== */}
          <Route path="/" element={<UserLayout />}>
            {/* Public Access Sub-Routes */}
            <Route index element={<Home />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:eventId" element={<Events />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="about" element={<About />} />

            {/* Protected User Sub-Routes (Now cleanly wrapped inside your UserLayout!) */}
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<UserProfile />} />
            </Route>
          </Route>

          {/* ==================== SYSTEM UTILITY AREA ==================== */}
          {/* Standing alone completely without the user layout framework templates */}
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ==================== ADMINISTRATIVE CONSOLE ==================== */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="events" element={<ManageEvents />} />
              <Route path="announcements" element={<ManageAnnouncements />} />
              <Route path="gallery-approvals" element={<GalleryApprovals />} />
              <Route path="event-gallery" element={<EventGallery />} />
              <Route path="vision-ai" element={<VisionAIDemo />} />
              <Route path="accounts" element={<ManageAccounts />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
