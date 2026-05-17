import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiEdit3,
  FiLock,
  FiMail,
  FiMessageSquare,
  FiShield,
  FiSliders,
  FiTrash2,
  FiUser,
} from "react-icons/fi";
import {
  deleteAccount,
  getAccounts,
  updateAccountProfile,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const emptyProfile = {
  firstName: "",
  lastName: "",
  email: "",
  department: "",
};

const settingsTabs = [
  {
    id: "profile",
    label: "Profile",
    description: "Admin identity and contact details",
    icon: FiUser,
  },
  {
    id: "content",
    label: "Content Defaults",
    description: "Publishing rules and default values",
    icon: FiSliders,
  },
  {
    id: "assistant",
    label: "AI Assistant",
    description: "Tiggy behavior and knowledge scope",
    icon: FiMessageSquare,
  },
  {
    id: "security",
    label: "Security",
    description: "Sessions and account protection",
    icon: FiLock,
  },
];

function formatDate(date) {
  if (!date) return "Not available";

  return new Date(date).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function ComingSoonPanel({ tab }) {
  const Icon = tab.icon;

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex max-w-2xl items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700">
          <Icon />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-700">
            Coming Next
          </p>
          <h2 className="mt-1 font-playfair text-2xl font-bold text-gray-950">
            {tab.label}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            This tab is reserved for {tab.description.toLowerCase()}. Keeping it
            visible now gives the Settings page a stable structure as more
            admin controls are added.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getAccounts();
        const accountList = Array.isArray(data) ? data : data.accounts || [];
        const currentAccount =
          accountList.find(
            (account) =>
              account._id === user?.id ||
              account.id === user?.id ||
              account.email === user?.email
          ) ||
          accountList.find(
            (account) =>
              account.role?.toLowerCase() === "admin" &&
              account.status?.toLowerCase() !== "archived"
          ) ||
          accountList[0] ||
          null;

        setAccounts(accountList);
        setSelectedAccount(currentAccount);

        if (currentAccount) {
          setProfile({
            firstName: currentAccount.firstName || "",
            lastName: currentAccount.lastName || "",
            email: currentAccount.email || "",
            department: currentAccount.department || "",
          });
        }
      } catch (loadError) {
        setError(loadError.message || "Failed to load profile settings.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const fullName = useMemo(() => {
    if (!selectedAccount) return "Admin Profile";
    return `${selectedAccount.firstName || ""} ${
      selectedAccount.lastName || ""
    }`.trim();
  }, [selectedAccount]);

  const initials = useMemo(() => {
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`
      .trim()
      .toUpperCase() || "AD";
  }, [profile.firstName, profile.lastName]);

  const updateProfileField = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setMessage("");
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!selectedAccount?._id) {
      setError("No account is available to update.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const updatedAccount = await updateAccountProfile(selectedAccount._id, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        department: profile.department,
      });

      setSelectedAccount(updatedAccount);
      setAccounts((current) =>
        current.map((account) =>
          account._id === updatedAccount._id ? updatedAccount : account
        )
      );

      setMessage("Profile details updated.");
    } catch (saveError) {
      setError(saveError.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAccount?._id || deleteConfirm !== "DELETE") return;

    try {
      setDeleting(true);
      setError("");
      await deleteAccount(selectedAccount._id);
      signOut();
      navigate("/");
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete account.");
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 sm:space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-gray-950 sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          Manage account preferences and system controls from one place.
        </p>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
        <div className="grid gap-2 md:grid-cols-4">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-start gap-3 rounded-lg p-3 text-left transition-all duration-300 ${
                  isActive
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-600 hover:-translate-y-0.5 hover:bg-gray-50 hover:text-gray-950"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isActive
                      ? "bg-yellow-400 text-black"
                      : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  <Icon />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black">{tab.label}</span>
                  <span
                    className={`mt-1 block text-xs leading-5 ${
                      isActive ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {tab.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {activeTab === "profile" ? (
        loading ? (
        <section className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
          Loading profile settings...
        </section>
      ) : !selectedAccount ? (
        <section className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
          No admin account was found.
        </section>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-black text-lg font-black text-yellow-400">
                  {initials}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-700">
                    Admin Account
                  </p>
                  <h2 className="mt-1 font-playfair text-2xl font-bold text-gray-950">
                    {fullName}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedAccount.email}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-xs font-bold text-green-700">
                <FiCheckCircle />
                {selectedAccount.status || "Active"}
              </div>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-gray-500">
                    <FiUser /> First Name
                  </span>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) =>
                      updateProfileField("firstName", e.target.value)
                    }
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition-colors focus:border-yellow-500"
                  />
                </label>

                <label className="space-y-2">
                  <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-gray-500">
                    <FiUser /> Last Name
                  </span>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) =>
                      updateProfileField("lastName", e.target.value)
                    }
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition-colors focus:border-yellow-500"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-gray-500">
                  <FiMail /> Email Address
                </span>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateProfileField("email", e.target.value)}
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition-colors focus:border-yellow-500"
                />
              </label>

              <label className="block space-y-2">
                <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] text-gray-500">
                  <FiShield /> Department or Office
                </span>
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) =>
                    updateProfileField("department", e.target.value)
                  }
                  placeholder="Enter department, college, or office"
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition-colors focus:border-yellow-500"
                />
              </label>

              {(message || error) && (
                <p
                  className={`text-sm font-semibold ${
                    error ? "text-red-600" : "text-green-700"
                  }`}
                >
                  {error || message}
                </p>
              )}

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiEdit3 />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-5">
            <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="font-playfair text-xl font-bold text-gray-950">
                Account Details
              </h2>
              <div className="mt-4 grid gap-3">
                <DetailItem label="Role" value={selectedAccount.role || "Admin"} />
                <DetailItem
                  label="Created By"
                  value={selectedAccount.createdBy || "System"}
                />
                <DetailItem
                  label="Created At"
                  value={formatDate(selectedAccount.createdAt)}
                />
                <DetailItem
                  label="Known Accounts"
                  value={`${accounts.length} total`}
                />
              </div>
            </section>

            <section className="rounded-lg border border-red-200 bg-red-50/60 p-4 shadow-sm sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <FiAlertTriangle />
                </div>
                <div>
                  <h2 className="font-playfair text-xl font-bold text-gray-950">
                    Delete Account
                  </h2>
                  <p className="mt-1 text-sm text-red-700">
                    This permanently removes this admin account from the
                    database.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDeleteOpen(true);
                  setDeleteConfirm("");
                }}
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-500 bg-white px-4 text-sm font-bold text-red-600 transition-colors hover:bg-red-600 hover:text-white"
              >
                <FiTrash2 />
                Delete My Account
              </button>
            </section>
          </aside>
        </div>
        )
      ) : (
        <ComingSoonPanel tab={settingsTabs.find((tab) => tab.id === activeTab)} />
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <section className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <FiTrash2 />
              </div>
              <div>
                <h2 className="font-playfair text-2xl font-bold text-gray-950">
                  Confirm Deletion
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Type DELETE to remove {fullName || "this account"}. This
                  cannot be undone.
                </p>
              </div>
            </div>

            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="mt-4 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition-colors focus:border-red-500"
              placeholder="DELETE"
            />

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteConfirm !== "DELETE" || deleting}
                className="h-10 rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
