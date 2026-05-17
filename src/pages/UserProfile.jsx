<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    const token = localStorage.getItem("authToken");

    // Route guard: boot out users if they are not authenticated
    if (!token || !storedUser) {
      navigate("/");
    } else {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.clear();
        navigate("/");
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    // Purge auth values from storage arrays
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    
    // Bounce the application user state back onto the primary landing page
=======
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UserProfile() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = () => {
    signOut();
>>>>>>> e59ce8f (Add bookmarks announcements updates and event gallery)
    navigate("/");
  };

  if (!user) return null;

  return (
<<<<<<< HEAD
    <div className="min-h-[calc(100vh-4rem)] bg-[#070707] flex items-center justify-center p-4 font-inter text-white">
      <div className="w-full max-w-[500px] bg-[#0d0d0d] border border-white/10 p-8 rounded-sm shadow-xl space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex items-center gap-5 border-b border-white/5 pb-6">
          <div className="h-16 w-16 rounded-full bg-[#f6c744] flex items-center justify-center text-black text-2xl font-black shadow-inner">
            {user.firstName?.charAt(0).toUpperCase()}
=======
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#070707] p-4 font-inter text-white">
      <div className="w-full max-w-[500px] space-y-8 rounded-sm border border-white/10 bg-[#0d0d0d] p-8 shadow-xl">
        <div className="flex items-center gap-5 border-b border-white/5 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f6c744] text-2xl font-black text-black shadow-inner">
            {user.firstName?.charAt(0).toUpperCase() || "U"}
>>>>>>> e59ce8f (Add bookmarks announcements updates and event gallery)
          </div>
          <div>
            <h2 className="font-playfair text-2xl font-bold tracking-tight text-white">
              {user.firstName} {user.lastName}
            </h2>
<<<<<<< HEAD
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#f6c744] uppercase mt-0.5">
              Verified {user.role || "Thomasian"} Account
=======
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f6c744]">
              Verified {user.role || user.occupation || "Thomasian"} Account
>>>>>>> e59ce8f (Add bookmarks announcements updates and event gallery)
            </p>
          </div>
        </div>

<<<<<<< HEAD
        {/* METADATA SPEC SUMMARY BOX */}
        <div className="bg-[#fffdf2] border border-[#f6c744]/40 p-6 rounded-sm space-y-3.5 text-black">
          <h3 className="text-[10px] font-black text-[#c49600] uppercase tracking-[0.2em] border-b border-[#f6c744]/20 pb-2">
            Thomasian Information Profile
          </h3>
          
          <div className="space-y-2.5 text-[11px] text-neutral-500">
            <div className="flex justify-between items-baseline gap-4">
              <span className="font-medium text-neutral-400">Email Address</span>
              <span className="font-semibold text-neutral-800 text-right break-all">{user.email}</span>
            </div>
            
            {user.idNumber && (
              <div className="flex justify-between items-baseline gap-4">
                <span className="font-medium text-neutral-400">Student/Faculty ID</span>
                <span className="font-semibold text-neutral-800 text-right">{user.idNumber}</span>
              </div>
            )}
            
            {user.college && (
              <div className="flex justify-between items-baseline gap-4">
                <span className="font-medium text-neutral-400">College Department</span>
                <span className="font-semibold text-neutral-800 text-right">{user.college}</span>
=======
        <div className="space-y-3.5 rounded-sm border border-[#f6c744]/40 bg-[#fffdf2] p-6 text-black">
          <h3 className="border-b border-[#f6c744]/20 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#c49600]">
            Thomasian Information Profile
          </h3>

          <div className="space-y-2.5 text-[11px] text-neutral-500">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-medium text-neutral-400">Email Address</span>
              <span className="break-all text-right font-semibold text-neutral-800">{user.email}</span>
            </div>

            {(user.idNumber || user.studentOrEmployeeNumber) && (
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-medium text-neutral-400">Student/Faculty ID</span>
                <span className="text-right font-semibold text-neutral-800">
                  {user.idNumber || user.studentOrEmployeeNumber}
                </span>
              </div>
            )}

            {(user.college || user.faculty) && (
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-medium text-neutral-400">College Department</span>
                <span className="text-right font-semibold text-neutral-800">{user.college || user.faculty}</span>
>>>>>>> e59ce8f (Add bookmarks announcements updates and event gallery)
              </div>
            )}

            {user.yearLevel && (
<<<<<<< HEAD
              <div className="flex justify-between items-baseline gap-4">
                <span className="font-medium text-neutral-400">Year Classification</span>
                <span className="font-semibold text-neutral-800 text-right">{user.yearLevel}</span>
=======
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-medium text-neutral-400">Year Classification</span>
                <span className="text-right font-semibold text-neutral-800">{user.yearLevel}</span>
>>>>>>> e59ce8f (Add bookmarks announcements updates and event gallery)
              </div>
            )}
          </div>
        </div>

<<<<<<< HEAD
        {/* ACCOUNT LOGOUT TRIGGER BUTTON */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/20 hover:border-red-500/40 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] rounded-sm transition-all transition-colors active:scale-[0.99]"
        >
          Disconnect Account (Logout)
        </button>

      </div>
    </div>
  );
}
=======
        <button
          onClick={handleLogout}
          className="w-full rounded-sm border border-red-500/20 bg-red-950/40 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-900/40 active:scale-[0.99]"
        >
          Disconnect Account (Logout)
        </button>
      </div>
    </div>
  );
}
>>>>>>> e59ce8f (Add bookmarks announcements updates and event gallery)
