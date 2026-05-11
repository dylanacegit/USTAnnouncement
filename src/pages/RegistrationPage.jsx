import React, { useState } from "react";

export default function RegistrationPage({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    role: "", // student or teacher
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

  const updateFields = (fields) => setFormData((prev) => ({ ...prev, ...fields }));

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const colleges = ["Engineering", "Nursing", "CICS", "Arts & Letters", "Commerce", "Medicine", "Civil Law", "Fine Arts", "Sciences", "Pharmacy"];
  const interests = ["Academic", "Sports", "Arts", "Religious", "Career", "Student Life"];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-inter">
      <div className="relative w-full max-w-[420px] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden rounded-sm">
        
        {/* HEADER */}
        <div className="relative bg-[#0f0f0f] p-5 text-white">
          <button onClick={onClose} className="absolute right-4 top-4 text-neutral-500 hover:text-white transition-colors z-20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <div className="relative z-10">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#f6c744] font-black text-black text-[9px]">UST</div>
            <h2 className="font-playfair text-xl font-bold leading-tight">Create your <span className="text-[#f6c744]">Thomasian</span> account</h2>
            <p className="text-[9px] font-medium tracking-widest text-neutral-400 uppercase">AY 2025–2026</p>
          </div>
        </div>

        {/* STEPPER */}
        <div className="flex bg-[#1a1a1a] px-6 py-2.5 items-center border-t border-[#f6c744]/30">
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              <div className={`flex items-center gap-2 ${step === num ? 'text-white' : 'text-neutral-500'}`}>
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black ${step === num ? 'bg-[#f6c744] text-black' : 'bg-neutral-800 text-neutral-500'}`}>{num}</span>
                <span className="text-[9px] font-black uppercase tracking-tighter">{num === 1 ? 'Account' : num === 2 ? 'Profile' : 'Confirm'}</span>
              </div>
              {num < 3 && <div className="mx-3 h-[1px] flex-1 bg-white/10" />}
            </React.Fragment>
          ))}
        </div>

        {/* CONTENT AREA (Scrollable to keep card small) */}
        <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar space-y-4">
          
          {/* STEP 1: ACCOUNT */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex gap-3">
                <button 
                  onClick={() => updateFields({ role: "student" })}
                  className={`flex-1 py-3 border-2 transition-all flex flex-col items-center gap-1 ${formData.role === 'student' ? 'border-[#f6c744] bg-[#f6c744]/5' : 'border-neutral-100 opacity-50'}`}
                >
                  <span className="text-xl">🎓</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black">Student</span>
                </button>
                <button 
                  onClick={() => updateFields({ role: "teacher" })}
                  className={`flex-1 py-3 border-2 transition-all flex flex-col items-center gap-1 ${formData.role === 'teacher' ? 'border-[#f6c744] bg-[#f6c744]/5' : 'border-neutral-100 opacity-50'}`}
                >
                  <span className="text-xl">👨‍🏫</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black">Teacher</span>
                </button>
              </div>

              {formData.role && (
                <div className="space-y-3 pt-2 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">First Name *</label>
                      <input type="text" value={formData.firstName} onChange={e => updateFields({firstName: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-[#f6c744]" placeholder="Juan" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase">Last Name *</label>
                      <input type="text" value={formData.lastName} onChange={e => updateFields({lastName: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-[#f6c744]" placeholder="dela Cruz" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">UST Email *</label>
                    <input type="email" value={formData.email} onChange={e => updateFields({email: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-[#f6c744]" placeholder="juan.delacruz.cics@ust.edu.ph" />
                  </div>
                  <div className="space-y-1 relative">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Password *</label>
                    <input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => updateFields({password: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-[#f6c744]" placeholder="••••••••" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 bottom-2 text-[10px] font-bold text-neutral-400 hover:text-black">{showPassword ? "Hide" : "Show"}</button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase">Confirm Password *</label>
                    <input type="password" value={formData.confirmPassword} onChange={e => updateFields({confirmPassword: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-[#f6c744]" placeholder="••••••••" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PROFILE */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">{formData.role === 'student' ? 'Student Number *' : 'Employee Number *'}</label>
                <input type="text" value={formData.idNumber} onChange={e => updateFields({idNumber: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-[#f6c744]" placeholder="2021123456" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Year Level *</label>
                  <select value={formData.yearLevel} onChange={e => updateFields({yearLevel: e.target.value})} className="w-full bg-neutral-50 border border-neutral-200 px-3 py-2 text-xs outline-none">
                    <option disabled>Select year</option>
                    <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                  </select>
                </div>

              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">College *</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {colleges.map(c => (
                    <button key={c} onClick={() => updateFields({college: c})} className={`text-[9px] font-bold py-1.5 border transition-all ${formData.college === c ? 'bg-black text-white border-black' : 'bg-white text-neutral-400 border-neutral-100 hover:border-[#f6c744]'}`}>{c}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRM */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in text-center">
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Choose an Avatar</p>
                <div className="flex justify-center gap-3">
                  {['🐯', '📚', '🎓', '⚡', '🌟'].map(e => (
                    <button key={e} onClick={() => updateFields({avatar: e})} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg transition-all ${formData.avatar === e ? 'border-[#f6c744] bg-[#f6c744]/10' : 'border-neutral-100 hover:border-neutral-200'}`}>{e}</button>
                  ))}
                </div>
              </div>
              <div className="bg-[#fefcf5] border border-[#f6c744]/20 p-4 text-left rounded-sm">
                <p className="text-[9px] font-black text-[#c49600] uppercase tracking-widest mb-2 border-b border-[#f6c744]/10 pb-1">Account Summary</p>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between"><span className="text-neutral-400">Name:</span><span className="font-bold">{formData.firstName} {formData.lastName}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-400">Email:</span><span className="font-bold truncate max-w-[180px]">{formData.email}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-400">College:</span><span className="font-bold">{formData.college}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-400">ID No:</span><span className="font-bold">{formData.idNumber}</span></div>
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="accent-black h-3 w-3" />
                  <span className="text-[10px] text-neutral-500 group-hover:text-black transition-colors">I agree to the <span className="underline font-bold">Terms & Conditions</span></span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-6 py-4">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : onClose()} 
            className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>
          <button 
            disabled={step === 1 && (!formData.role || !formData.email)}
            onClick={() => step < 3 ? setStep(step + 1) : onClose()} 
            className="bg-black px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#f6c744] hover:text-black transition-all flex items-center gap-2"
          >
            {step === 3 ? "Create Account" : "Continue"} <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}