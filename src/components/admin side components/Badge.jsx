export default function Badge({ children, type }) {
  const styles = {
    academic: "bg-yellow-100 text-yellow-700",
    sports: "bg-blue-100 text-blue-700",
    career: "bg-purple-100 text-purple-700",
    published: "bg-green-100 text-green-700",
    archived: "bg-gray-100 text-gray-700",
  };

  const currentStyle = styles[type?.toLowerCase()] || styles.archived;

  return (
    <span
      className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${currentStyle}`}
    >
      {children}
    </span>
  );
}
