import { IoMdClose } from "react-icons/io";
import {
  IoCalendarOutline,
  IoGridOutline,
  IoImageOutline,
  IoMegaphoneOutline,
  IoPersonOutline,
} from "react-icons/io5";

export default function AnnouncementModal({ isOpen, onClose, announcement }) {
  if (!isOpen) return null;

  const image = announcement.image || announcement.imageUrl || announcement.bannerImage;
  const body =
    announcement.content || announcement.caption || "No content provided.";

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
          aria-label="Close announcement details"
        >
          <IoMdClose size={20} />
        </button>

        <div className="grid lg:grid-cols-[1fr_1.05fr]">
          <div className="bg-black p-4 sm:p-5">
            {image ? (
              <img
                src={image}
                alt={announcement.title}
                className="h-64 w-full rounded-xl object-cover lg:h-full"
              />
            ) : (
              <div className="grid h-64 w-full place-items-center rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-700 lg:h-full">
                <div className="text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-yellow-400 text-black">
                    <IoImageOutline size={30} />
                  </div>
                  <p className="mt-4 font-playfair text-2xl font-bold text-white">
                    Media Preview
                  </p>
                  <p className="mt-2 max-w-48 text-xs leading-5 text-white/50">
                    Uploaded announcement images will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-yellow-600">
              {announcement.category || announcement.type || "Announcement"}
            </p>

            <h1 className="mt-3 font-playfair text-3xl font-bold leading-tight text-gray-950 sm:text-4xl">
              {announcement.title}
            </h1>

            <p className="mt-3 text-sm font-medium text-gray-500">
              {announcement.eventTitle || "General announcement"}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <InfoItem
                icon={IoMegaphoneOutline}
                label="Type"
                value={announcement.type || "General"}
              />
              <InfoItem
                icon={IoGridOutline}
                label="Category"
                value={announcement.category || "N/A"}
              />
              <InfoItem
                icon={IoPersonOutline}
                label="Created By"
                value={announcement.createdBy || "System"}
              />
              <InfoItem
                icon={IoCalendarOutline}
                label="Created At"
                value={formatDate(announcement.createdAt)}
              />
            </div>

            <section className="mt-7 rounded-xl bg-gray-50 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                Content
              </p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-700">
                {body}
              </p>
            </section>

            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {announcement.status || "Published"}
              </span>
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
