import React, { useState } from "react";
import { registerUser, resendVerification } from "../services/api";

const colleges = [
  "Engineering",
  "Nursing",
  "CICS",
  "Arts & Letters",
  "Commerce",
  "Medicine",
  "Civil Law",
  "Fine Arts",
  "Sciences",
  "Pharmacy",
];

const LIMITS = {
  firstName: 60,
  lastName: 60,
  email: 120,
  password: 72,
  idNumber: 40,
};

const initialForm = {
  occupation: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  idNumber: "",
  yearLevel: "Select year",
  college: "",
};

export default function RegistrationPage({ isOpen, onClose, onSwitchToLogin }) {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResendVerification, setCanResendVerification] = useState(false);
  const [certified, setCertified] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState(initialForm);

  if (!isOpen) return null;

  const updateFields = (fields) => {
    setError("");
    setSuccess("");
    if (fields.email !== undefined) setCanResendVerification(false);
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const normalizedForm = {
    ...formData,
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    email: formData.email.trim().toLowerCase(),
    idNumber: formData.idNumber.trim(),
    college: formData.college.trim(),
  };

  const resetForm = () => {
    setStep(1);
    setShowPassword(false);
    setIsSubmitting(false);
    setIsResending(false);
    setCanResendVerification(false);
    setCertified(false);
    setError("");
    setSuccess("");
    setFormData(initialForm);
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  const validateCurrentStep = () => {
    if (step === 1) {
      if (
        !normalizedForm.occupation ||
        !normalizedForm.firstName ||
        !normalizedForm.lastName ||
        !normalizedForm.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        return "Please complete all fields before continuing.";
      }

      for (const [field, maxLength] of Object.entries(LIMITS)) {
        if (String(normalizedForm[field] || formData[field] || "").length > maxLength) {
          return `${fieldToLabel(field)} must be ${maxLength} characters or fewer.`;
        }
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedForm.email)) {
        return "Enter a valid UST email address.";
      }

      if (!normalizedForm.email.endsWith("@ust.edu.ph")) {
        return "Only @ust.edu.ph email addresses are allowed.";
      }

      if (formData.password.length < 8) {
        return "Password must be at least 8 characters long.";
      }

      /* STRICT PASSWORD MATCH VALIDATION */
      if (formData.password !== formData.confirmPassword) {
        return "Passwords do not match. Please verify your credentials.";
      }
    }

    if (
      step === 2 &&
      (!normalizedForm.idNumber ||
        formData.yearLevel === "Select year" ||
        !normalizedForm.college)
    ) {
      return "Please complete your Thomasian identity details.";
    }

    if (step === 2 && normalizedForm.idNumber.length > LIMITS.idNumber) {
      return `ID number must be ${LIMITS.idNumber} characters or fewer.`;
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
    setCanResendVerification(false);

    try {
      const result = await registerUser({
        occupation: normalizedForm.occupation,
        firstName: normalizedForm.firstName,
        lastName: normalizedForm.lastName,
        email: normalizedForm.email,
        password: formData.password,
        studentOrEmployeeNumber: normalizedForm.idNumber,
        yearLevel: formData.yearLevel,
        faculty: normalizedForm.college,
      });

      setSuccess(
        result.message || "Registration successful. Please check your UST email."
      );
      setCanResendVerification(true);
    } catch (requestError) {
      setError(requestError.message || "Registration failed. Please try again.");
      setCanResendVerification(false);
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
      setError(
        requestError.message || "Verification email could not be sent. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 font-inter backdrop-blur-sm">
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-sm bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="relative bg-[#0f0f0f] p-6 text-white">
          <button
            onClick={closeModal}
            className="absolute right-5 top-5 text-neutral-500 transition-all hover:text-[#f6c744]"
            aria-label="Close registration"
          >
            X
          </button>
          <div className="relative z-10 flex items-center gap-4">
            <img src="/images/Logo 2.svg" alt="UST Logo" className="h-10 w-10 object-contain" />
            <div>
              <h2 className="font-playfair text-xl font-bold leading-tight">
                Join <span className="text-[#f6c744]">Golden Gatherings</span>
              </h2>
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-400">
                Step {step} of 3 - Registration
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center border-t border-white/5 bg-[#1a1a1a] px-8 py-2">
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black ${
                  step >= num ? "bg-[#f6c744] text-black" : "bg-neutral-800 text-neutral-500"
                }`}
              >
                {num}
              </span>
              {num < 3 && (
                <div
                  className={`mx-2 h-px flex-1 ${
                    step > num ? "bg-[#f6c744]/50" : "bg-white/10"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="max-h-[420px] overflow-y-auto bg-white p-8">
          {step === 1 && (
            <div className="space-y-5">
              <RegistrationLabel label="Account Type" required>
                <div className="flex gap-3">
                  {["student", "teacher"].map((occupation) => (
                    <button
                      key={occupation}
                      type="button"
                      onClick={() => updateFields({ occupation })}
                      className={`flex-1 rounded-sm border-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                        formData.occupation === occupation
                          ? "border-[#f6c744] bg-[#f6c744]/5 text-black"
                          : "border-neutral-100 text-neutral-400 hover:border-neutral-200"
                      }`}
                    >
                      {occupation}
                    </button>
                  ))}
                </div>
              </RegistrationLabel>

              {formData.occupation && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <RegistrationLabel label="First Name" required>
                      <input required maxLength={LIMITS.firstName} value={formData.firstName} onChange={(event) => updateFields({ firstName: event.target.value })} className="w-full border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs outline-none focus:border-[#f6c744]" placeholder="First Name" />
                    </RegistrationLabel>
                    <RegistrationLabel label="Last Name" required>
                      <input required maxLength={LIMITS.lastName} value={formData.lastName} onChange={(event) => updateFields({ lastName: event.target.value })} className="w-full border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs outline-none focus:border-[#f6c744]" placeholder="Last Name" />
                    </RegistrationLabel>
                  </div>
                  <RegistrationLabel label="UST Email Address" required>
                    <input required type="email" maxLength={LIMITS.email} value={formData.email} onChange={(event) => updateFields({ email: event.target.value })} className="w-full border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs outline-none focus:border-[#f6c744]" placeholder="UST Email Address" />
                  </RegistrationLabel>
                  
                  {/* MAIN PASSWORD FIELD */}
                  <RegistrationLabel label="Password" required>
                    <div className="relative">
                      <input required minLength={8} maxLength={LIMITS.password} type={showPassword ? "text" : "password"} value={formData.password} onChange={(event) => updateFields({ password: event.target.value })} className="w-full border border-neutral-200 bg-neutral-50 px-4 py-3 pr-12 text-xs outline-none focus:border-[#f6c744]" placeholder="Password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c49600]" aria-label={showPassword ? "Hide password" : "Show password"}>
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
                  </RegistrationLabel>

                  {/* SECURE CONFIRM PASSWORD FIELD */}
                  <RegistrationLabel label="Confirm Password" required>
                    <input required minLength={8} maxLength={LIMITS.password} type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(event) => updateFields({ confirmPassword: event.target.value })} className="w-full border border-neutral-200 bg-neutral-50 px-4 py-3 pr-12 text-xs outline-none focus:border-[#f6c744]" placeholder="Confirm Password" />
                  </RegistrationLabel>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <RegistrationLabel label="Student Information" required>
                <input required maxLength={LIMITS.idNumber} value={formData.idNumber} onChange={(event) => updateFields({ idNumber: event.target.value })} className="w-full rounded-sm border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-black outline-none transition-all placeholder:text-neutral-300 focus:border-[#f6c744] focus:bg-white" placeholder="ID Number" />
              </RegistrationLabel>

              <RegistrationLabel label="Year Level" required>
                <select required value={formData.yearLevel} onChange={(event) => updateFields({ yearLevel: event.target.value })} className="w-full cursor-pointer appearance-none rounded-sm border border-neutral-200 bg-neutral-50 px-4 py-3 pr-10 text-xs text-black outline-none transition-all focus:border-[#f6c744] focus:bg-white">
                  <option disabled value="Select year">Select Year Level</option>
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                  <option>Faculty</option>
                </select>
              </RegistrationLabel>

              <RegistrationLabel label="College / Faculty" required>
                <div className="grid grid-cols-2 gap-2">
                  {colleges.map((college) => (
                    <button
                      key={college}
                      type="button"
                      onClick={() => updateFields({ college })}
                      className={`rounded-sm border py-3 text-[9px] font-black uppercase tracking-wider transition-all ${
                        formData.college === college
                          ? "border-black bg-[#0f0f0f] text-[#f6c744] shadow-md"
                          : "border-neutral-200 bg-neutral-50 text-neutral-400 hover:border-neutral-300 hover:bg-white"
                      }`}
                    >
                      {college}
                    </button>
                  ))}
                </div>
              </RegistrationLabel>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-4 rounded-sm border border-[#f6c744]/40 bg-[#fffdf2] p-6">
                <h3 className="border-b border-[#f6c744]/20 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#c49600]">
                  Account Summary
                </h3>
                <div className="space-y-2.5 font-inter text-[11px] text-neutral-500">
                  <SummaryRow label="Name" value={`${formData.firstName} ${formData.lastName}`} />
                  <SummaryRow label="Email" value={formData.email} breakAll />
                  <SummaryRow label="Occupation" value={formData.occupation} />
                  <SummaryRow label="Student no." value={formData.idNumber || "-"} />
                  <SummaryRow label="College" value={formData.college || "-"} />
                  <SummaryRow label="Year level" value={formData.yearLevel || "-"} />
                </div>
              </div>

              <div className="space-y-3.5 pt-2">
                <label className="group flex cursor-pointer select-none items-start gap-3">
                  <input type="checkbox" checked={certified} onChange={(event) => setCertified(event.target.checked)} className="mt-0.5 h-3.5 w-3.5 cursor-pointer rounded-sm border-neutral-300 accent-black" />
                  <span className="text-[11px] font-medium leading-relaxed text-neutral-500 transition-colors group-hover:text-neutral-800">
                    I agree to the Terms of Use and Privacy Policy of the UST Events Portal.
                  </span>
                </label>
                <label className="group flex cursor-pointer select-none items-start gap-3">
                  <input type="checkbox" defaultChecked className="mt-0.5 h-3.5 w-3.5 cursor-pointer rounded-sm border-neutral-300 accent-black" />
                  <span className="text-[11px] font-medium leading-relaxed text-neutral-500 transition-colors group-hover:text-neutral-800">
                    Send me event reminders and announcements via email.
                  </span>
                </label>
              </div>
            </div>
          )}

          {(error || success) && (
            <div className="mt-5 space-y-3">
              <p className={`text-[11px] font-semibold leading-relaxed ${error ? "text-red-600" : "text-emerald-700"}`}>
                {error || success}
              </p>
              {canResendVerification && formData.email.trim().toLowerCase().endsWith("@ust.edu.ph") && (
                <button type="button" onClick={handleResendVerification} disabled={isResending} className="text-[10px] font-black uppercase tracking-widest text-[#c49600] hover:text-black disabled:text-neutral-400">
                  {isResending ? "Sending..." : "Resend Verification Email"}
                </button>
              )}
              {success && onSwitchToLogin && (
                <button type="button" onClick={onSwitchToLogin} className="block text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-black">
                  Back to sign in
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-8 py-5">
          <button onClick={() => (step > 1 ? setStep(step - 1) : closeModal())} className="text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black">
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <button onClick={handleNext} disabled={isSubmitting || isResending || Boolean(success)} className="flex items-center gap-2 bg-[#f6c744] px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-[#e3b832] disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "Submitting..." : step === 3 ? "Complete Registration" : "Next Step"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RegistrationLabel({ label, required = false, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400">
        {label} {required && <RequiredMark />}
      </label>
      {children}
    </div>
  );
}

function RequiredMark() {
  return <span className="text-red-600">*</span>;
}

function fieldToLabel(field) {
  const labels = {
    firstName: "First name",
    lastName: "Last name",
    email: "UST email address",
    password: "Password",
    idNumber: "ID number",
  };

  return labels[field] || field;
}

function SummaryRow({ label, value, breakAll = false }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-medium text-neutral-400">{label}</span>
      <span className={`text-right font-semibold text-neutral-800 ${breakAll ? "break-all" : ""}`}>
        {value}
      </span>
    </div>
  );
}
