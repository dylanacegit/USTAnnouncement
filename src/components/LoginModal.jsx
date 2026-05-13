import React from "react";

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-inter">
      <div className="relative w-full max-w-[420px] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden rounded-sm">
        
        {/* HEADER */}
        <div className="relative bg-[#0f0f0f] p-5 text-white">
          <button onClick={onClose} className="absolute right-4 top-4 text-neutral-500 hover:text-white transition-colors z-20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <div className="relative z-10">
            <h2 className="font-playfair text-xl font-bold leading-tight">Welcome back, <span className="text-[#f6c744]">Thomasian</span></h2>
            <p className="text-[9px] font-medium tracking-widest text-neutral-400 uppercase">Sign in to your account</p>
          </div>
        </div>

        {/* FORM BODY */}
        <div className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">UST Email Address</label>
            <input type="email" className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-[#f6c744]" placeholder="juan.delacruz.cics@ust.edu.ph" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Password</label>
            <input type="password" className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-[#f6c744]" placeholder="••••••••" />
          </div>
          <button className="w-full bg-black py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-[#f6c744] hover:text-black transition-all">
            Sign In
          </button>
        </div>

        {/* FOOTER - THE SECTION TO CHECK */}
        <div className="border-t border-neutral-100 bg-neutral-50 px-8 py-5 text-center">
          <p className="text-[11px] text-neutral-500 font-medium">
            Don't have an account?{" "}
            <button 
              type="button"
              onClick={() => {
                console.log("Switching to Register..."); // Debugging line
                onSwitchToRegister();
              }}
              className="font-bold text-[#c49600] underline hover:text-black transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}