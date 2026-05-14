import React, { useState } from "react";
import { registerUser, resendVerification } from "../services/api";

export default function RegistrationPage({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [certified, setCertified] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    role: "", 
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    idNumber: "",
    yearLevel: "Select year",
    college: "",
    interests: [],
    avatar: "🐯",
  });

  if (!isOpen) return null;

  const updateFields = (fields) => {
    setError("");
    setSuccess("");
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const colleges = ["Engineering", "Nursing", "CICS", "Arts & Letters", "Commerce", "Medicine", "Civil Law", "Fine Arts", "Sciences", "Pharmacy"];

  const closeModal = () => {
    setStep(1);
    setError("");
    setSuccess("");
    setCertified(false);
    setIsSubmitting(false);
    setIsResending(false);
    onClose();
  };

  const validateCurrentStep = () => {
    if (step === 1) {
      if (!formData.role || !formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        return "Please complete all fields before continuing.";
      }

      if (!formData.email.trim().toLowerCase().endsWith("@ust.edu.ph")) {
        return "Only @ust.edu.ph email addresses are allowed.";
      }

      if (formData.password.length < 8) {
        return "Password must be at least 8 characters long.";
      }
    }

    if (step === 2 && (!formData.idNumber || formData.yearLevel === "Select year" || !formData.college)) {
      return "Please complete your Thomasian identity details.";
    }

    if (step === 3 && !certified) {
      return "Please confirm the certification before completing registration.";
    }

    return "";
  };

  const handleNext = async () => {
    const validationError = validateCurrentStep();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (step < 3) {
      setError("");
      setStep(step + 1);
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const result = await registerUser({
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        studentOrEmployeeNumber: formData.idNumber,
        yearLevel: formData.yearLevel,
        faculty: formData.college,
      });

      setSuccess(result.message || "Registration successful. Please check your UST email.");
    } catch (requestError) {
      setError(requestError.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    const email = formData.email.trim().toLowerCase();

    if (!email.endsWith("@ust.edu.ph")) {
      setError("Enter your UST email address before resending verification.");
      return;
    }

    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const result = await resendVerification(email);
      setSuccess(result.message || "A new verification email has been sent.");
    } catch (requestError) {
      setError(requestError.message || "Verification email could not be sent. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-inter">
      <div className="relative w-full max-w-[440px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in-95 duration-200 overflow-hidden rounded-sm">
        
        {/* HEADER */}
        <div className="relative bg-[#0f0f0f] p-6 text-white">
          <button onClick={onClose} className="absolute right-5 top-5 text-neutral-500 hover:text-[#f6c744] transition-all hover:rotate-90 duration-300 z-20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <div className="relative z-10 flex items-center gap-4">
            <img src="/images/Logo 2.svg" alt="UST Logo" className="h-10 w-10 object-contain" />
            <div>
              <h2 className="font-playfair text-xl font-bold leading-tight">Join <span className="text-[#f6c744]">Gatherings</span></h2>
              <p className="text-[9px] font-medium tracking-[0.2em] text-neutral-400 uppercase">Step {step} of 3 • Registration</p>
            </div>
          </div>
        </div>

        {/* STEPPER BAR */}
        <div className="flex bg-[#1a1a1a] px-8 py-2 items-center border-t border-white/5">
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              <div className="flex items-center gap-2">
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black transition-colors ${step >= num ? 'bg-[#f6c744] text-black' : 'bg-neutral-800 text-neutral-500'}`}>{num}</span>
              </div>
              {num < 3 && <div className={`mx-2 h-[1px] flex-1 transition-colors ${step > num ? 'bg-[#f6c744]/50' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* CONTENT AREA */}
        <div className="p-8 max-h-[420px] overflow-y-auto custom-scrollbar bg-white">
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex gap-3">
                {['student', 'teacher'].map((r) => (
                  <button 
                    key={r}
                    onClick={() => updateFields({ role: r })}
                    className={`flex-1 py-4 border-2 transition-all flex flex-col items-center gap-1 rounded-sm ${formData.role === r ? 'border-[#f6c744] bg-[#f6c744]/5 text-black' : 'border-neutral-100 text-neutral-400 hover:border-neutral-200'}`}
                  >
                    <span className="text-xl">{r === 'student' ? '🎓' : '👨‍🏫'}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{r}</span>
                  </button>
                ))}
              </div>
              {formData.role && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={formData.firstName} onChange={e => updateFields({firstName: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-[#f6c744]" placeholder="First Name" />
                    <input type="text" value={formData.lastName} onChange={e => updateFields({lastName: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-[#f6c744]" placeholder="Last Name" />
                  </div>
                  <input type="email" value={formData.email} onChange={e => updateFields({email: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-[#f6c744]" placeholder="UST Email Address" />
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => updateFields({password: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 pr-12 text-xs outline-none focus:border-[#f6c744]" placeholder="Password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#c49600] uppercase">{showPassword ? "Hide" : "Show"}</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
              <input type="text" value={formData.idNumber} onChange={e => updateFields({idNumber: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-[#f6c744]" placeholder="ID Number" />
              <select value={formData.yearLevel} onChange={e => updateFields({yearLevel: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-[#f6c744] appearance-none">
                <option disabled>Select Year Level</option>
                <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                {colleges.map(c => (
                  <button key={c} onClick={() => updateFields({college: c})} className={`text-[9px] font-bold py-2 border rounded-sm transition-all ${formData.college === c ? 'bg-black text-white border-black' : 'bg-white text-neutral-400 border-neutral-100'}`}>{c}</button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-neutral-900 p-5 rounded-sm relative overflow-hidden">
                <p className="text-[9px] font-black text-[#f6c744] uppercase tracking-widest mb-3 border-b border-white/10 pb-1">Verified Thomasian Identity</p>
                <div className="space-y-2 text-[11px] text-white/80">
                  <div className="flex justify-between"><span>Name</span><span className="font-bold text-white">{formData.firstName} {formData.lastName}</span></div>
                  <div className="flex justify-between"><span>Email</span><span className="font-bold text-white">{formData.email}</span></div>
                </div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={certified} onChange={e => setCertified(e.target.checked)} className="mt-1 accent-black h-3 w-3" />
                <span className="text-[10px] leading-relaxed text-neutral-500">I certify that I am a bona fide student/faculty of UST and agree to the Data Privacy Agreement.</span>
              </label>
            </div>
          )}

          {(error || success) && (
            <div className="mt-5 space-y-3">
              <p className={`text-[11px] font-semibold leading-relaxed ${error ? "text-red-600" : "text-emerald-700"}`}>
                {error || success}
              </p>
              {formData.email.trim().toLowerCase().endsWith("@ust.edu.ph") && (
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
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-8 py-5">
          <button onClick={() => step > 1 ? setStep(step - 1) : closeModal()} className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black">
            {step === 1 ? "Cancel" : "Back"}
          </button>
          
          <button 
            onClick={handleNext}
            disabled={isSubmitting || isResending || Boolean(success)}
            className="bg-[#f6c744] px-10 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-black hover:bg-[#e3b832] transition-all shadow-xl active:scale-[0.98] flex items-center gap-2"
          >
            {isSubmitting ? "Submitting..." : step === 3 ? "Complete Registration" : "Next Step"} <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
