import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UserProfile() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#070707] p-4 font-inter text-white">
      <div className="w-full max-w-[500px] space-y-8 rounded-sm border border-white/10 bg-[#0d0d0d] p-8 shadow-xl">
        <div className="flex items-center gap-5 border-b border-white/5 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f6c744] text-2xl font-black text-black shadow-inner">
            {user.firstName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="font-playfair text-2xl font-bold tracking-tight text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f6c744]">
              Verified {user.role || user.occupation || "Thomasian"} Account
            </p>
          </div>
        </div>

        <div className="space-y-3.5 rounded-sm border border-[#f6c744]/40 bg-[#fffdf2] p-6 text-black">
          <h3 className="border-b border-[#f6c744]/20 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#c49600]">
            Thomasian Information Profile
          </h3>

          <div className="space-y-2.5 text-[11px] text-neutral-500">
            <ProfileRow label="Email Address" value={user.email} breakAll />
            <ProfileRow
              label="Student/Faculty ID"
              value={user.idNumber || user.studentOrEmployeeNumber}
            />
            <ProfileRow
              label="College Department"
              value={user.college || user.faculty}
            />
            <ProfileRow label="Year Classification" value={user.yearLevel} />
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full rounded-sm border border-red-500/20 bg-red-950/40 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-900/40 active:scale-[0.99]"
        >
          Disconnect Account (Logout)
        </button>
      </div>
    </div>
  );
}

function ProfileRow({ label, value, breakAll = false }) {
  if (!value) return null;

  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-medium text-neutral-400">{label}</span>
      <span
        className={`text-right font-semibold text-neutral-800 ${
          breakAll ? "break-all" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
