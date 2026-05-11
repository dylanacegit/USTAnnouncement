import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

function PlaceholderPage({ title }) {
  return (
    <div className="min-h-screen bg-white p-10">
      <h1 className="font-serif text-4xl font-bold">{title}</h1>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<PlaceholderPage title="Events Page" />} />
        <Route path="/announcements" element={<PlaceholderPage title="Announcements Page" />} />
        <Route path="/about" element={<PlaceholderPage title="About Page" />} />
      </Routes>
    </BrowserRouter>
  );
}