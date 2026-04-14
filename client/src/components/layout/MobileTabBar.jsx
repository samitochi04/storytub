import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Sparkles,
  Film,
  CreditCard,
  User,
} from "lucide-react";

const MOBILE_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, key: "mobile.home" },
  { to: "/generate", icon: Sparkles, key: "mobile.create" },
  { to: "/videos", icon: Film, key: "mobile.videos" },
  { to: "/billing", icon: CreditCard, key: "mobile.billing" },
  { to: "/profile", icon: User, key: "mobile.profile" },
];

export default function MobileTabBar() {
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[var(--color-border-default)] bg-[var(--color-bg-card)] px-[var(--space-2)] py-[var(--space-2)] md:hidden">
      {MOBILE_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-[2px] text-[10px] transition-colors duration-150 ${
                isActive
                  ? "text-[var(--color-brand-blue)]"
                  : "text-[var(--color-text-tertiary)]"
              }`
            }
          >
            <Icon size={18} strokeWidth={1.5} strokeLinecap="round" />
            <span>{t(item.key)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
