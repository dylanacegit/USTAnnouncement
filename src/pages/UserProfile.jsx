import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiEye, FiEyeOff, FiKey, FiLogOut, FiSave, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { forgotPassword, updateCurrentUserProfile } from "../services/api";

function getInitials(user) {
  return `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`.toUpperCase() || "U";
}

function getFullName(user) {
  return `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Account";
}

function maskId(value) {
  if (!value) return "N/A";
  const text = String(value);
  if (text.length <= 3) return "***";
  return `${"*".repeat(Math.max(0, text.length - 3))}${text.slice(-3)}`;
}

export default function UserProfile() {
  const navigate = useNavigate();
  const { signOut, updateUser, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showIdNumber, setShowIdNumber] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({
    firstName: "",
    lastName: "",
    faculty: "",
    yearLevel: "",
  });

  useEffect(() => {
    if (!user) return;

    setDraft({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      faculty: user.faculty || "",
      yearLevel: user.yearLevel || "",
    });
  }, [user]);

  const occupationLabel = useMemo(() => {
    const occupation = user?.occupation || user?.role || "User";
    return occupation.charAt(0).toUpperCase() + occupation.slice(1);
  }, [user]);

  if (!user) return null;

  const handleDraftChange = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setError("");
    setSaveMessage("");
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSaveMessage("");
  };

  const handleCancel = () => {
    setDraft({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      faculty: user.faculty || "",
      yearLevel: user.yearLevel || "",
    });
    setIsEditing(false);
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setSaveMessage("");

    if (
      !draft.firstName.trim() ||
      !draft.lastName.trim() ||
      !draft.faculty.trim() ||
      (user.role !== "admin" && !draft.yearLevel.trim())
    ) {
      setError(user.role === "admin" ? "Name and college are required." : "Name, college, and year are required.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateCurrentUserProfile({
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        faculty: draft.faculty.trim(),
        yearLevel: draft.yearLevel.trim(),
      });

      updateUser(result.user);
      setIsEditing(false);
      setSaveMessage("Profile saved.");
    } catch (requestError) {
      setError(requestError.message || "Profile could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmLogout = () => {
    signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f3] px-4 py-8 font-inter text-[#070707] md:px-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c49600]">My Account</p>
          <h1 className="mt-1 font-playfair text-3xl font-bold tracking-tight text-black">Profile</h1>
        </div>

        <section className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-black text-lg font-black text-[#f6c744]">
                {getInitials(user)}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                  {occupationLabel} Account
                </p>
                <h2 className="truncate font-playfair text-2xl font-bold text-neutral-950">
                  {getFullName(user)}
                </h2>
                <p className="mt-1 break-all text-sm font-medium text-neutral-500">{user.email}</p>
              </div>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-neutral-300 px-4 text-xs font-bold text-neutral-800 transition-colors hover:border-black hover:bg-black hover:text-white"
              >
                <FiEdit2 size={15} />
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-neutral-300 px-4 text-xs font-bold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                <FiX size={15} />
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField
                label="First Name"
                value={draft.firstName}
                readOnly={!isEditing}
                onChange={(value) => handleDraftChange("firstName", value)}
              />
              <ProfileField
                label="Last Name"
                value={draft.lastName}
                readOnly={!isEditing}
                onChange={(value) => handleDraftChange("lastName", value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ReadOnlyField label="Email Address" value={user.email || "N/A"} />
              <ReadOnlyField
                label="ID Number"
                value={showIdNumber ? user.studentOrEmployeeNumber || "N/A" : maskId(user.studentOrEmployeeNumber)}
                action={
                  <button
                    type="button"
                    onClick={() => setShowIdNumber((current) => !current)}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-neutral-200 px-2 text-[11px] font-bold text-neutral-600 transition-colors hover:border-[#c49600] hover:text-[#c49600]"
                  >
                    {showIdNumber ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                    {showIdNumber ? "Hide" : "Show"}
                  </button>
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <ReadOnlyField label="Occupation" value={occupationLabel} />
              <ProfileField
                label="College"
                value={draft.faculty}
                readOnly={!isEditing}
                onChange={(value) => handleDraftChange("faculty", value)}
              />
              <ProfileField
                label="Year"
                value={draft.yearLevel}
                readOnly={!isEditing}
                onChange={(value) => handleDraftChange("yearLevel", value)}
              />
            </div>

            {(error || saveMessage) && (
              <p className={`text-sm font-semibold ${error ? "text-red-600" : "text-emerald-700"}`}>
                {error || saveMessage}
              </p>
            )}

            {isEditing && (
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-bold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSave size={16} />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </form>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-[#c49600]"
          >
            <span>
              <span className="block text-sm font-bold text-neutral-950">Change password</span>
              <span className="mt-1 block text-xs text-neutral-500">Send a secure reset link to your UST email.</span>
            </span>
            <FiKey className="text-[#c49600]" size={20} />
          </button>

          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center justify-between rounded-lg border border-red-100 bg-white p-5 text-left shadow-sm transition-colors hover:border-red-300 hover:bg-red-50"
          >
            <span>
              <span className="block text-sm font-bold text-red-700">Log out</span>
              <span className="mt-1 block text-xs text-red-500">End this session on the current device.</span>
            </span>
            <FiLogOut className="text-red-600" size={20} />
          </button>
        </section>
      </div>

      <PasswordResetModal
        email={user.email}
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}

function ProfileField({ label, value, readOnly, onChange }) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">{label}</span>
      <input
        type="text"
        value={readOnly ? value || "N/A" : value}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-2 h-12 w-full rounded-md border px-4 text-sm outline-none transition-colors ${
          readOnly
            ? "border-neutral-100 bg-neutral-50 text-neutral-700"
            : "border-neutral-300 bg-white text-black focus:border-[#f6c744]"
        }`}
      />
    </label>
  );
}

function ReadOnlyField({ label, value, action }) {
  return (
    <div>
      <div className="flex min-h-8 items-start justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-400">{label}</span>
        {action}
      </div>
      <div className="flex min-h-12 items-center rounded-md border border-neutral-100 bg-neutral-50 px-4 text-sm font-medium text-neutral-700">
        <span className="break-all">{value}</span>
      </div>
    </div>
  );
}

function PasswordResetModal({ email, isOpen, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setMessage("");
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendReset = async () => {
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const result = await forgotPassword(email);
      setMessage(result.message || "A password reset link has been sent.");
    } catch (requestError) {
      setError(requestError.message || "Password reset email could not be sent.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 font-inter backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="bg-[#0f0f0f] p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f6c744]">Password Reset</p>
          <h2 className="mt-2 font-playfair text-2xl font-bold">Change password</h2>
          <p className="mt-2 text-sm text-neutral-400">We will send a secure reset link to your UST email.</p>
        </div>
        <div className="space-y-5 p-6">
          <ReadOnlyField label="UST Email Address" value={email || "N/A"} />

          {(error || message) && (
            <p className={`text-sm font-semibold ${error ? "text-red-600" : "text-emerald-700"}`}>
              {error || message}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md border border-neutral-300 px-4 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSendReset}
              disabled={isSubmitting || Boolean(message)}
              className="h-10 rounded-md bg-[#f6c744] px-4 text-sm font-black text-black transition-colors hover:bg-[#e3b832] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogoutConfirmModal({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 font-inter backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-600">
          <FiLogOut size={20} />
        </div>
        <h2 className="mt-4 font-playfair text-2xl font-bold text-neutral-950">Log out?</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          You will need to sign in again to access your saved account features.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-md border border-neutral-300 text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-md bg-red-600 text-sm font-bold text-white transition-colors hover:bg-red-700"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
