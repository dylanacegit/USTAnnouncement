import { useState } from "react";
import AdminTable from "../AdminTable";
import Badge from "../Badge";

export default function AccountsTable({
  accounts,
  activeTab,
  setActiveTab,
  loading,
  currentPage,
  setCurrentPage,
  totalAccounts,
  totalPages,
  pageSize,
  onToggleArchive,
  onUpdateDepartment,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [departmentDraft, setDepartmentDraft] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [formError, setFormError] = useState("");

  const baseHeaders = [
    "Name",
    "Email",
    "Department",
    "Role",
    "Created By",
    "Created At",
  ];
  const tableHeaders = isEditing ? [...baseHeaders, "Actions"] : baseHeaders;

  const openDepartmentForm = (account) => {
    setSelectedAccount(account);
    setDepartmentDraft(account.department || "");
    setFormError("");
  };

  const closeDepartmentForm = () => {
    setSelectedAccount(null);
    setDepartmentDraft("");
    setFormError("");
  };

  const handleToggleArchive = async (account) => {
    try {
      setUpdatingId(account._id);
      setFormError("");
      await onToggleArchive(account);
      if (selectedAccount?._id === account._id) closeDepartmentForm();
    } catch (error) {
      setFormError(error.message || "Failed to update account status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDepartmentSubmit = async (event) => {
    event.preventDefault();

    const nextDepartment = departmentDraft.trim();

    if (!selectedAccount || !nextDepartment) return;

    try {
      setUpdatingId(selectedAccount._id);
      setFormError("");
      await onUpdateDepartment(selectedAccount, nextDepartment);
      closeDepartmentForm();
    } catch (error) {
      setFormError(error.message || "Failed to update department.");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-PH", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const startItem =
    totalAccounts === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalAccounts);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const PaginationControls = () => (
    <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-xs font-medium text-gray-500 sm:text-left">
        Showing {startItem}-{endItem} of {totalAccounts}
      </p>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex">
        <button
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={!canGoPrevious}
          className="h-8 rounded-md border border-gray-300 px-3 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <span className="px-2 text-center text-xs font-bold text-gray-500">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() =>
            setCurrentPage((page) => Math.min(totalPages, page + 1))
          }
          disabled={!canGoNext}
          className="h-8 rounded-md border border-gray-300 px-3 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4 lg:p-5">
      <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-full rounded-lg bg-gray-100 p-1 text-xs font-black uppercase tracking-[0.14em] sm:w-auto">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 rounded-md px-4 py-2 transition-colors sm:flex-none ${
              activeTab === "active"
                ? "bg-white text-black shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Active
          </button>

          <button
            onClick={() => setActiveTab("archived")}
            className={`flex-1 rounded-md px-4 py-2 transition-colors sm:flex-none ${
              activeTab === "archived"
                ? "bg-white text-black shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Archived
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button className="h-8 rounded-md border border-gray-700 px-3 text-xs font-bold transition-colors hover:bg-black hover:text-white sm:h-9 sm:px-4">
            Create
          </button>

          <button
            onClick={() => {
              setIsEditing((current) => !current);
              closeDepartmentForm();
            }}
            className={`h-8 rounded-md border px-3 text-xs font-bold transition-colors sm:h-9 sm:px-4 ${
              isEditing
                ? "border-gray-900 bg-black text-white hover:bg-gray-800"
                : "border-gray-700 text-black hover:bg-black hover:text-white"
            }`}
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      {isEditing && selectedAccount && (
        <form
          onSubmit={handleDepartmentSubmit}
          className="mb-3 rounded-xl border border-yellow-200 bg-yellow-50/60 p-3 sm:mb-4 sm:p-4"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-yellow-700">
                Edit Department
              </p>
              <h3 className="mt-1 text-sm font-bold text-gray-950">
                {selectedAccount.firstName} {selectedAccount.lastName}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {selectedAccount.email}
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-[minmax(220px,320px)_auto_auto] sm:items-center">
              <input
                type="text"
                value={departmentDraft}
                onChange={(e) => setDepartmentDraft(e.target.value)}
                placeholder="Enter department or college"
                className="h-9 rounded-lg border border-yellow-300 bg-white px-3 text-xs text-gray-900 outline-none transition-colors focus:border-yellow-500 sm:h-10 sm:text-sm"
              />

              <button
                type="submit"
                disabled={
                  updatingId === selectedAccount._id || !departmentDraft.trim()
                }
                className="h-9 rounded-lg bg-black px-4 text-xs font-bold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 sm:h-10"
              >
                {updatingId === selectedAccount._id ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={closeDepartmentForm}
                className="h-9 rounded-lg border border-gray-300 px-4 text-xs font-bold text-gray-700 transition-colors hover:bg-white sm:h-10"
              >
                Cancel
              </button>
            </div>
          </div>

          {formError && (
            <p className="mt-3 text-xs font-semibold text-red-600">
              {formError}
            </p>
          )}
        </form>
      )}

      <div className="grid gap-2 md:hidden">
        {loading ? (
          <div className="rounded-lg border border-gray-100 bg-white p-4 text-center text-xs text-gray-500">
            Loading accounts...
          </div>
        ) : accounts.length === 0 ? (
          <div className="rounded-lg border border-gray-100 bg-white p-4 text-center text-xs text-gray-500">
            No accounts found.
          </div>
        ) : (
          accounts.map((account) => (
            <article
              key={account._id}
              className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold leading-tight text-gray-950">
                    {account.firstName} {account.lastName}
                  </h3>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {account.email}
                  </p>
                </div>
                <Badge type={account.role}>{account.role || "N/A"}</Badge>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div>
                  <dt className="font-black uppercase tracking-[0.14em] text-gray-400">
                    Department
                  </dt>
                  <dd className="mt-0.5 truncate text-gray-700">
                    {account.department || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="font-black uppercase tracking-[0.14em] text-gray-400">
                    Created
                  </dt>
                  <dd className="mt-0.5 text-gray-700">
                    {formatDate(account.createdAt)}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="font-black uppercase tracking-[0.14em] text-gray-400">
                    Created By
                  </dt>
                  <dd className="mt-0.5 truncate text-gray-700">
                    {account.createdBy || "System"}
                  </dd>
                </div>
              </dl>

              {isEditing && (
                <div className="mt-3">
                  {activeTab === "archived" ? (
                    <button
                      onClick={() => handleToggleArchive(account)}
                      disabled={updatingId === account._id}
                      className="h-8 w-full rounded-md border border-green-500 px-3 text-xs font-bold text-green-700 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updatingId === account._id ? "Updating..." : "Unarchive"}
                    </button>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      <button className="h-8 rounded-md border border-blue-500 px-2 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-50">
                        View
                      </button>
                      <button
                        onClick={() => openDepartmentForm(account)}
                        className="h-8 rounded-md border border-yellow-500 px-2 text-xs font-bold text-yellow-700 transition-colors hover:bg-yellow-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleArchive(account)}
                        disabled={updatingId === account._id}
                        className="h-8 rounded-md border border-red-500 px-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {updatingId === account._id ? "..." : "Archive"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-gray-100 md:block">
        <div className="min-w-[1040px]">
          <AdminTable headers={tableHeaders}>
            {loading ? (
              <tr>
                <td
                  colSpan={tableHeaders.length}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  Loading accounts...
                </td>
              </tr>
            ) : accounts.length === 0 ? (
              <tr>
                <td
                  colSpan={tableHeaders.length}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  No accounts found.
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr
                  key={account._id}
                  className="transition-colors duration-200 hover:bg-yellow-50/50"
                >
                  <td className="px-6 py-5 text-sm font-bold text-gray-950">
                    {account.firstName} {account.lastName}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {account.email}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {account.department || "N/A"}
                  </td>

                  <td className="px-6 py-5">
                    <Badge type={account.role}>{account.role || "N/A"}</Badge>
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {account.createdBy || "System"}
                  </td>

                  <td className="px-6 py-5 text-sm text-gray-600">
                    {formatDate(account.createdAt)}
                  </td>

                  {isEditing && (
                    <td className="px-6 py-5">
                      {activeTab === "archived" ? (
                        <button
                          onClick={() => handleToggleArchive(account)}
                          disabled={updatingId === account._id}
                          className="h-8 rounded-md border border-green-500 px-3 text-xs font-bold text-green-700 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingId === account._id
                            ? "Updating..."
                            : "Unarchive"}
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button className="h-8 rounded-md border border-blue-500 px-3 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-50">
                            View
                          </button>

                          <button
                            onClick={() => openDepartmentForm(account)}
                            className="h-8 rounded-md border border-yellow-500 px-3 text-xs font-bold text-yellow-700 transition-colors hover:bg-yellow-50"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleToggleArchive(account)}
                            disabled={updatingId === account._id}
                            className="h-8 rounded-md border border-red-500 px-3 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {updatingId === account._id
                              ? "Updating..."
                              : "Archive"}
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </AdminTable>
        </div>
      </div>

      {!loading && <PaginationControls />}
    </section>
  );
}
