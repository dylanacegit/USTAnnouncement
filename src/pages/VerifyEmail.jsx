import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { verifyEmail } from "../services/api";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your UST email address...");

  useEffect(() => {
    async function verify() {
      try {
        const result = await verifyEmail(token);
        setStatus("success");
        setMessage(result.message || "Email verified successfully. You can now sign in.");
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "Verification link is invalid or expired.");
      }
    }

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#070707] px-4 py-24 text-white">
      <div className="mx-auto max-w-md border border-white/10 bg-white p-8 text-center text-black">
        <img src="/images/Logo 2.svg" alt="UST Logo" className="mx-auto mb-5 h-14 w-14 object-contain" />
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#c49600]">
          {status === "loading" ? "Please wait" : status === "success" ? "Verified" : "Verification failed"}
        </p>
        <h1 className="font-playfair text-2xl font-bold">Golden Gatherings</h1>
        <p className="mt-4 text-sm leading-6 text-neutral-600">{message}</p>
        <Link
          to="/"
          className="mt-7 inline-flex bg-[#f6c744] px-7 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-[#e3b832]"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
