import { IoMdClose } from "react-icons/io";
import {
  CiCalendar,
  CiClock2,
  CiGrid41,
  CiLocationOn,
  CiUser,
} from "react-icons/ci";
import PersonCell from "../PersonCell";

export default function EventModal({ isOpen, onClose, event }) {
  if (!isOpen) return null;

  const venue = event.location || event.venue || "No venue provided";
  const organizer = event.organizer || event.organizedBy || "No organizer";
  const image = event.image || event.bannerImage;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />

      <article className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-black text-white transition-colors hover:bg-yellow-500 hover:text-black"
          aria-label="Close event details"
        >
          <IoMdClose size={20} />
        </button>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="min-h-64 bg-black p-4 text-white sm:p-5">
            {image ? (
              <img
                src={image}
                alt={event.title}
                className="h-64 w-full rounded-xl object-cover lg:h-full"
              />
            ) : (
              <div className="grid h-64 w-full place-items-center rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-700 lg:h-full">
                <div className="text-center">
                  <p className="font-playfair text-5xl font-bold text-yellow-400">
                    {(event.title || "E").slice(0, 1)}
                  </p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-white/50">
                    Event Preview
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-7">
            <div className="max-w-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-yellow-600">
                {event.category || "Event"}
              </p>
              <h1 className="mt-3 font-playfair text-3xl font-bold leading-tight text-gray-950 sm:text-4xl">
                {event.title}
              </h1>
              <p className="mt-4 text-sm leading-7 text-gray-600">
                {event.description || "No event description has been provided."}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <InfoItem icon={CiCalendar} label="Date" value={formatDateRange(event)} />
              <InfoItem icon={CiClock2} label="Schedule" value={getScheduleLength(event)} />
              <InfoItem icon={CiLocationOn} label="Venue" value={venue} />
              <InfoItem icon={CiGrid41} label="Category" value={event.category || "N/A"} />
              <InfoItem icon={CiUser} label="Organizer" value={organizer} />
              <InfoItem icon={CiClock2} label="Time" value={formatTime(event)} />
            </div>

            <div className="mt-7 rounded-xl bg-gray-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                Record
              </p>
              <div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
                <Meta
                  label="Created By"
                  value={
                    <PersonCell
                      name={event.createdBy || "System"}
                      email={event.createdByEmail}
                    />
                  }
                />
                <Meta label="Created At" value={formatDate(event.createdAt)} />
                <Meta
                  label="Updated By"
                  value={
                    <PersonCell
                      name={event.updatedBy || event.createdBy || "System"}
                      email={event.updatedByEmail || event.createdByEmail}
                    />
                  }
                />
                <Meta label="Updated At" value={formatDate(event.updatedAt)} />
                <Meta label="Status" value={event.status || "Published"} />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button className="h-9 rounded-lg border border-yellow-500 px-5 text-xs font-black uppercase tracking-[0.14em] text-yellow-700 transition-colors hover:bg-yellow-50">
                Edit
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 text-yellow-600">
        <Icon size={17} />
        <span className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400">
          {label}
        </span>
      </div>
      <p className="mt-2 text-xs font-bold leading-snug text-gray-900">
        {value}
      </p>
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <span className="font-bold text-gray-400">{label}</span>
      <div className="mt-0.5 font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "N/A";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.valueOf())) return String(date);
  return parsed.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateRange(event) {
  const start = formatDate(event.startDate || event.date);
  const endDate = event.endDate;

  if (!endDate || endDate === event.startDate || endDate === event.date) {
    return start;
  }

  return `${start} - ${formatDate(endDate)}`;
}

function formatTime(event) {
  if (event.startTime && event.endTime) return `${event.startTime} - ${event.endTime}`;
  return event.startTime || event.time || "No time provided";
}

function getScheduleLength(event) {
  const start = new Date(event.startDate || event.date);
  const end = new Date(event.endDate || event.startDate || event.date);

  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
    return "N/A";
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const days = Math.max(
    1,
    Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
  );

  return `${days} ${days === 1 ? "day" : "days"}`;
}
