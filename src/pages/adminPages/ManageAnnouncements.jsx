import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AnnouncementFilters from "../../components/adminComponents/announcements/AnnouncementFilters";
import AnnouncementFormModal from "../../components/adminComponents/announcements/AnnouncementFormModal";
import AnnouncementModal from "../../components/adminComponents/announcements/AnnouncementModal";
import AnnouncementStats from "../../components/adminComponents/announcements/AnnouncementStats";
import AnnouncementsTable from "../../components/adminComponents/announcements/AnnouncementsTable";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  updateAnnouncementStatus,
} from "../../services/api";

const ANNOUNCEMENTS_PER_PAGE = 10;
const CURRENT_ADMIN_NAME = "Admin";

export default function ManageAnnouncements() {
  const location = useLocation();
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState("published");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("az");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await getAnnouncements();
        setAnnouncements(
          Array.isArray(data) ? data : data.announcements || []
        );
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search") || "";
    const tab = params.get("tab");

    if (["published", "archived"].includes(tab)) {
      setActiveTab(tab);
    }

    if (params.get("action") === "create") {
      setIsCreateModalOpen(true);
    }

    setSearchTerm(query);
  }, [location.search]);

  const announcementsForActiveTab = useMemo(() => {
    return announcements.filter((announcement) => {
      const status = announcement.status?.toLowerCase();
      return activeTab === "archived"
        ? status === "archived"
        : status !== "archived";
    });
  }, [announcements, activeTab]);

  const typeOptions = useMemo(() => {
    return uniqueOptions(announcementsForActiveTab, (item) => item.type);
  }, [announcementsForActiveTab]);

  const categoryOptions = useMemo(() => {
    return uniqueOptions(announcementsForActiveTab, (item) => item.category);
  }, [announcementsForActiveTab]);

  useEffect(() => {
    if (typeFilter !== "all" && !typeOptions.includes(typeFilter)) {
      setTypeFilter("all");
    }
  }, [typeFilter, typeOptions]);

  useEffect(() => {
    if (categoryFilter !== "all" && !categoryOptions.includes(categoryFilter)) {
      setCategoryFilter("all");
    }
  }, [categoryFilter, categoryOptions]);

  const handleToggleArchive = async (announcement) => {
    const nextStatus =
      announcement.status?.toLowerCase() === "archived"
        ? "published"
        : "archived";
    const updatedAnnouncement = await updateAnnouncementStatus(
      announcement._id,
      nextStatus
    );

    setAnnouncements((current) =>
      current.map((item) =>
        item._id === announcement._id
          ? { ...item, ...updatedAnnouncement }
          : item
      )
    );
  };

  const handleCreateAnnouncement = async (announcementData) => {
    const createdAnnouncement = await createAnnouncement({
      ...announcementData,
      createdBy: CURRENT_ADMIN_NAME,
    });

    setAnnouncements((current) => [createdAnnouncement, ...current]);
    setActiveTab("published");
    setSelectedAnnouncement(createdAnnouncement);
  };

  const handleUpdateAnnouncement = async (announcementData) => {
    const updatedAnnouncement = await updateAnnouncement(
      editingAnnouncement._id,
      {
        ...announcementData,
        updatedBy: CURRENT_ADMIN_NAME,
      }
    );

    setAnnouncements((current) =>
      current.map((item) =>
        item._id === updatedAnnouncement._id
          ? { ...item, ...updatedAnnouncement }
          : item
      )
    );
    setSelectedAnnouncement((current) =>
      current?._id === updatedAnnouncement._id
        ? { ...current, ...updatedAnnouncement }
        : current
    );
    setEditingAnnouncement(null);
  };

  const handleDeleteAnnouncement = async (announcement) => {
    await deleteAnnouncement(announcement._id);

    setAnnouncements((current) =>
      current.filter((item) => item._id !== announcement._id)
    );
    setSelectedAnnouncement((current) =>
      current?._id === announcement._id ? null : current
    );
  };

  const filteredAnnouncements = useMemo(() => {
    let result = [...announcementsForActiveTab];

    if (searchTerm.trim()) {
      const keyword = searchTerm.toLowerCase();
      result = result.filter((announcement) => {
        return (
          announcement.title?.toLowerCase().includes(keyword) ||
          announcement.eventTitle?.toLowerCase().includes(keyword) ||
          announcement.category?.toLowerCase().includes(keyword) ||
          announcement.type?.toLowerCase().includes(keyword) ||
          announcement.caption?.toLowerCase().includes(keyword) ||
          announcement.content?.toLowerCase().includes(keyword) ||
          announcement.createdBy?.toLowerCase().includes(keyword)
        );
      });
    }

    if (typeFilter !== "all") {
      result = result.filter((announcement) => announcement.type === typeFilter);
    }

    if (categoryFilter !== "all") {
      result = result.filter(
        (announcement) => announcement.category === categoryFilter
      );
    }

    result.sort((a, b) => {
      const titleA = a.title?.toLowerCase() || "";
      const titleB = b.title?.toLowerCase() || "";
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      if (sortBy === "az") return titleA.localeCompare(titleB);
      if (sortBy === "za") return titleB.localeCompare(titleA);
      if (sortBy === "newest") return dateB - dateA;
      if (sortBy === "oldest") return dateA - dateB;
      return 0;
    });

    return result;
  }, [
    announcementsForActiveTab,
    searchTerm,
    typeFilter,
    categoryFilter,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAnnouncements.length / ANNOUNCEMENTS_PER_PAGE)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, typeFilter, categoryFilter, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedAnnouncements = useMemo(() => {
    const start = (currentPage - 1) * ANNOUNCEMENTS_PER_PAGE;
    return filteredAnnouncements.slice(
      start,
      start + ANNOUNCEMENTS_PER_PAGE
    );
  }, [filteredAnnouncements, currentPage]);

  return (
    <div className="mx-auto max-w-[1800px] space-y-5 sm:space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-gray-950 sm:text-3xl">
          Manage Announcements
        </h1>
        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          View, search, and manage published announcements.
        </p>
      </div>

      <AnnouncementStats announcements={announcements} />

      <AnnouncementFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        typeOptions={typeOptions}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categoryOptions={categoryOptions}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <AnnouncementsTable
        announcements={paginatedAnnouncements}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loading={loading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalAnnouncements={filteredAnnouncements.length}
        totalPages={totalPages}
        pageSize={ANNOUNCEMENTS_PER_PAGE}
        onToggleArchive={handleToggleArchive}
        onDeleteAnnouncement={handleDeleteAnnouncement}
        onViewAnnouncement={setSelectedAnnouncement}
        onEditAnnouncement={setEditingAnnouncement}
        onCreateAnnouncement={() => setIsCreateModalOpen(true)}
      />

      <AnnouncementFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateAnnouncement}
      />

      <AnnouncementFormModal
        key={editingAnnouncement?._id || "announcement-edit"}
        isOpen={Boolean(editingAnnouncement)}
        onClose={() => setEditingAnnouncement(null)}
        onUpdate={handleUpdateAnnouncement}
        announcement={editingAnnouncement}
        mode="edit"
      />

      <AnnouncementModal
        isOpen={Boolean(selectedAnnouncement)}
        onClose={() => setSelectedAnnouncement(null)}
        announcement={selectedAnnouncement || {}}
      />
    </div>
  );
}

function uniqueOptions(items, getValue) {
  return Array.from(
    new Set(items.map((item) => getValue(item)?.trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
}
