import AdminTable from "./AdminTable";

export default function DataTable({
  headers,
  children,
  tabs = [
    { label: "Active", value: "active" },
    { label: "Archived", value: "archived" },
  ],
  activeTab,
  setActiveTab,
  loading = false,
  emptyMessage = "No data found.",
  loadingMessage = "Loading...",
}) {
  const isEmpty =
    !loading &&
    (!children ||
      (Array.isArray(children) && children.length === 0) ||
      (Array.isArray(children) &&
        children.every((c) => c === null || c === undefined)));

  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-4">
      {/* Tab Bar + Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 text-xs font-bold uppercase tracking-widest">
          {tabs.map((tab, index) => (
            <span key={tab.value} className="flex items-center gap-2">
              {index > 0 && <span className="text-gray-300">|</span>}
              <button
                onClick={() => setActiveTab(tab.value)}
                className={
                  activeTab === tab.value
                    ? "text-black"
                    : "text-gray-400 hover:text-gray-600"
                }
              >
                {tab.label}
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <button className="border border-gray-700 px-3 py-1 text-xs hover:bg-black hover:text-white transition-colors">
            Create
          </button>
          <button className="border border-gray-700 px-3 py-1 text-xs hover:bg-black hover:text-white transition-colors">
            Edit
          </button>
        </div>
      </div>

      {/* Table */}
      <AdminTable headers={headers}>
        {loading ? (
          <tr>
            <td
              colSpan={headers.length}
              className="px-6 py-6 text-center text-sm text-gray-500"
            >
              {loadingMessage}
            </td>
          </tr>
        ) : isEmpty ? (
          <tr>
            <td
              colSpan={headers.length}
              className="px-6 py-6 text-center text-sm text-gray-500"
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          children
        )}
      </AdminTable>
    </div>
  );
}
