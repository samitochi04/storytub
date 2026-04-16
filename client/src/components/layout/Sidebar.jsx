import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Sparkles,
  Film,
  CreditCard,
  Mic,
  HelpCircle,
  Settings,
  User,
} from "lucide-react";
import { LogoIcon } from "@/components/shared/Logo";
import CreditDisplay from "@/components/shared/CreditDisplay";
import NotificationBell from "@/components/shared/NotificationBell";
import { ThemeToggle } from "@/components/ui";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, key: "sidebar.dashboard" },
  { to: "/generate", icon: Sparkles, key: "sidebar.generate" },
  { to: "/videos", icon: Film, key: "sidebar.videos" },
  { to: "/billing", icon: CreditCard, key: "sidebar.billing" },
  { to: "/voices", icon: Mic, key: "sidebar.voices" },
  { to: "/support", icon: HelpCircle, key: "sidebar.support" },
];

const BOTTOM_ITEMS = [
  { to: "/settings", icon: Settings, key: "sidebar.settings" },
  { to: "/profile", icon: User, key: "sidebar.profile" },
];

function SidebarLink({ to, icon, labelKey, expanded }) {
  const Icon = icon;
  const { t } = useTranslation();
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-[var(--space-3)] h-[32px] rounded-[var(--radius-md)] transition-all duration-150 ${
          expanded ? "px-[var(--space-3)] w-full" : "justify-center w-[32px]"
        } ${
          isActive
            ? "bg-[var(--color-text-primary)] text-[var(--color-bg-page)]"
            : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
        }`
      }
    >
      <Icon
        size={18}
        strokeWidth={1.5}
        strokeLinecap="round"
        className="shrink-0"
      />
      {expanded && (
        <span className="text-[12px] font-normal whitespace-nowrap overflow-hidden">
          {t(labelKey)}
        </span>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`hidden md:flex flex-col items-center fixed left-0 top-0 h-screen z-30 border-r border-[var(--color-border-default)] bg-[var(--color-bg-card)] py-[var(--space-4)] gap-[var(--space-4)] transition-all duration-200 ease-in-out overflow-y-auto ${
        expanded ? "w-[180px] px-[var(--space-3)]" : "w-[60px]"
      }`}
    >
      {/* Logo */}
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-[var(--space-4)] self-center"
        aria-label="Go to dashboard"
      >
        <LogoIcon size={28} />
      </button>

      {/* Main nav */}
      <nav className="flex flex-1 flex-col items-center gap-[var(--space-4)] w-full">
        {NAV_ITEMS.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            labelKey={item.key}
            expanded={expanded}
          />
        ))}
        <NotificationBell expanded={expanded} />
      </nav>

      {/* Bottom nav */}
      <div className="flex flex-col items-center gap-[var(--space-4)] w-full">
        <CreditDisplay expanded={expanded} />
        <ThemeToggle expanded={expanded} />
        {BOTTOM_ITEMS.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            labelKey={item.key}
            expanded={expanded}
          />
        ))}
      </div>
    </aside>
  );
}
