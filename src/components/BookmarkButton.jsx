import { IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { useAuth } from "../context/AuthContext";

export default function BookmarkButton({ eventId, className = "", size = 18 }) {
  const { isAuthenticated, isBookmarked, toggleBookmark } = useAuth();
  const bookmarked = eventId ? isBookmarked(eventId) : false;

  const handleClick = async (event) => {
    event.stopPropagation();

    if (!eventId) return;

    if (!isAuthenticated) {
      window.alert("Please sign in to bookmark events.");
      return;
    }

    try {
      await toggleBookmark(eventId);
    } catch (error) {
      window.alert(error.message || "Bookmark could not be updated.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`grid h-9 w-9 place-items-center border border-black/10 bg-white text-black shadow-sm transition-colors hover:border-[#f6c744] hover:text-[#c49600] ${bookmarked ? "text-[#c49600]" : ""} ${className}`}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark event"}
      title={bookmarked ? "Remove bookmark" : "Bookmark event"}
    >
      {bookmarked ? <IoBookmark size={size} /> : <IoBookmarkOutline size={size} />}
    </button>
  );
}
