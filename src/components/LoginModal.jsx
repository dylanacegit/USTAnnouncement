import React from "react";

export default function LoginModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      {/* Reduced max-width to 460px for a "smaller" feel */}
      <div className="relative w-full max-w-[460px] overflow-hidden bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header - Compact */}
        <div className="relative bg-[#0f0f0f] p-6 text-white overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[#f6c744]/10 skew-x-[-20deg] translate-x-12" />
          
          <button 
            onClick={onClose} 
            className="absolute right-4 top-4 text-neutral-500 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>

          <div className="relative z-10">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#f6c744] font-black text-black text-[9px] tracking-tighter">UST</div>
            <h2 className="font-playfair text-2xl font-bold leading-tight">
              Create your <span className="text-[#f6c744]">Thomasian</span> account
            </h2>
            <p className="mt-1 text-[9px] font-medium tracking-[0.1em] text-neutral-500 uppercase">
              University of Santo Tomas · AY 2025–2026
            </p>
          </div>
        </div>

        {/* Stepper - Compact height */}
        <div className="flex bg-[#181818] px-6 py-2.5 items-center">
          <div className="flex items-center gap-2 text-white">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#f6c744] text-[9px] font-black text-black">1</span>
            <span className="text-[9px] font-black uppercase tracking-widest">Account</span>
          </div>
          <div className="mx-3 h-[1px] flex-1 bg-white/10" />
          <div className="flex items-center gap-2 text-neutral-600">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-800 text-[9px] font-black">2</span>
            <span className="text-[9px] font-black uppercase tracking-widest">Profile</span>
          </div>
        </div>

        {/* Form Body - Reduced padding */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">First name <span className="text-[#f6c744]">*</span></label>
              <input type="text" placeholder="Juan" className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 text-sm focus:border-[#f6c744] outline-none transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Last name <span className="text-[#f6c744]">*</span></label>
              <input type="text" placeholder="dela Cruz" className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 text-sm focus:border-[#f6c744] outline-none transition-all" />
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">UST email address <span className="text-[#f6c744]">*</span></label>
            <input type="email" placeholder="juandelacruz@ust.edu.ph" className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 text-sm focus:border-[#f6c744] outline-none" />
          </div>

          <div className="mt-4 space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Password <span className="text-[#f6c744]">*</span></label>
            <div className="relative">
              <input type="password" placeholder="••••••••" className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 text-sm focus:border-[#f6c744] outline-none" />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-neutral-400 hover:text-black">Show</button>
            </div>
            <div className="flex gap-0.5 pt-1">
              <div className="h-1 flex-1 bg-[#f6c744]" /><div className="h-1 flex-1 bg-neutral-200" /><div className="h-1 flex-1 bg-neutral-200" /><div className="h-1 flex-1 bg-neutral-200" />
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Confirm password <span className="text-[#f6c744]">*</span></label>
            <input type="password" placeholder="••••••••" className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 text-sm focus:border-[#f6c744] outline-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-6 py-4">
          <p className="text-[11px] text-neutral-500 font-medium">
            Have an account? <button className="font-bold text-[#c49600] underline">Log in</button>
          </p>
          <button className="flex items-center gap-2 bg-[#070707] px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-neutral-800 active:scale-95">
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}