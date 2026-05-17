import { useState } from "react";
import { forgotPassword } from "../services/api";

export default function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim().toLowerCase().endsWith("@ust.edu.ph")) {
      setError("Enter a valid UST email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await forgotPassword(email.trim().toLowerCase());
      setMessage(result.message || "If that account exists, a reset link has been sent.");
    } catch (requestError) {
      setError(requestError.message || "Password reset could not be started.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 font-inter backdrop-blur-sm">
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-sm bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="relative bg-[#0f0f0f] p-8 text-white">
          <button onClick={onClose} className="absolute right-6 top-6 text-neutral-500 transition-all hover:text-[#f6c744]">
            X
          </button>
          <div className="flex items-center gap-5">
            <img src="/images/Logo 2.svg" alt="UST Logo" className="h-14 w-14 object-contain" />
            <div>
              <h2 className="font-playfair text-2xl font-bold tracking-tight">Reset <span className="text-[#f6c744]">Password</span></h2>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Recover your account</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-xs leading-relaxed text-neutral-500">
              Enter your UST email address and we will send you a secure password reset link.
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400">UST Email Address</label>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                  setMessage("");
                }}
                className="w-full border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm text-black outline-none transition-all focus:border-[#f6c744] focus:bg-white"
                placeholder="juan.delacruz.cics@ust.edu.ph"
              />
            </div>

            {(error || message) && (
              <p className={`text-[11px] font-semibold leading-relaxed ${error ? "text-red-600" : "text-emerald-700"}`}>
                {error || message}
              </p>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full bg-[#f6c744] py-4 text-[12px] font-black uppercase tracking-[0.25em] text-black transition-all hover:bg-[#e3b832] disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>

        <div className="border-t border-neutral-100 bg-neutral-50 px-8 py-6 text-center">
          <button onClick={onBackToLogin} className="text-[11px] font-medium tracking-wide text-neutral-500">
            Remembered it? <span className="font-black text-[#c49600] underline underline-offset-4">Sign in</span>
          </button>
        </div>
      </div>
    </div>
  );
}
