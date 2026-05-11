import { IoMdClose } from "react-icons/io";

export default function AnnouncementModal({ isOpen, onClose, announcement }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <article className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        <header className="flex items-center justify-between bg-black px-5 py-4 text-white">
          <h2 className="font-playfair text-lg font-bold">
            Announcement Details
          </h2>
          <button onClick={onClose} className="text-white hover:text-yellow-400">
            <IoMdClose size={22} />
          </button>
        </header>

        <div className="p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-600">
            {announcement.category || announcement.type || "Announcement"}
          </p>
          <h1 className="mt-2 font-playfair text-2xl font-bold text-gray-950">
            {announcement.title}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {announcement.eventTitle || "General announcement"}
          </p>
          <p className="mt-5 text-sm leading-7 text-gray-700">
            {announcement.content || announcement.caption || "No content provided."}
          </p>
        </div>
      </article>
    </div>
  );
}
