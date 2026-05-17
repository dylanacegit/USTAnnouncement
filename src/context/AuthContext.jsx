/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { addBookmark, getBookmarks, removeBookmark } from "../services/api";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("authUser");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [user, setUser] = useState(readStoredUser);
  const [bookmarkIds, setBookmarkIds] = useState(() => user?.bookmarkedEventIds || []);

  useEffect(() => {
    let ignore = false;

    async function loadBookmarks() {
      if (!token || !user) {
        setBookmarkIds([]);
        return;
      }

      try {
        const data = await getBookmarks();
        if (!ignore) setBookmarkIds(data.eventIds || []);
      } catch (error) {
        console.error("Failed to load bookmarks:", error);
        if (!ignore) setBookmarkIds(user.bookmarkedEventIds || []);
      }
    }

    loadBookmarks();

    return () => {
      ignore = true;
    };
  }, [token, user]);

  const signIn = (nextToken, nextUser) => {
    localStorage.setItem("authToken", nextToken);
    localStorage.setItem("authUser", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
    setBookmarkIds(nextUser?.bookmarkedEventIds || []);
  };

  const signOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setToken(null);
    setUser(null);
    setBookmarkIds([]);
  };

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);

    if (nextUser) {
      localStorage.setItem("authUser", JSON.stringify(nextUser));
      setBookmarkIds(nextUser.bookmarkedEventIds || []);
    } else {
      localStorage.removeItem("authUser");
      setBookmarkIds([]);
    }
  }, []);

  const isBookmarked = useCallback((eventId) => {
    return bookmarkIds.includes(eventId);
  }, [bookmarkIds]);

  const toggleBookmark = useCallback(async (eventId) => {
    if (!token || !user) {
      throw new Error("Please sign in to bookmark events.");
    }

    const data = bookmarkIds.includes(eventId)
      ? await removeBookmark(eventId)
      : await addBookmark(eventId);

    setBookmarkIds(data.eventIds || []);
    setUser((current) => {
      if (!current) return current;

      const nextUser = { ...current, bookmarkedEventIds: data.eventIds || [] };
      localStorage.setItem("authUser", JSON.stringify(nextUser));
      return nextUser;
    });
  }, [bookmarkIds, token, user]);

  const value = useMemo(
    () => ({
      bookmarkIds,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === "admin",
      isBookmarked,
      signIn,
      signOut,
      token,
      toggleBookmark,
      updateUser,
      user,
    }),
    [bookmarkIds, isBookmarked, toggleBookmark, token, updateUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
