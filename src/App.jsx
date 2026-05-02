import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header"; // 1. Import your Header
import Home from "./pages/Home";
import Events from "./pages/Events"; 
import Footer from "./components/Footer";

function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen bg-[#070707] p-10">
      <h1 className="font-serif text-4xl font-bold text-white">{title}</h1>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* 2. Put Header here so it shows on ALL pages */}
      <Header /> 

      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* 3. Change 'element' from PlaceholderPage to Events */}
        <Route path="/events" element={<Events />} />
        
        <Route path="/announcements" element={<PlaceholderPage title="Announcements Page" />} />
        <Route path="/about" element={<PlaceholderPage title="About Page" />} />

      </Routes>

      <Footer />

    </BrowserRouter>
  );
}