import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UserProfile() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  // Safe fallback if user state isn't loaded yet
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f5f5f3] px-4 py-8 font-inter text-[#070707] selection:bg-[#f6c744] selection:text-black md:px-8">
      {/* Page Title Header */}
      <div className="mx-auto max-w-[1100px] pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          My Account
        </p>
        <h1 className="font-playfair text-3xl font-bold tracking-tight text-black">
          Your Profile
        </h1>
      </div>

      {/* Main Two-Column Grid Setup */}
      <div className="mx-auto grid max-w-[1100px] gap-6 items-start md:grid-cols-2">
        
        {/* ==================== LEFT COLUMN ==================== */}
        <div className="space-y-6">
          {/* Thomasian Information Card */}
          <div className="rounded-sm border border-neutral-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-5 border-b border-neutral-100 pb-6">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f6c744] text-xl font-black text-black shadow-inner">
                  {user.firstName?.charAt(0).toUpperCase() || "M"}
                </div>
                {/* Active Status Indicator Dot */}
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div>
                <h2 className="font-playfair text-2xl font-bold tracking-tight text-neutral-900 leading-tight">
                  {user.firstName || "Migs"} {user.lastName || "Yanto"}
                </h2>
                <div className="mt-1.5 inline-block rounded-sm border border-[#c49600]/30 bg-[#fffdf2] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#c49600]">
                  Verified User Account
                </div>
              </div>
              <button className="ml-auto rounded-sm border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-50">
                Edit profile
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c49600]">
                Thomasian Information Profile
              </h3>
              <div className="divide-y divide-neutral-100 text-xs">
                <ProfileRow label="EMAIL ADDRESS" value={user.email || "miguelpaolo.yanto.cics@ust.edu.ph"} breakAll />
                <ProfileRow 
                  label="STUDENT / FACULTY ID" 
                  value={user.idNumber || user.studentOrEmployeeNumber || "2023188724"} 
                  isId
                />
                <ProfileRow 
                  label="COLLEGE DEPARTMENT" 
                  value={user.college || user.faculty || "CICS"} 
                  isBadge
                />
                <ProfileRow label="YEAR CLASSIFICATION" value={user.yearLevel || "4th Year"} />
              </div>
            </div>
          </div>

          {/* Grid Container for Event Activity Stats & Upcoming Events Side-by-Side */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Event Activity Stats Block */}
            <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c49600] border-b border-neutral-100 pb-2 mb-4">
                Event Activity
              </h3>
              <div className="space-y-4 text-xs font-medium text-neutral-500">
                <div className="flex justify-between items-center">
                  <span>Events RSVP'd</span>
                  <span className="font-playfair text-xl font-bold text-black">7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Saved events</span>
                  <span className="font-playfair text-xl font-bold text-black">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Events attended</span>
                  <span className="font-playfair text-xl font-bold text-black">12</span>
                </div>
              </div>
            </div>

            {/* Upcoming Events Block (Renamed) */}
            <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c49600] border-b border-neutral-100 pb-2 mb-4">
                Upcoming Events
              </h3>
              <div className="space-y-4">
                <UpcomingEventItem title="Thomasian Research Congress" meta="Apr 3 · Main Bldg" />
                <UpcomingEventItem title="UAAP Cheerdance Competition" meta="Apr 8 · Araneta" />
                <UpcomingEventItem title="Thomasian Career Fair" meta="Apr 17 · TARC" />
              </div>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN ==================== */}
        <div className="space-y-6">
          {/* Preferences Tags Card */}
          <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c49600] border-b border-neutral-100 pb-2 mb-4">
              Preferences
            </h3>
            <div className="flex flex-wrap gap-2">
              <PreferenceTag label="Academic" active />
              <PreferenceTag label="Sports" active />
              <PreferenceTag label="Career" active />
              <PreferenceTag label="Arts & Culture" />
              <PreferenceTag label="Religious" />
              <PreferenceTag label="Student Life" />
              <button className="rounded-sm border border-dashed border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-400 hover:border-neutral-400 hover:text-neutral-600">
                Edit
              </button>
            </div>
          </div>

          {/* Account Settings Configuration Card */}
          <div className="rounded-sm border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c49600] border-b border-neutral-100 pb-2 mb-4">
              Account Settings
            </h3>
            <div className="space-y-5">
              <SettingToggle 
                title="Event notifications" 
                description="Get alerts for new events and RSVPs" 
                defaultChecked 
              />
              <SettingToggle 
                title="Email updates" 
                description="Receive announcements via your UST email" 
                defaultChecked 
              />
              
              <div className="border-t border-neutral-100 pt-4">
                <button className="text-left group">
                  <p className="text-xs font-bold text-neutral-800 group-hover:text-[#c49600] transition-colors">
                    Change password
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Update your account credentials
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Disconnect System Access Action Element */}
          <button
            onClick={handleLogout}
            className="w-full rounded-sm border border-red-200 bg-white py-3.5 text-center text-xs font-bold uppercase tracking-wider text-red-600 transition-all hover:bg-red-50 hover:border-red-300 active:scale-[0.99]"
          >
            Disconnect Account (Logout)
          </button>
        </div>

      </div>
    </div>
  );
}

/* ==================== SUB-COMPONENTS ==================== */

function ProfileRow({ label, value, breakAll = false, isBadge = false, isId = false }) {
  if (!value) return null;

  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <span className="font-bold tracking-wider text-neutral-400 text-[10px]">{label}</span>
      {isBadge ? (
        <span className="rounded-sm border border-[#c49600]/30 bg-[#fffdf2] px-2 py-0.5 font-bold tracking-wide text-[#c49600] text-[11px]">
          {value}
        </span>
      ) : (
        <span className={`text-right text-neutral-800 ${breakAll ? "break-all font-medium" : "font-semibold"} ${isId ? "font-playfair text-sm font-black" : ""}`}>
          {value}
        </span>
      )}
    </div>
  );
}

function UpcomingEventItem({ title, meta }) {
  return (
    <div className="flex items-start gap-2.5 group cursor-pointer">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f6c744]" />
      <div>
        <p className="text-xs font-bold text-neutral-800 group-hover:text-[#c49600] transition-colors leading-snug">
          {title}
        </p>
        <p className="text-[10px] font-medium text-neutral-400 mt-0.5">
          {meta}
        </p>
      </div>
    </div>
  );
}

function PreferenceTag({ label, active = false }) {
  return (
    <span
      className={`rounded-sm px-3 py-1 text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
        active
          ? "border-[#c49600]/40 bg-[#fffdf2] text-[#c49600]"
          : "border-neutral-200 bg-neutral-50 text-neutral-500 hover:bg-neutral-100"
      }`}
    >
      {label}
    </span>
  );
}

function SettingToggle({ title, description, defaultChecked = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold text-neutral-800">{title}</p>
        <p className="text-[11px] text-neutral-400 mt-0.5 leading-normal">{description}</p>
      </div>
      
      {/* Premium Tailwind Switch Toggle Option */}
      <label className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
        <div className="h-5 w-9 rounded-full bg-neutral-200 transition-colors after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#f6c744] peer-checked:after:translate-x-full" />
      </label>
    </div>
  );
}