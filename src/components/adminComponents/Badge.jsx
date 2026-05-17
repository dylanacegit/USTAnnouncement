export default function Badge({ children, type, variant = "default" }) {
  const baseStyle =
    "px-1 py-1 text-[8px] lg:text-[10px] font-bold uppercase";
  const neutralStyle = "bg-gray-100 text-gray-700";

  const styles = {
    academic: "bg-yellow-100 text-yellow-700",
    sports: "bg-blue-100 text-blue-700",
    career: "bg-purple-100 text-purple-700",
    published: "bg-green-100 text-green-700",
    archived: "bg-gray-100 text-gray-700",
  };
  const roleStyles = {
    admin: "bg-red-100 text-red-700",
    user: "bg-green-100 text-green-700",
  };

  const normalizedType = type?.toLowerCase();
  const currentStyle =
    variant === "neutral"
      ? neutralStyle
      : variant === "role"
        ? roleStyles[normalizedType] || neutralStyle
        : styles[normalizedType] || neutralStyle;

  return (
    <span className={`${baseStyle} ${currentStyle}`}>
      {children}
    </span>
  );
}
