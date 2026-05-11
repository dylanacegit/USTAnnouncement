import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Link } from "react-router-dom";

export default function QuickActions({
  title,
  description,
  icon: Icon,
  to,
  color = "text-yellow",
}) {
  const content = (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-yellow-50 ${color}`}
        >
          <Icon size={19} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-[0.08em] text-gray-950">
            {title}
          </p>
          {description && (
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>

      <MdOutlineKeyboardArrowRight
        size={20}
        className="shrink-0 text-gray-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-yellow-600"
      />
    </>
  );

  const className =
    "group flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-yellow-300 hover:bg-yellow-50/40 hover:shadow-md";

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className}>
      {content}
    </button>
  );
}
