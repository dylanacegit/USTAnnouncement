import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AccountStats from "../../components/adminComponents/accounts/AccountStats";
import AccountFilters from "../../components/adminComponents/accounts/AccountFilters";
import AccountsTable from "../../components/adminComponents/accounts/AccountsTable";
import {
  createAccount,
  getAccounts,
  updateAccountDepartment,
  updateAccountStatus,
} from "../../services/api";

const ACCOUNTS_PER_PAGE = 10;

export default function ManageAccounts() {
  const location = useLocation();
  const [accounts, setAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("az");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getAccounts();
        const accountsData = Array.isArray(data) ? data : data.accounts || [];

        setAccounts(accountsData);
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search") || "";
    const tab = params.get("tab");

    if (["active", "archived"].includes(tab)) {
      setActiveTab(tab);
    }

    setSearchTerm(query);
  }, [location.search]);

  const accountsForActiveTab = useMemo(() => {
    return accounts.filter((account) => {
      const status = account.status?.toLowerCase();

      if (activeTab === "active") {
        return status === "active" || status === "published";
      }

      if (activeTab === "archived") {
        return status === "archived";
      }

      return true;
    });
  }, [accounts, activeTab]);

  const departmentOptions = useMemo(() => {
    return Array.from(
      new Set(
        accountsForActiveTab
          .map((account) => account.department?.trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [accountsForActiveTab]);

  const roleOptions = useMemo(() => {
    return Array.from(
      new Set(
        accountsForActiveTab
          .map((account) => account.role?.trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [accountsForActiveTab]);

  useEffect(() => {
    if (
      departmentFilter !== "all" &&
      !departmentOptions.includes(departmentFilter)
    ) {
      setDepartmentFilter("all");
    }
  }, [departmentFilter, departmentOptions]);

  useEffect(() => {
    if (roleFilter !== "all" && !roleOptions.includes(roleFilter)) {
      setRoleFilter("all");
    }
  }, [roleFilter, roleOptions]);

  const handleToggleArchive = async (account) => {
    const nextStatus =
      account.status?.toLowerCase() === "archived" ? "active" : "archived";
    const updatedAccount = await updateAccountStatus(account._id, nextStatus);

    setAccounts((current) =>
      current.map((item) =>
        item._id === account._id ? { ...item, ...updatedAccount } : item
      )
    );
  };

  const handleUpdateDepartment = async (account, department) => {
    const updatedAccount = await updateAccountDepartment(
      account._id,
      department
    );

    setAccounts((current) =>
      current.map((item) =>
        item._id === account._id ? { ...item, ...updatedAccount } : item
      )
    );
  };

  const handleCreateAccount = async (accountData) => {
    const createdAccount = await createAccount(accountData);

    setAccounts((current) => [createdAccount, ...current]);
  };

  const filteredAccounts = useMemo(() => {
    let result = [...accountsForActiveTab];

    if (searchTerm.trim()) {
      const keyword = searchTerm.toLowerCase();

      result = result.filter((account) => {
        const fullName = `${account.firstName || ""} ${
          account.lastName || ""
        }`.toLowerCase();

        return (
          fullName.includes(keyword) ||
          account.email?.toLowerCase().includes(keyword) ||
          account.department?.toLowerCase().includes(keyword) ||
          account.role?.toLowerCase().includes(keyword) ||
          account.createdBy?.toLowerCase().includes(keyword)
        );
      });
    }

    if (departmentFilter !== "all") {
      result = result.filter(
        (account) => account.department === departmentFilter
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((account) => account.role === roleFilter);
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
  }, [accountsForActiveTab, searchTerm, departmentFilter, roleFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAccounts.length / ACCOUNTS_PER_PAGE)
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, departmentFilter, roleFilter, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * ACCOUNTS_PER_PAGE;
    return filteredAccounts.slice(startIndex, startIndex + ACCOUNTS_PER_PAGE);
  }, [filteredAccounts, currentPage]);

  return (
    <div className="mx-auto max-w-[1800px] space-y-5 sm:space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-gray-950 sm:text-3xl">
          Manage Accounts
        </h1>
        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          View, search, and manage registered users.
        </p>
      </div>

      <AccountStats accounts={accounts} />

      <AccountFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        departmentOptions={departmentOptions}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        roleOptions={roleOptions}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <AccountsTable
        accounts={paginatedAccounts}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        loading={loading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalAccounts={filteredAccounts.length}
        totalPages={totalPages}
        pageSize={ACCOUNTS_PER_PAGE}
        onToggleArchive={handleToggleArchive}
        onUpdateDepartment={handleUpdateDepartment}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  );
}
