export default function AccountFilters({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <input
        type="text"
        placeholder="Search name or email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full sm:w-80 bg-white border border-gray-300 px-4 py-2 text-sm rounded-md focus:outline-none focus:border-yellow-500"
      />

      <div className="flex items-center gap-2">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Sort By
        </label>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white border border-gray-300 px-3 py-2 text-sm rounded-md focus:outline-none focus:border-yellow-500"
        >
          <option value="az">A-Z</option>
          <option value="za">Z-A</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </div>
  );
}