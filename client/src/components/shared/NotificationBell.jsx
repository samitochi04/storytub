import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import { supabase } from "@/config/supabase";
import useAuthStore from "@/stores/authStore";

export default function NotificationBell({ expanded = false }) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false)
      .then(({ count }) => setUnread(count || 0));

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => setUnread((prev) => prev + 1),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <NavLink
      to="/notifications"
      title={t("sidebar.notifications")}
      className={({ isActive }) =>
        `relative flex items-center gap-[var(--space-3)] h-[32px] rounded-[var(--radius-md)] transition-all duration-150 ${
          expanded ? "px-[var(--space-3)] w-full" : "justify-center w-[32px]"
        } ${
          isActive
            ? "bg-[var(--color-text-primary)] text-[var(--color-bg-page)]"
            : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
        }`
      }
    >
      <Bell
        size={18}
        strokeWidth={1.5}
        strokeLinecap="round"
        className="shrink-0"
      />
      {expanded && (
        <span className="text-[12px] font-normal whitespace-nowrap overflow-hidden">
          {t("sidebar.notifications")}
        </span>
      )}
      {unread > 0 && (
        <span
          className={`absolute ${expanded ? "left-[22px] top-[2px]" : "-top-[2px] -right-[2px]"} flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[var(--color-error)] px-[3px] text-[9px] font-bold text-white`}
        >
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </NavLink>
  );
}
