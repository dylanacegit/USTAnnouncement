import { MdOutlineKeyboardArrowRight } from "react-icons/md";

export default function QuickActions({
  title,
  icon: Icon,
  color = "text-yellow",
}) {
  return (
    <div className=" flex items-center justify-between p-3  rounded-lg cursor-pointer hover:bg-[#FFF1B8] transition-colors">
      <div className="flex gap-2 items-center">
        <div className={`p-2 bg-[#FFFBE8] rounded-lg ${color}`}>
          <Icon size={20} />
        </div>
        <p className="text-sm font-bold text-dark uppercase tracking-widest">
          {title}
        </p>
      </div>

      <MdOutlineKeyboardArrowRight size={20} />
    </div>
  );
}
