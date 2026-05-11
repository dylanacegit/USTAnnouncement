import { IoMdClose } from "react-icons/io";
import {
  CiCalendar,
  CiClock2,
  CiLocationOn,
  CiUser,
  CiGrid41,
} from "react-icons/ci";

export default function EventModal({ isOpen, onClose, event }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-3xl rounded-sm overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-dark text-white px-6 py-3 flex justify-between items-center">
          <h2 className="font-serif text-lg tracking-wide">
            Detailed Event Information
          </h2>
          <button
            onClick={onClose}
            className="hover:text-yellow-500 transition-colors"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <div className="p-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">
            {event.title}
          </h1>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <InfoItem icon={CiCalendar} label="DATE" value={event.date} />
            <InfoItem icon={CiClock2} label="TIME" value="9AM-6PM" />
            <InfoItem icon={CiLocationOn} label="VENUE" value={event.venue} />
            <InfoItem
              icon={CiUser}
              label="ORGANIZED BY"
              value={event.organizer}
            />
            <InfoItem icon={CiGrid41} label="CATEGORY" value={event.category} />
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <img
              src="/images/placeholder-event.jpg"
              alt="Event"
              className="w-full md:w-1/2 h-64 object-cover rounded shadow-md"
            />
            <div className="flex-1">
              <p className="text-gray-600 text-sm leading-relaxed">
                {event.description}
              </p>

              <div className="mt-12 pt-4 border-t border-gray-100 flex justify-between items-end text-[10px] text-gray-400 uppercase font-bold tracking-widest">
                <div>
                  <p>
                    Created by {event.createdBy} on {event.createdAt}
                  </p>
                  <p>
                    Updated by {event.createdBy} on {event.updatedAt}
                  </p>
                </div>
                <button className="bg-yellow-50 text-yellow-700 px-4 py-1 border border-yellow-200 rounded hover:bg-yellow-100">
                  EDIT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-yellow-600">
        <div className="p-1.5 bg-yellow-100 rounded text-yellow-700">
          <Icon size={16} />
        </div>
        <span className="text-[9px] font-black tracking-tighter text-gray-500 uppercase">
          {label}
        </span>
      </div>
      <p className="text-[10px] font-bold text-gray-800 leading-none ml-8">
        {value}
      </p>
    </div>
  );
}
