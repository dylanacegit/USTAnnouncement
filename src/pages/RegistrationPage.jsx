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
              <h2 className="font-playfair text-xl font-bold leading-tight">Join <span className="text-[#f6c744]">Golden Gatherings</span></h2>
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
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#c49600] uppercase">{showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88L12 12l2.12 2.12M14.2 14.2l3.4 3.4M10.4 4.4L12 4c7 0 10 8 10 8a20.2 20.2 0 01-2.9 4.6M8.6 19.4L3 24M4 12c0-8 10-8 10-8M1 1l22 22"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* ID Number Input */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.15em]">Student Information</label>
                <input 
                  type="text" 
                  value={formData.idNumber} 
                  onChange={e => updateFields({idNumber: e.target.value})} 
                  className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 text-xs outline-none focus:border-[#f6c744] focus:bg-white transition-all placeholder:text-neutral-300 rounded-sm text-black" 
                  placeholder="ID Number" 
                />
              </div>

              {/* Custom Styled Year Level Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.15em]">Year Level</label>
                <div className="relative w-full">
                  <select 
                    value={formData.yearLevel || "Select Year Level"} 
                    onChange={e => updateFields({yearLevel: e.target.value})} 
                    className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 pr-10 text-xs text-black outline-none focus:border-[#f6c744] focus:bg-white transition-all cursor-pointer rounded-sm appearance-none [&::-ms-expand]:hidden"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none' }} // Hard reset for stubborn browsers
                  >
                    <option disabled value="Select Year Level">Select Year Level</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                  
                  {/* Custom Chevron Arrow Overlay */}
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* College Buttons Layout */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.15em]">College / Faculty</label>
                <div className="grid grid-cols-2 gap-2">
                  {colleges.map(c => (
                    <button 
                      key={c} 
                      type="button"
                      onClick={() => updateFields({college: c})} 
                      className={`text-[9px] font-black py-3 border rounded-sm tracking-wider transition-all uppercase ${
                        formData.college === c 
                          ? 'bg-[#0f0f0f] text-[#f6c744] border-black shadow-md' 
                          : 'bg-neutral-50 text-neutral-400 border-neutral-200 hover:border-neutral-300 hover:bg-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* ACCOUNT SUMMARY BOX */}
              <div className="bg-[#fffdf2] border border-[#f6c744]/40 p-6 rounded-sm space-y-4">
                <h3 className="text-[10px] font-black text-[#c49600] uppercase tracking-[0.2em] border-b border-[#f6c744]/20 pb-2">
                  Account Summary
                </h3>
                
                <div className="space-y-2.5 font-inter text-[11px] text-neutral-500">
                  <div className="flex justify-between items-baseline gap-4">
                    <span className="font-medium text-neutral-400">Name</span>
                    <span className="font-semibold text-neutral-800 text-right">{formData.firstName} {formData.lastName}</span>
                  </div>
                  
                  <div className="flex justify-between items-baseline gap-4">
                    <span className="font-medium text-neutral-400">Email</span>
                    <span className="font-semibold text-neutral-800 break-all text-right">{formData.email}</span>
                  </div>
                  
                  <div className="flex justify-between items-baseline gap-4">
                    <span className="font-medium text-neutral-400">Student no.</span>
                    <span className="font-semibold text-neutral-800 text-right">{formData.idNumber || "—"}</span>
                  </div>
                  
                  <div className="flex justify-between items-baseline gap-4">
                    <span className="font-medium text-neutral-400">College</span>
                    <span className="font-semibold text-neutral-800 text-right">{formData.college || "—"}</span>
                  </div>
                  
                  <div className="flex justify-between items-baseline gap-4">
                    <span className="font-medium text-neutral-400">Year level</span>
                    <span className="font-semibold text-neutral-800 text-right">{formData.yearLevel || "—"}</span>
                  </div>
                </div>
              </div>

              {/* CHECKBOXES SECTION */}
              <div className="space-y-3.5 pt-2">
                
                {/* 1. Terms and Privacy Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group select-none">
                  <input 
                    required
                    type="checkbox" 
                    checked={certified} 
                    onChange={e => setCertified(e.target.checked)} 
                    className="mt-0.5 accent-black h-3.5 w-3.5 border-neutral-300 rounded-sm cursor-pointer" 
                  />
                  <span className="text-[11px] font-medium leading-relaxed text-neutral-500 group-hover:text-neutral-800 transition-colors">
                    I agree to the{" "}
                    <a href="/terms" target="_blank" rel="noreferrer" className="font-bold text-[#c49600] underline underline-offset-2 hover:text-black">Terms of Use</a>
                    {" "}and{" "}
                    <a href="/privacy" target="_blank" rel="noreferrer" className="font-bold text-[#c49600] underline underline-offset-2 hover:text-black">Privacy Policy</a>
                    {" "}of the UST Events Portal.
                  </span>
                </label>

                {/* 2. Marketing / Reminders Checkbox */}
                <label className="flex items-start gap-3 cursor-pointer group select-none">
                  <input 
                    type="checkbox" 
                    defaultChecked
                    className="mt-0.5 accent-black h-3.5 w-3.5 border-neutral-300 rounded-sm cursor-pointer" 
                  />
                  <span className="text-[11px] font-medium leading-relaxed text-neutral-500 group-hover:text-neutral-800 transition-colors">
                    Send me event reminders and announcements via email.
                  </span>
                </label>
                
              </div>
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
