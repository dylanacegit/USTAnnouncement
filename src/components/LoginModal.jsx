import React, { useState } from "react";
import { loginUser, resendVerification } from "../services/api";

export default function LoginModal({ isOpen, onClose, onSwitchToRegister, onForgotPassword }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const result = await loginUser({ email, password });
      localStorage.setItem("authToken", result.token);
      localStorage.setItem("authUser", JSON.stringify(result.user));
      onClose();
    } catch (requestError) {
      setError(requestError.message || "Sign in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.endsWith("@ust.edu.ph")) {
      setError("Enter your UST email address before resending verification.");
      return;
    }

    setError("");
    setSuccess("");
    setIsResending(true);

    try {
      const result = await resendVerification(normalizedEmail);
      setSuccess(result.message || "A new verification email has been sent.");
    } catch (requestError) {
      setError(requestError.message || "Verification email could not be sent. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-inter">
      {/* Main Modal Container */}
      <div className="relative w-full max-w-[440px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-300 overflow-hidden rounded-sm">
        
        {/* HEADER SECTION */}
        <div className="relative bg-[#0f0f0f] p-8 text-white">
          <button 
            type="button"
            onClick={onClose} 
            className="absolute right-6 top-6 text-neutral-500 hover:text-[#f6c744] transition-all hover:rotate-90 duration-300 z-20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>

          <div className="flex items-center gap-5 relative z-10">
            <img src="/images/Logo 2.svg" alt="UST Logo" className="h-14 w-14 object-contain" />
            <div className="space-y-0.5">
              <h2 className="font-playfair text-2xl font-bold tracking-tight">
                Welcome back, <span className="text-[#f6c744]">Thomasian</span>
              </h2>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-neutral-400 uppercase">
                Sign in to your account
              </p>
            </div>
          </div>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="bg-white p-7 space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.15em]">UST Email Address</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
                setSuccess("");
              }}
              className="w-full bg-neutral-50 border border-neutral-200 px-4 py-4 text-sm text-black outline-none focus:border-[#f6c744] focus:bg-white transition-all placeholder:text-neutral-300" 
              placeholder="juan.delacruz.cics@ust.edu.ph" 
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.15em]">Password</label>
              {/* TRIGGER FORGOT PASSWORD MODAL */}
              <button 
                type="button" 
                onClick={onForgotPassword}
                className="text-[9px] font-bold text-[#c49600] hover:text-black transition-colors uppercase tracking-widest"
              >
                Forgot Password?
              </button>
            </div>
            
            <div className="relative group">
              <input 
                required
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 px-4 py-4 pr-12 text-sm text-black outline-none focus:border-[#f6c744] focus:bg-white transition-all placeholder:text-neutral-300" 
                placeholder="••••••••" 
              />
              
              {/* Show/Hide Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88L12 12l2.12 2.12M14.2 14.2l3.4 3.4M10.4 4.4L12 4c7 0 10 8 10 8a20.2 20.2 0 01-2.9 4.6M8.6 19.4L3 24M4 12c0-8 10-8 10-8M1 1l22 22"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {(error || success) && (
            <div className="space-y-3">
              <p className={`text-[11px] font-semibold leading-relaxed ${error ? "text-red-600" : "text-emerald-700"}`}>
                {error || success}
              </p>
              {error && email.trim().toLowerCase().endsWith("@ust.edu.ph") && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="text-[10px] font-black uppercase tracking-widest text-[#c49600] hover:text-black disabled:text-neutral-400"
                >
                  {isResending ? "Sending..." : "Resend Verification Email"}
                </button>
              )}
            </div>
          )}

          {/* Sign In Button */}
          <button 
            type="submit"
            disabled={isSubmitting || isResending} 
            className="relative w-full group overflow-hidden bg-[#f6c744] py-4 text-[12px] font-black uppercase tracking-[0.25em] text-black transition-all hover:bg-[#e3b832] hover:text-black shadow-lg active:scale-[0.98] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* FOOTER */}
        <div className="bg-neutral-50 px-8 py-4 text-center border-t border-neutral-100">
          <p className="text-[11px] text-neutral-500 font-medium tracking-wide">
            Don't have an account?{" "}
            <button 
              type="button"
              onClick={onSwitchToRegister}
              className="font-black text-[#c49600] hover:text-black transition-colors underline underline-offset-4 decoration-1"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}