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
        <p className="text-xs md:text-[8px] lg:text-xs font-bold text-dark uppercase ">
          {title}
        </p>
      </div>

      <MdOutlineKeyboardArrowRight size={20} />
    </div>
  );
}
