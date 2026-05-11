export default function Pagination({ currentPage = 1, totalPages = 5 }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {pages.map((page) => (
        <button
          key={page}
          className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded border transition-all
            ${
              page === currentPage
                ? "bg-white border-yellow-500 text-yellow-600 shadow-sm"
                : "bg-white border-gray-200 text-gray-400 hover:border-gray-400"
            }`}
        >
          {page}
        </button>
      ))}
    </div>
  );
}
