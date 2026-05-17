import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { resetPassword } from "../services/api";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await resetPassword(token, password);
      setMessage(result.message || "Password updated successfully. You can now sign in.");
      setPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(requestError.message || "Password reset failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070707] px-4 py-24 text-white">
      <div className="mx-auto max-w-md bg-white p-8 text-black">
        <img src="/images/Logo 2.svg" alt="UST Logo" className="mx-auto mb-5 h-14 w-14 object-contain" />
        <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-[#c49600]">Password Reset</p>
        <h1 className="text-center font-playfair text-2xl font-bold">Golden Gatherings</h1>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-[#f6c744]"
            placeholder="New password"
          />
          <input
            required
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none focus:border-[#f6c744]"
            placeholder="Confirm password"
          />

          {(error || message) && (
            <p className={`text-sm font-semibold ${error ? "text-red-600" : "text-emerald-700"}`}>
              {error || message}
            </p>
          )}

          <button type="submit" disabled={isSubmitting || Boolean(message)} className="w-full bg-[#f6c744] px-7 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-[#e3b832] disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>

        <Link to="/" className="mt-6 block text-center text-[10px] font-black uppercase tracking-[0.2em] text-[#c49600]">
          Return Home
        </Link>
      </div>
    </div>
  );
}
