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
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#070707] flex items-center justify-center p-4 font-inter text-white">
      <div className="w-full max-w-[500px] bg-[#0d0d0d] border border-white/10 p-8 rounded-sm shadow-xl space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex items-center gap-5 border-b border-white/5 pb-6">
          <div className="h-16 w-16 rounded-full bg-[#f6c744] flex items-center justify-center text-black text-2xl font-black shadow-inner">
            {user.firstName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-playfair text-2xl font-bold tracking-tight text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#f6c744] uppercase mt-0.5">
              Verified {user.role || "Thomasian"} Account
            </p>
          </div>
        </div>

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
              </div>
            )}

            {user.yearLevel && (
              <div className="flex justify-between items-baseline gap-4">
                <span className="font-medium text-neutral-400">Year Classification</span>
                <span className="font-semibold text-neutral-800 text-right">{user.yearLevel}</span>
              </div>
            )}
          </div>
        </div>

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