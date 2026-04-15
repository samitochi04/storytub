import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";
import { Button, Badge } from "@/components/ui";
import { supabase } from "@/config/supabase";
import useAuthStore from "@/stores/authStore";

const TYPE_COLORS = {
  info: "secondary",
  success: "success",
  warning: "warning",
  error: "destructive",
};

export default function NotificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  function fetchNotifications() {
    setLoading(true);
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setNotifications(data || []);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchNotifications();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function markRead(id) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  }

  async function markAllRead() {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function deleteNotification(id) {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      <SEOHead title={t("notifications.title")} noindex />
      <div className="mx-auto max-w-[600px] px-[var(--space-4)] py-[var(--space-8)]">
        <div className="flex items-center justify-between">
          <h1 className="text-[20px] font-bold text-[var(--color-text-primary)]">
            {t("notifications.title")}
            {unreadCount > 0 && (
              <span className="ml-[var(--space-2)] text-[12px] font-normal text-[var(--color-text-tertiary)]">
                ({unreadCount})
              </span>
            )}
          </h1>
          {unreadCount > 0 && (
            <Button size="sm" variant="ghost" onClick={markAllRead}>
              <CheckCheck size={14} strokeWidth={1.5} />
              {t("notifications.markAllRead")}
            </Button>
          )}
        </div>

        <div className="mt-[var(--space-6)]">
          {loading ? (
            <p className="text-[12px] text-[var(--color-text-tertiary)]">
              {t("common.loading")}
            </p>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-[var(--space-2)] py-[var(--space-12)] text-center">
              <Bell
                size={24}
                strokeWidth={1.5}
                className="text-[var(--color-text-tertiary)]"
              />
              <p className="text-[13px] text-[var(--color-text-secondary)]">
                {t("notifications.empty")}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-[var(--space-2)]">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`group flex items-start gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] p-[var(--space-3)] shadow-[var(--shadow-sm)] transition-shadow ${
                    n.is_read
                      ? "bg-[var(--color-bg-card)]"
                      : "bg-[var(--color-brand-blue)]/[0.03] border-[var(--color-brand-blue)]/20"
                  }`}
                >
                  <div
                    className="mt-[2px] flex-1 cursor-pointer"
                    onClick={() => {
                      if (!n.is_read) markRead(n.id);
                      if (n.link) navigate(n.link);
                    }}
                  >
                    <div className="flex items-center gap-[var(--space-2)]">
                      <p className="text-[13px] font-bold text-[var(--color-text-primary)]">
                        {n.title}
                      </p>
                      <Badge
                        variant={TYPE_COLORS[n.type] || "secondary"}
                        className="text-[9px]"
                      >
                        {n.type}
                      </Badge>
                    </div>
                    <p className="mt-[var(--space-1)] text-[12px] text-[var(--color-text-secondary)]">
                      {n.message}
                    </p>
                    <p className="mt-[var(--space-1)] text-[11px] text-[var(--color-text-tertiary)]">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-[var(--space-1)] opacity-0 transition-opacity group-hover:opacity-100">
                    {!n.is_read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="rounded-[var(--radius-sm)] p-[4px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
                        title={t("notifications.markRead")}
                      >
                        <Check size={14} strokeWidth={1.5} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="rounded-[var(--radius-sm)] p-[4px] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-error)]"
                      title={t("notifications.delete")}
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
