import {
  IoArchiveOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";

export default function EventStats({ events }) {
  const publishedEvents = events.filter(
    (event) => event.status?.toLowerCase() !== "archived"
  );
  const archivedEvents = events.filter(
    (event) => event.status?.toLowerCase() === "archived"
  );
  const upcomingEvents = publishedEvents.filter((event) => {
    const date = new Date(event.startDate || event.date);
    return !Number.isNaN(date.valueOf()) && date >= new Date();
  });

  const stats = [
    {
      title: "Published Events",
      value: publishedEvents.length,
      subtext: "Visible to users",
      icon: IoCheckmarkCircleOutline,
    },
    {
      title: "Archived Events",
      value: archivedEvents.length,
      subtext: "Hidden from active list",
      icon: IoArchiveOutline,
    },
    {
      title: "Upcoming Events",
      value: upcomingEvents.length,
      subtext: "Scheduled ahead",
      icon: IoCalendarOutline,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3 xl:gap-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            key={stat.title}
            className="group flex min-h-24 flex-col justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-yellow-400 hover:shadow-lg active:translate-y-0 sm:min-h-32 sm:flex-row sm:items-center sm:p-6"
          >
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase leading-tight tracking-[0.12em] text-gray-500 sm:text-[10px] sm:tracking-[0.18em]">
                {stat.title}
              </p>
              <p className="mt-2 font-playfair text-2xl font-bold leading-none text-gray-950 sm:mt-3 sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 line-clamp-2 text-[10px] font-bold leading-tight text-green-600 sm:mt-3 sm:text-sm">
                {stat.subtext}
              </p>
            </div>

            <div className="mt-2 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-black text-yellow-400 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] sm:ml-4 sm:mt-0 sm:h-14 sm:w-14">
              <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
          </article>
        );
      })}
    </div>
  );
}
