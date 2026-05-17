const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function titleFromEmail(email) {
  if (!email) return "";

  return email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function PersonCell({ name, email, fallback = "System" }) {
  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim() : "";
  const nameLooksLikeEmail = EMAIL_PATTERN.test(cleanName);
  const displayName =
    !cleanName || nameLooksLikeEmail
      ? titleFromEmail(cleanEmail || cleanName) || fallback
      : cleanName;
  const displayEmail = cleanEmail || (nameLooksLikeEmail ? cleanName : "");

  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold leading-tight text-gray-800">
        {displayName}
      </p>
      {displayEmail && (
        <p className="mt-0.5 truncate text-[11px] font-medium leading-tight text-gray-400">
          {displayEmail}
        </p>
      )}
    </div>
  );
}
