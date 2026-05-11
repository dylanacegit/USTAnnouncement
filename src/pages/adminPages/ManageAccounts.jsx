import { useEffect, useMemo, useState } from "react";
import AccountStats from "../../components/adminComponents/accounts/AccountStats";
import AccountFilters from "../../components/adminComponents/accounts/AccountFilters";
import AccountsTable from "../../components/adminComponents/accounts/AccountsTable";

export default function ManageAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("az");
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/accounts`);

        if (!res.ok) {
          throw new Error("Failed to fetch accounts");
        }

        const data = await res.json();

        const accountsData = Array.isArray(data) ? data : data.accounts || [];

        setAccounts(accountsData);
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [API_URL]);

  const filteredAccounts = useMemo(() => {
    let result = accounts.filter((account) => {
      const status = account.status?.toLowerCase();

      if (activeTab === "active") {
        return status === "active" || status === "published";
      }

      if (activeTab === "archived") {
        return status === "archived";
      }

      return true;
    });

    if (searchTerm.trim()) {
      const keyword = searchTerm.toLowerCase();

      result = result.filter((account) => {
        const fullName = `${account.firstName || ""} ${
          account.lastName || ""
        }`.toLowerCase();

        return (
          fullName.includes(keyword) ||
          account.email?.toLowerCase().includes(keyword)
        );
      });
    }

    result.sort((a, b) => {
      const nameA = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
      const nameB = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();

      if (sortBy === "az") return nameA.localeCompare(nameB);
      if (sortBy === "za") return nameB.localeCompare(nameA);
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);

      return 0;
    });

    return result;
  }, [accounts, activeTab, searchTerm, sortBy]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900">
          Manage Accounts
        </h1>
        <p className="text-sm text-gray-500">
          View, search, and manage admin accounts.
        </p>
      </div>

      <AccountStats accounts={accounts} />

      <AccountFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <AccountsTable
        accounts={filteredAccounts}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loading={loading}
      />
    </div>
  );
}
