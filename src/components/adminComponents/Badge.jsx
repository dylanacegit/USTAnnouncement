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
      className={`px-1 py-1 text-[8px] lg:text-[10px] font-bold uppercase  ${currentStyle}`}
    >
      {children}
    </span>
  );
}
