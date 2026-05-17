export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      className={`mt-8 flex flex-wrap items-center justify-center gap-2 ${className}`}
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 border border-neutral-200 bg-white px-3 text-[10px] font-black uppercase tracking-widest text-neutral-500 transition-colors hover:border-[#f6c744] hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        Prev
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`h-9 min-w-9 border px-3 text-xs font-black transition-colors ${
            page === currentPage
              ? "border-[#f6c744] bg-[#f6c744] text-black"
              : "border-neutral-200 bg-white text-neutral-500 hover:border-[#f6c744] hover:text-black"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 border border-neutral-200 bg-white px-3 text-[10px] font-black uppercase tracking-widest text-neutral-500 transition-colors hover:border-[#f6c744] hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
