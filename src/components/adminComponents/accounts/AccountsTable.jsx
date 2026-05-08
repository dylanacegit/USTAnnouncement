import AdminTable from "../AdminTable";
import Badge from "../Badge";

export default function AccountsTable({
  accounts,
  activeTab,
  setActiveTab,
  loading,
}) {
  const tableHeaders = [
    "Name",
    "Email",
    "Department",
    "Role",
    "Created By",
    "Created At",
    "Actions",
  ];

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-PH", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 text-xs font-bold uppercase tracking-widest">
          <button
            onClick={() => setActiveTab("active")}
            className={
              activeTab === "active"
                ? "text-black"
                : "text-gray-400 hover:text-gray-600"
            }
          >
            Active
          </button>

          <span className="text-gray-300">|</span>

          <button
            onClick={() => setActiveTab("archived")}
            className={
              activeTab === "archived"
                ? "text-black"
                : "text-gray-400 hover:text-gray-600"
            }
          >
            Archived
          </button>
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

      <AdminTable headers={tableHeaders}>
        {loading ? (
          <tr>
            <td
              colSpan={tableHeaders.length}
              className="px-6 py-6 text-center text-sm text-gray-500"
            >
              Loading accounts...
            </td>
          </tr>
        ) : accounts.length === 0 ? (
          <tr>
            <td
              colSpan={tableHeaders.length}
              className="px-6 py-6 text-center text-sm text-gray-500"
            >
              No accounts found.
            </td>
          </tr>
        ) : (
          accounts.map((account) => (
            <tr
              key={account._id}
              className="hover:bg-gray-50/50 transition-colors"
            >
              <td className="px-6 py-4 text-sm font-bold text-gray-900">
                {account.firstName} {account.lastName}
              </td>

              <td className="px-6 py-4 text-sm text-gray-600">
                {account.email}
              </td>

              <td className="px-6 py-4 text-sm text-gray-600">
                {account.department || "N/A"}
              </td>

              <td className="px-6 py-4">
                <Badge type={account.role}>{account.role || "N/A"}</Badge>
              </td>

              <td className="px-6 py-4 text-sm text-gray-600">
                {account.createdBy || "System"}
              </td>

              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(account.createdAt)}
              </td>

              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button className="border border-gray-400 px-3 py-1 text-xs hover:bg-gray-100">
                    View
                  </button>

                  <button className="border border-gray-400 px-3 py-1 text-xs hover:bg-gray-100">
                    Edit
                  </button>

                  <button className="border border-red-400 text-red-600 px-3 py-1 text-xs hover:bg-red-50">
                    Archive
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}