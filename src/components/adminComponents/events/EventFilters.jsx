import FilterDropdown from "../FilterDropdown";

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
  const categoryItems = [
    { value: "all", label: "All" },
    ...categoryOptions.map((category) => ({
      value: category,
      label: category,
    })),
  ];

  const venueItems = [
    { value: "all", label: "All" },
    ...venueOptions.map((venue) => ({
      value: venue,
      label: venue,
    })),
  ];

  const sortItems = [
    { value: "az", label: "A-Z" },
    { value: "za", label: "Z-A" },
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
  ];

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white/70 p-2 shadow-sm ring-1 ring-gray-200/80 backdrop-blur lg:flex-row lg:items-center lg:justify-between lg:p-3">
      <div className="flex h-10 w-full items-center rounded-xl bg-gray-50 px-3 transition-colors focus-within:bg-white focus-within:ring-1 focus-within:ring-yellow-500 sm:h-12 sm:px-4 lg:max-w-xl">
        <input
          type="text"
          maxLength={80}
          placeholder="Search events, venue, category"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="h-full w-full bg-transparent text-xs text-gray-900 outline-none placeholder:text-gray-400 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <FilterDropdown
          label="Category"
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categoryItems}
        />
        <FilterDropdown
          label="Venue"
          value={venueFilter}
          onChange={setVenueFilter}
          options={venueItems}
        />
        <FilterDropdown
          label="Sort"
          value={sortBy}
          onChange={setSortBy}
          options={sortItems}
        />
      </div>
    </div>
  );
}
