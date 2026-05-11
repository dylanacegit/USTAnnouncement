export default function FilterBar({ search, filters = [] }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Search — only renders if configured */}
      {search && (
        <input
          type="text"
          placeholder={search.placeholder || "Search..."}
          value={search.value}
          onChange={(e) => search.onChange(e.target.value)}
          className="w-full sm:w-80 bg-white border border-gray-300 px-4 py-2 text-sm rounded-md focus:outline-none focus:border-yellow-500"
        />
      )}

      {/* Filters — one <select> per filter config */}
      <div className="flex items-center gap-4 flex-wrap">
        {filters.map((filter) => (
          <div key={filter.key} className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
              {filter.label}
            </label>

            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="bg-white border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:border-yellow-500"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
