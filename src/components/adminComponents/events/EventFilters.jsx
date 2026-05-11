export default function EventFilters({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  categoryOptions,
  venueFilter,
  setVenueFilter,
  venueOptions,
  sortBy,
  setSortBy,
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white/70 p-2 shadow-sm ring-1 ring-gray-200/80 backdrop-blur lg:flex-row lg:items-center lg:justify-between lg:p-3">
      <div className="flex h-10 w-full items-center rounded-xl bg-gray-50 px-3 transition-colors focus-within:bg-white focus-within:ring-1 focus-within:ring-yellow-500 sm:h-12 sm:px-4 lg:max-w-xl">
        <input
          type="text"
          placeholder="Search events, venue, category"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="h-full w-full bg-transparent text-xs text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <FilterSelect
          label="Category"
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categoryOptions}
        />
        <FilterSelect
          label="Venue"
          value={venueFilter}
          onChange={setVenueFilter}
          options={venueOptions}
        />
        <div className="flex h-10 min-w-0 flex-col justify-center rounded-xl bg-gray-50 px-3 transition-colors focus-within:bg-white focus-within:ring-1 focus-within:ring-yellow-500 sm:h-12">
          <label className="text-[8px] font-black uppercase tracking-[0.16em] text-gray-500 sm:text-[10px]">
            Sort
          </label>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-5 w-full min-w-0 appearance-none border-0 bg-transparent p-0 text-xs text-gray-900 outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 sm:text-sm"
          >
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex h-10 min-w-0 flex-col justify-center rounded-xl bg-gray-50 px-3 transition-colors focus-within:bg-white focus-within:ring-1 focus-within:ring-yellow-500 sm:h-12">
      <label className="text-[8px] font-black uppercase tracking-[0.16em] text-gray-500 sm:text-[10px]">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-5 w-full min-w-0 appearance-none border-0 bg-transparent p-0 text-xs text-gray-900 outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 sm:text-sm"
      >
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
