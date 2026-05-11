import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

export default function FilterDropdown({ label, value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={dropdownRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`flex h-10 w-full min-w-0 flex-col justify-center rounded-xl bg-gray-50 px-3 text-left transition-all duration-200 sm:h-12 ${
          isOpen ? "bg-white ring-1 ring-yellow-500" : "hover:bg-white"
        }`}
      >
        <span className="text-[8px] font-black uppercase tracking-[0.16em] text-gray-500 sm:text-[10px]">
          {label}
        </span>
        <span className="mt-0.5 flex min-w-0 items-center justify-between gap-2">
          <span className="truncate text-xs text-gray-900 sm:text-sm">
            {selectedOption?.label || "All"}
          </span>
          <FiChevronDown
            className={`shrink-0 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-yellow-600" : ""
            }`}
          />
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-50 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-xl">
          <div className="max-h-56 overflow-y-auto">
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors sm:text-sm ${
                    isSelected
                      ? "bg-black text-white"
                      : "text-gray-700 hover:bg-yellow-50 hover:text-gray-950"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
