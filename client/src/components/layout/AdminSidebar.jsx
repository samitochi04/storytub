import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  Film,
  FileText,
  Ticket,
  UserCog,
  DollarSign,
  Mail,
  BarChart3,
  Activity,
} from "lucide-react";
import { LogoIcon } from "@/components/shared/Logo";

const ADMIN_NAV = [
  { to: "/admin", icon: LayoutDashboard, key: "admin.dashboard", end: true },
  { to: "/admin/users", icon: Users, key: "admin.users" },
  { to: "/admin/videos", icon: Film, key: "admin.videos" },
  { to: "/admin/blog", icon: FileText, key: "admin.blog" },
  { to: "/admin/coupons", icon: Ticket, key: "admin.coupons" },
  { to: "/admin/staff", icon: UserCog, key: "admin.staff" },
  { to: "/admin/billing", icon: DollarSign, key: "admin.billing" },
  { to: "/admin/emails", icon: Mail, key: "admin.emails" },
  { to: "/admin/analytics", icon: BarChart3, key: "admin.analytics" },
  { to: "/admin/monitoring", icon: Activity, key: "admin.monitoring" },
];

export default function AdminSidebar() {
  const { t } = useTranslation();

  return (
    <aside className="flex flex-col w-[200px] min-h-screen border-r border-[var(--color-border-default)] bg-[var(--color-bg-card)] py-[var(--space-4)] px-[var(--space-3)]">
      {/* Brand */}
      <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-6)] px-[var(--space-2)]">
        <LogoIcon size={24} />
        <span className="text-[13px] font-bold text-[var(--color-text-primary)]">
          {t("admin.title")}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-[var(--space-1)]">
        {ADMIN_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-[var(--space-3)] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-sm)] text-[12px] transition-colors duration-150 ${
                  isActive
                    ? "bg-[var(--color-brand-blue)] text-white font-bold"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                }`
              }
            >
              <Icon size={16} strokeWidth={1.5} strokeLinecap="round" />
              {t(item.key)}
            </NavLink>
          );
        })}
      </nav>

      {/* Back to app */}
      <NavLink
        to="/dashboard"
        className="flex items-center gap-[var(--space-3)] px-[var(--space-3)] py-[var(--space-2)] rounded-[var(--radius-sm)] text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-colors duration-150 mt-[var(--space-4)]"
      >
        {t("admin.backToApp")}
      </NavLink>
    </aside>
  );
}
