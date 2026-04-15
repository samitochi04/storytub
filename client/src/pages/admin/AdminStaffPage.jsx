import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  Shield,
} from "lucide-react";
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "@/services/admin.service";

const RESOURCES = [
  "users",
  "videos",
  "blogs",
  "coupons",
  "subscriptions",
  "billing",
  "analytics",
  "emails",
  "monitoring",
  "staff",
];

const ROLE_COLORS = {
  admin:
    "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
  manager: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  agent: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function StaffModal({ staff, onClose, onSave, t }) {
  const isEdit = !!staff;
  const [form, setForm] = useState({
    email: staff?.email || "",
    display_name: staff?.display_name || "",
    password: "",
    role: staff?.role || "agent",
    avatar_url: staff?.avatar_url || "",
  });
  const [permissions, setPermissions] = useState(() => {
    if (!staff?.staff_permissions) return {};
    const map = {};
    for (const p of staff.staff_permissions) {
      map[p.resource] = {
        can_create: p.can_create,
        can_read: p.can_read,
        can_update: p.can_update,
        can_delete: p.can_delete,
      };
    }
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function togglePerm(resource, perm) {
    setPermissions((prev) => {
      const current = prev[resource] || {
        can_create: false,
        can_read: false,
        can_update: false,
        can_delete: false,
      };
      return {
        ...prev,
        [resource]: { ...current, [perm]: !current[perm] },
      };
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const permArray = Object.entries(permissions)
        .filter(
          ([, v]) => v.can_create || v.can_read || v.can_update || v.can_delete,
        )
        .map(([resource, perms]) => ({ resource, ...perms }));

      if (isEdit) {
        await onSave(staff.id, {
          display_name: form.display_name,
          role: form.role,
          avatar_url: form.avatar_url || undefined,
          permissions: permArray,
        });
      } else {
        await onSave(null, {
          email: form.email,
          display_name: form.display_name,
          password: form.password,
          role: form.role,
          avatar_url: form.avatar_url || undefined,
          permissions: permArray,
        });
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] p-[var(--space-6)] shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            {isEdit ? t("adminPages.editStaff") : t("adminPages.createStaff")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-[var(--space-3)] flex items-center gap-[var(--space-2)] text-[13px] text-[var(--color-error)]">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="mt-[var(--space-4)] space-y-[var(--space-3)]">
          {!isEdit && (
            <>
              <div>
                <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
                  {t("adminPages.email")}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
                  {t("adminPages.password")}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  minLength={8}
                  className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
              {t("adminPages.displayName")}
            </label>
            <input
              type="text"
              value={form.display_name}
              onChange={(e) => update("display_name", e.target.value)}
              required
              className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
              {t("adminPages.role")}
            </label>
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="mt-[var(--space-1)] w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-bg-input)] px-[var(--space-3)] py-[var(--space-2)] text-[13px] text-[var(--color-text-primary)] outline-none"
            >
              <option value="agent">Agent</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Permissions grid */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--color-text-secondary)]">
              {t("adminPages.permissions")}
            </label>
            <div className="mt-[var(--space-2)] overflow-x-auto rounded-[var(--radius-sm)] border border-[var(--color-border-default)]">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-[var(--color-border-default)] text-[var(--color-text-secondary)]">
                    <th className="px-[var(--space-3)] py-[var(--space-2)] text-left">
                      Resource
                    </th>
                    <th className="px-[var(--space-2)] py-[var(--space-2)] text-center">
                      Read
                    </th>
                    <th className="px-[var(--space-2)] py-[var(--space-2)] text-center">
                      Create
                    </th>
                    <th className="px-[var(--space-2)] py-[var(--space-2)] text-center">
                      Update
                    </th>
                    <th className="px-[var(--space-2)] py-[var(--space-2)] text-center">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {RESOURCES.map((res) => {
                    const p = permissions[res] || {};
                    return (
                      <tr
                        key={res}
                        className="border-b border-[var(--color-border-default)] last:border-0"
                      >
                        <td className="px-[var(--space-3)] py-[var(--space-2)] capitalize text-[var(--color-text-primary)]">
                          {res}
                        </td>
                        {[
                          "can_read",
                          "can_create",
                          "can_update",
                          "can_delete",
                        ].map((perm) => (
                          <td
                            key={perm}
                            className="px-[var(--space-2)] py-[var(--space-2)] text-center"
                          >
                            <input
                              type="checkbox"
                              checked={!!p[perm]}
                              onChange={() => togglePerm(res, perm)}
                              className="accent-[var(--color-brand-blue)]"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-[var(--space-6)] w-full rounded-[var(--radius-sm)] bg-[var(--color-brand-blue)] py-[var(--space-2)] text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-brand-blue-dark)] disabled:opacity-50"
        >
          {saving ? t("adminPages.saving") : t("adminPages.save")}
        </button>
      </form>
    </div>
  );
}

export default function AdminStaffPage() {
  const { t } = useTranslation();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    getStaff()
      .then(setStaffList)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(id, data) {
    if (id) {
      await updateStaff(id, data);
    } else {
      await createStaff(data);
    }
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm(t("adminPages.confirmDelete"))) return;
    try {
      await deleteStaff(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <SEOHead title="Admin Staff" noindex />
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
            {t("adminPages.staffTitle")}
          </h1>
          <button
            onClick={() => setModal("new")}
            className="flex items-center gap-[var(--space-2)] rounded-[var(--radius-sm)] bg-[var(--color-brand-blue)] px-[var(--space-4)] py-[var(--space-2)] text-[13px] font-medium text-white transition-colors hover:bg-[var(--color-brand-blue-dark)]"
          >
            <Plus size={16} />
            {t("adminPages.createStaff")}
          </button>
        </div>

        {error && (
          <div className="mt-[var(--space-4)] flex items-center gap-[var(--space-2)] text-[13px] text-[var(--color-error)]">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="mt-[var(--space-6)] overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-[var(--shadow-sm)]">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-border-default)] text-[12px] font-medium text-[var(--color-text-secondary)]">
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.name")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.email")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.role")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.status")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.lastLogin")}
                </th>
                <th className="px-[var(--space-4)] py-[var(--space-3)]">
                  {t("adminPages.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-[var(--space-8)] text-center">
                    <Loader2
                      size={20}
                      className="mx-auto animate-spin text-[var(--color-text-secondary)]"
                    />
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-[var(--space-8)] text-center text-[var(--color-text-secondary)]"
                  >
                    {t("adminPages.noResults")}
                  </td>
                </tr>
              ) : (
                staffList.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-[var(--color-border-default)] last:border-0 hover:bg-[var(--color-bg-hover)]"
                  >
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">
                      <div className="flex items-center gap-[var(--space-2)]">
                        <Shield
                          size={14}
                          className="text-[var(--color-text-tertiary)]"
                        />
                        <span className="text-[var(--color-text-primary)]">
                          {member.display_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-secondary)]">
                      {member.email}
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">
                      <span
                        className={`inline-flex rounded-full px-[var(--space-2)] py-[2px] text-[11px] font-medium capitalize ${ROLE_COLORS[member.role] || ""}`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">
                      <span
                        className={`inline-flex rounded-full px-[var(--space-2)] py-[2px] text-[11px] font-medium ${
                          member.is_active
                            ? "bg-green-100 text-[var(--color-success)] dark:bg-green-950/30"
                            : "bg-red-100 text-[var(--color-error)] dark:bg-red-950/30"
                        }`}
                      >
                        {member.is_active
                          ? t("adminPages.active")
                          : t("adminPages.inactive")}
                      </span>
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)] text-[var(--color-text-secondary)]">
                      {member.last_login_at
                        ? new Date(member.last_login_at).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-[var(--space-4)] py-[var(--space-3)]">
                      <div className="flex items-center gap-[var(--space-2)]">
                        <button
                          onClick={() => setModal(member)}
                          className="rounded-[var(--radius-xs)] p-[var(--space-1)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="rounded-[var(--radius-xs)] p-[var(--space-1)] text-[var(--color-error)] transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <StaffModal
          staff={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          t={t}
        />
      )}
    </>
  );
}
