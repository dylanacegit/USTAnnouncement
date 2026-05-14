import React, { useState } from "react";

export default function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-inter">
      <div className="relative w-full max-w-[440px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-300 overflow-hidden rounded-sm">
        
        {/* HEADER */}
        <div className="relative bg-[#0f0f0f] p-8 text-white">
          <button 
            onClick={onClose} 
            className="absolute right-6 top-6 text-neutral-500 hover:text-[#f6c744] transition-all hover:rotate-90 duration-300 z-20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>

          <div className="flex items-center gap-5 relative z-10">
            <img src="/images/Logo 2.svg" alt="UST Logo" className="h-14 w-14 object-contain" />
            <div className="space-y-0.5">
              <h2 className="font-playfair text-2xl font-bold tracking-tight">
                Reset <span className="text-[#f6c744]">Password</span>
              </h2>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-neutral-400 uppercase">Recover your account</p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="bg-white p-8">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-xs text-neutral-500 leading-relaxed">
                Enter your <strong className="text-black">UST Email Address</strong> and we'll send you instructions to reset your password.
              </p>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.15em]">UST Email Address</label>
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 px-4 py-4 text-sm text-black outline-none focus:border-[#f6c744] focus:bg-white transition-all placeholder:text-neutral-300" 
                  placeholder="juan.delacruz.cics@ust.edu.ph" 
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#f6c744] py-4 text-[12px] font-black uppercase tracking-[0.25em] text-black transition-all hover:bg-[#e3b832] shadow-lg active:scale-[0.98]"
              >
                Send Reset Link
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-center">
                <div className="h-16 w-16 bg-[#f6c744]/10 rounded-full flex items-center justify-center text-[#c49600]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg">Check your inbox</h3>
                <p className="text-xs text-neutral-500 leading-relaxed"> Instructions sent to:<br/><span className="font-bold text-black">{email}</span></p>
              </div>
              <button onClick={onBackToLogin} className="text-[10px] font-black text-[#c49600] uppercase tracking-widest hover:text-black">← Return to Login</button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-neutral-50 px-8 py-6 text-center border-t border-neutral-100">
           <button onClick={onBackToLogin} className="text-[11px] text-neutral-500 font-medium tracking-wide">
            Remembered it? <span className="font-black text-[#c49600] underline underline-offset-4 decoration-1">Sign in</span>
          </button>
        </div>
      </div>
    </div>
  );
}