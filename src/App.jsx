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
import About from "./pages/About";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import UserProfile from "./pages/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";

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
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:eventId" element={<Events />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="about" element={<About />} />
          </Route>

          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<UserProfile />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="events" element={<ManageEvents />} />
              <Route path="announcements" element={<ManageAnnouncements />} />

              <Route path="accounts" element={<ManageAccounts />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
