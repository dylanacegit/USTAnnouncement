import StatCard from "../StatCard";
import {
  IoPersonOutline,
  IoArchiveOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";

export default function AccountStats({ accounts }) {
  const activeAccounts = accounts.filter(
    (account) => account.status?.toLowerCase() === "active"
  );

  const archivedAccounts = accounts.filter(
    (account) => account.status?.toLowerCase() === "archived"
  );

  const adminAccounts = accounts.filter(
    (account) => account.role?.toLowerCase() === "admin"
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Active Accounts"
        value={activeAccounts.length}
        subtext="Currently active"
        icon={IoPersonOutline}
      />

      <StatCard
        title="Archived Accounts"
        value={archivedAccounts.length}
        subtext="Hidden from active list"
        icon={IoArchiveOutline}
      />

      <StatCard
        title="Admin Accounts"
        value={adminAccounts.length}
        subtext="Users with admin access"
        icon={IoShieldCheckmarkOutline}
      />
    </div>
  );
}