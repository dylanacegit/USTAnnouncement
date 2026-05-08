export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  color = "text-yellow",
}) {
  return (
    <div className="bg-white py-2 px-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          {title}
        </p>
        <h3 className="text-3xl font-serif font-bold text-gray-900 mt-1">
          {value}
        </h3>
        <p className="text-[11px] text-green-600 font-medium mt-1">{subtext}</p>
      </div>
      <div className={`p-4 bg-dark rounded-lg ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  );
}
