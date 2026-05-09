export default function FilterBar() {
  return (
    <div className="flex flex-wrap sm:flex-nowrap  items-center gap-2 sm:gap-4 bg-gray-50/50 sm:p-4 rounded-lg mb-6 border border-gray-100">
      {/* Search Input */}
      <div className="w-full sm:w-auto  ">
        <input
          type="text"
          placeholder="Search events, venue, category etc."
          className="w-full md:max-w-lg bg-white border-b border-gray-300 py-2 px-1 text-sm focus:outline-none focus:border-dark transition-colors"
        />
      </div>

      {/* Dropdowns */}
      <div className=" flex w-full justify-evenly sm:justify-start  items-center sm:gap-4 text-sm text-gray-600 ">
        <div className="flex flex-col sm:flex-row items-center sm:gap-2">
          <span className="text-[10px]">Sort By</span>
          <select className="border border-gray-300 rounded sm:px-2 py-1 bg-white focus:outline-none">
            <option>A-Z</option>
            <option>Recent</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:gap-2">
          <span className="text-[10px]">Category</span>
          <select className="border border-gray-300 rounded sm:px-2 py-1 bg-white focus:outline-none">
            <option>All</option>
            <option>Academic</option>
            <option>Sports</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:gap-2">
          <span className="text-[10px]">Venue</span>
          <select className="border border-gray-300 rounded sm:px-2 py-1 bg-white focus:outline-none">
            <option>All</option>
            <option>Main Bldg</option>
            <option>TARC</option>
          </select>
        </div>
      </div>
    </div>
  );
}
